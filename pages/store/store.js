const App = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        showIcon: true,
        keyword: "",
        category_id: 0,
        storeCategory: [],
        store: [],
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
        this.setData({
            category_id
        });
        this.getStore();
        this.getList();

        // let params = {
        //     data: {
        //         token: 'uf3kQLmgBKG40YH2OreqjxRXwlIJnsME',
        //         keyword: ''
        //     },
        //     page: {
        //         pageCurrent: 1,
        //         pageSize: 10
        //     }
        // }
        // App.post(App.api.stStoneList, params, { loading: false }).then(result => {
        //     console.log(result)
        // }).catch(err => {
        //     console.log(err);
        // })
    },

    /**
     * 品牌分类
     */
    getStore: function () {
        App.get(App.api.storeRecommend, {}, { loading: false }).then(result => {
    
            this.setData({
                storeCategory: result,
            });
        }).catch(err => {
            console.log(err);
        })
    },

    /**
     * 商家列表
     */
    getList: function () {
        wx.showNavigationBarLoading();
        if(this.data.page >= this.data.last_page){
            wx.hideNavigationBarLoading();
            console.log("数据加载完成")
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
            App.get(App.api.storeList, param, { loading: false }).then(result => {
                wx.hideNavigationBarLoading();
                this.setData({
                    store: [...this.data.store, ...result.data],
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
     * 拨打电话
     */
    call: function (e) {
        let mobile = e.currentTarget.dataset.mobile;
        App.call(mobile);
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
            store: [],
            keyword: "",
            noData: false,
        });
        this.getList();
    },

    /**
     * 搜索
     */
    searchStore: function(e) {
        this.setData({
            page: 0,
            category_id: 0,
            last_page: 1,
            store: [],
            noData: false
        });
        this.getList();
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {

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