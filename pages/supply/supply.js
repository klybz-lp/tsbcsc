const App = getApp();
let store = require("../../utils/store.js");  //数据存储库
Page({

    /**
     * 页面的初始数据
     */
    data: {
        supply: [],
        detail: null,
        showDetail: false,
        last_page: 1,
        page: 0,
        pics: [],
        page_size: 10,
        type: 0,
        noData: false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let id = options.id;
        if(id){
            App.get(App.api.supplyDetail, {id: id}).then(result => {
                if(result.type == 2){
                    this.viewDetail(result);
                } else {
                    this.setData({
                        detail: result,
                        showDetail: true,
                        showContact: true
                    });
                }
            }).catch(err => {
                console.log(err);
            })
        }
    
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        //判断是否为商家
        App.checkIsStore(res => {
            if(res == 2){
                this.getList(true);
            } else {
                this.getList();
            }
        });
    },

    /**
     * 供求列表
     */
    getList: function (flag) {
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
                type: this.data.type,
                page_size: this.data.page_size
            }
            App.get(App.api.supplyList, param, { loading: false }).then(result => {
                wx.hideNavigationBarLoading();
                result.data.forEach(item => {
                    item.pics = item.images.slice(0,3);
                });
                if(!flag){ //入驻商家
                    result.data.forEach(item => {
                        item.user_name = item.user_name.replace(/(.{1})(.{1,})/g, "$1**");
                        item.mobile = item.mobile.replace(/(.{3})(.{1,})/g, "$1********");
                    });
                }
                

                this.setData({
                    supply: [...this.data.supply, ...result.data],
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

    setType: function (e) {
        let type = e.target.dataset.type;
        let _this = this;
        this.setData({
            type,
            page: 0,
            last_page: 1,
            noData: false,
            supply: [],
        }, function(){
            this.getList();
        })
        console.log(e.target.dataset)
    },

    /**
     * 查看供求详情
     */
    view: function (e) {
        let item = e.target.dataset.item;
        //判断是否登录
        // if(!App.checkIsLogin()){
        //     App.showError('请登录后操作', function(){
        //         wx.navigateTo({
        //             url: '../login/login',
        //         });
        //     });
        
        //     return false;
        // }
        
        if(item.type == 2){
            this.viewDetail(item);
        } else {
            this.setData({
                detail: item,
                showDetail: true,
                showContact: true
            });
        }
    },

    /**
     * 图片预览
     */
    previewImage: function (e) {
        let src = e.currentTarget.dataset.src;
        let pics = e.currentTarget.dataset.pics;
        pics = pics.map((item) => item.file_path);
        console.log(pics);
        wx.previewImage({
            current: src,
            urls: pics,
            success: function (e) {
                console.log(e)
            },
            fail: function (e) {
                console.log(e)
            }
        })
    },

    viewDetail: function (item) {
        // if (!App.checkIsLogin()) {
        //     App.showError('请登录后操作', function(){
        //         wx.navigateTo({
        //             url: '../login/login',
        //         });
        //     });
        //     return false;
        // }
        //判断是否为商家
        App.checkIsStore(res => {
            if(res == 2){
                this.setData({
                    showContact: true
                });
            }
        });
        this.setData({
            detail: item,
            showDetail: true
        });

    },

    /**
     * 
     * @param {取消弹窗} e 
     */
    cannel: function (e) {
        this.setData({
            detail: {},
            showDetail: false,
            showContact: false
        });
    },

    /**
     * 拨打电话
     * @param {*} e 
     */
    call: function (e) {
        let mobile = e.currentTarget.dataset.mobile;
        App.checkIsStore(res => {
            if(res == 2){
                App.call(mobile);
            } else {
                App.showError("您没有权限")
            }
        });
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