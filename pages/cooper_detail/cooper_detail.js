const App = getApp()
let store = require("../../utils/store.js");  //数据存储库
Page({

    /**
     * 页面的初始数据
     */
    data: {
        currentTab: 1,
        current: 0,
        case: [],
        cooper: [],
        last_page: 1,
        page: 0,
        page_size: 10,
        isFav: false,
        noData: false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let cooper_id = options.id;
        this.getCase(cooper_id);
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        let pages = getCurrentPages();
        let currentPage = [...pages].pop();
        let options = currentPage.options;
        console.log(options.id)
        this.getDetail(options.id);
    },

    getDetail: function (id){
        App.get(App.api.cooperDetail, {id: id}).then(result => {
            //let commentLength = result.comments.length;
            this.setData({
                cooper: result,
            });
            this.isFav();
        }).catch(err => {
            console.log(err);
        })
    },

     /**
     * 案例列表
     */
    getCase: function (cooper_id) {
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
                cooper_id: cooper_id
            }
            App.get(App.api.cooperCaseList, param, { loading: false }).then(result => {
                wx.hideNavigationBarLoading();
                this.setData({
                    case: [...this.data.case, ...result.data],
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
     * 判断是否收藏
     */
    isFav: function (e) {
        if (App.checkIsLogin()) {
            let cooper_id = this.data.cooper.id;
            App.post(App.api.isFav, { cooper_id: cooper_id, user_id: store.getItem('user_id') }, { loading: false, token: store.getItem('token') }).then(result => {
                this.setData({
                    isFav: result.msg
                });
            }).catch(err => {
                console.log(err);
            })
        }
    },

    /**
     * 收藏
     */
    fav: function (e) {
        // 判断是否登录
        if(!App.checkIsLogin()){
            App.showError('请登录后操作', function(){
                wx.navigateTo({
                    url: '../login/login',
                });
            });
        
            return false;
        }
        let cooper_id = this.data.cooper.id;
        App.post(App.api.addFav, {cooper_id: cooper_id, user_id: store.getItem('user_id')}, {loading: false, token: store.getItem('token')}).then(result => {   
            this.setData({isFav: !this.data.isFav});
            wx.showToast({
                title: result.msg,
                icon: 'success',
                duration: 2000
            })
        }).catch(err => {
            console.log(err);        
        })
    },

    /**
     * 拨打电话
     */
    call: function (e) {
        let mobile = this.data.cooper.mobile;
        App.call(mobile);
    },

    /**
     * tab切换
     */
    selectTab: function (e) {
        var currentTab = e.currentTarget.dataset.id;
        this.setData({
            currentTab
        });
    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        let cooper_id = this.data.cooper.id;
        let currentTab = this.data.currentTab
        if(currentTab == 1) {
            this.getCase(cooper_id);
        }
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})