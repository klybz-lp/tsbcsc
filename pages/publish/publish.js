let store = require("../../utils/store.js");  //数据存储库
const App = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        supply: [],
        last_page: 1,
        page: 0,
        page_size: 10,
        noData: false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        this.getList();
    },

    /**
     * 发布列表
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
                page_size: this.data.page_size
            }
            App.get(App.api.userSupply, param, { loading: false,token: store.getItem('token') }).then(result => {
                wx.hideNavigationBarLoading();
                result.data.forEach(item => {
                    item.pics = item.images.slice(0,3);
                    //item.userName = item.user_name.replace(/(.{1})(.{1,})/g, "$1**");
                    //item.phone = item.mobile.replace(/(.{3})(.{1,})/g, "$1********");
                });
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