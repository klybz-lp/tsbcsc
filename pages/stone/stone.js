const App = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        keyword: "",
        species_id: "",
        species_text: "品种",
        color_id: "",
        color_text: "颜色",
        texture_id: "",
        texture_text: "纹理",
        showIcon: true,
        currentIndex: 0,
        currentTab: 0,
        stoneType: [],
        stone: [],
        last_page: 1,
        page: 0,
        page_size: 10,
        noData: false,
        showApplyDialog: false,
        applyData: null,
        speciesHeight: 0,
        sortIndex: null,
        sortField: null, //排序字段
        sortRule: 0, //排序规则,1表示倒序
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        console.log(options)
        this.getStoneType();
        this.getList();
        let that = this;
        wx.createSelectorQuery().select('#stone_species').boundingClientRect(function (rect) {
            that.setData({
                speciesHeight: rect.height
            });
        }).exec()
    
    },

    onShow: function () {
        //this.getUserLocation();
        // var pages = getCurrentPages();
        // let currentPage = pages[pages.length - 1]; 
        // let route = currentPage['route'];
        // App.globalData.pages.push(route)
    },

    onPageScroll: function (e) {
        this.setData({
            scrollTop: e.scrollTop
        });
    },

    /**
     * 产品列表
     */
    getList: function () {
        wx.showNavigationBarLoading();
        if (this.data.page >= this.data.last_page) {
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
                species_id: this.data.species_id,
                color_id: this.data.color_id,
                texture_id: this.data.texture_id,
                keyword: this.data.keyword,
                sortField: this.data.sortField,
                sortRule: this.data.sortRule,
            }
            App.get(App.api.stoneLists, param, { loading: false }).then(result => {
                wx.hideNavigationBarLoading();
                this.setData({
                    stone: [...this.data.stone, ...result.data],
                    last_page: result.last_page
                });
                if (result.last_page < 2) {
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
     * 产品特征
     */
    getStoneType: function () {
        App.get(App.api.stoneType, {}, { loading: false }).then(result => {
            this.setData({
                stoneType: result
            });
        }).catch(err => {
            console.log(err);
        })
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
     * 索取样品
     */
    apply: function (e) {
        // 判断是否登录
        if(!App.checkIsLogin()){
            App.showError('请登录后操作', function(){
                wx.navigateTo({
                    url: '../login/login',
                });
            });
        
            return false;
        }
        let item = e.currentTarget.dataset.item;
        console.log(item.id)
        this.setData({
            showApplyDialog: true,
            applyData: { stone_id: item.id, store_id: item.store_id, pic: item.stone_cover }
        });
    },

    /**
     * 接收子组件传递的值
     */
    hideApply: function (e) {
        this.setData({
            showApplyDialog: e.detail.showApplyDialog,
            applyData: {}
        });
    },

    searchStone: function (e) {
        this.setData({
            page: 0,
            last_page: 1,
            stone: [],
            noData: false
        });
        this.getList();
    },

    /**
     * tab切换
     */
    toggleTab: function (e) {
        let index = e.currentTarget.dataset.id;
        let current = (this.data.currentIndex == index) ? 0 : index
        let tab = this.data.currentTab ? 0 : index;
        this.setData({
            currentIndex: current,
            currentTab: tab
        });
    },

    /**
     * 品种切换
     */
    selecSpecies: function (e) {
        console.log(e.currentTarget.dataset)
        let species_id = e.currentTarget.dataset.id;

        this.setData({
            species_id,
            currentTab: 0,
            page: 0,
            last_page: 1,
            stone: [],
            noData: false
        });
        this.getList();

    },

    /**
     * 排序
     */
    sort: function (e) {
        let data = e.currentTarget.dataset;
        let sortField = data.field;
        let sortIndex = data.index;
        let sortRule = (this.data.sortRule == 0) ? 1 : 0;
        this.setData({
            sortField,
            sortIndex,
            sortRule,
            currentTab: 0,
            page: 0,
            last_page: 1,
            stone: [],
            noData: false
        });
        this.getList();
    },

    /**
     * 下拉选中
     */
    selectItem: function (e) {
        var type = e.currentTarget.dataset.type;
        var index = e.currentTarget.dataset.index;

        if (type == "species") {
            var localType = this.data.stoneType['species'][index];
            this.setData({
                species_id: localType.id,
                species_text: localType.name
            });
        } else if (type == "color") {
            var localType = this.data.stoneType['color'][index];
            this.setData({
                color_id: localType.id,
                color_text: localType.name
            });
        } else if (type == "texture") {
            var localType = this.data.stoneType['texture'][index];
            this.setData({
                texture_id: localType.id,
                texture_text: localType.name
            });
        }
        this.setData({
            currentTab: 0,
            page: 0,
            last_page: 1,
            stone: [],
            noData: false
        });
        this.getList();
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {
        var that = this;
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