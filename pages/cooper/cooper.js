const App = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        showIcon: true,
        keyword: "",
        category_id: 0,
        cooperCategory: [],
        cooper: [],
        last_page: 1,
        page: 0,
        page_size: 10,
        noData: false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let category_id = options.id || 0;
        console.log(category_id)
        this.setData({
            category_id
        });
        this.getCategory();
        this.getList();
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

    },

    /**
     * 合作分类
     */
    getCategory: function () {
        App.get(App.api.cooperCategory).then(result => {
            this.setData({
                cooperCategory: result
            });
        }).catch(err => {
            console.log(err);
        })
    },

    /**
     * 合作列表
     */
    getList: function () {
        wx.showNavigationBarLoading();
        if(this.data.page >= this.data.last_page){
            wx.hideNavigationBarLoading();
            this.setData({
                noData: true
            });
        } else {
            this.setData({
                page: ++this.data.page,
            });
            let param = {
                page: this.data.page,
                page_size: this.data.page_size,
                category_id: this.data.category_id,
                keyword: this.data.keyword
            }
            App.get(App.api.cooperList, param, { loading: false }).then(result => {
                wx.hideNavigationBarLoading();
                this.setData({
                    cooper: [...this.data.cooper, ...result.data],
                    last_page: result.last_page
                });
                if(result.last_page < 2){
                    this.setData({
                        noData: true
                    });
                }
            }).catch(err => {
                console.log(err);
            })
        }
    }, 

    /**
     * foucs
     */
    inputFocus: function (e) {
        this.setData({
            showIcon: false
        });
    },

    /**
     * blur
     */
    blurFocus: function (e) {
        this.setData({
            showIcon: true
        });
    },

     /**
     * 搜索
     */
    inputSearch: function (e) {
        let keyword = e.detail.value;
        this.setData({
            keyword
        });
    },

    /**
     * 分类切换
     */
    selectTab: function (e) {
        let category_id = e.currentTarget.dataset.id;
        this.setData({
            category_id,
            page: 0,
            last_page: 1,
            cooper: [],
            keyword: "",
            noData: false
        });
        this.getList();
    },

    /**
     * 搜索
     */
    searchCooper: function(e) {
        this.setData({
            page: 0,
            category_id: 0,
            last_page: 1,
            cooper: [],
            noData: false
        });
        this.getList();
    },

    /**
     * 拨打电话
     */
    call: function (e) {
        let mobile = e.currentTarget.dataset.mobile;
        App.call(mobile);
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        this.getList();
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})