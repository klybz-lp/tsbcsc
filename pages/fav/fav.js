let store = require("../../utils/store.js");  //数据存储库
const App = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        items: [
            {
                id: 1,
                title: '产品'
            },
            {
                id: 2,
                title: '商家'
            }
        ],
        fav: [],
        currentIndex: 1,
        last_page: 1,
        page: 0,
        page_size: 10,
        noData: false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let currentIndex = options.type || 1;
        this.setData({
            currentIndex
        });
        this.getList();
    },

    /**
     * 收藏列表
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
                type: this.data.currentIndex,
            }
            App.get(App.api.favList, param, { loading: false,token: store.getItem('token') }).then(result => {
                wx.hideNavigationBarLoading();
                this.setData({
                    fav: [...this.data.fav, ...result.data],
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
     * 接收组件传递过来的数据
     */
    selectChange: function (e) {
        let currentIndex = e.detail.id
        this.setData({
            currentIndex,
            page: 0,
            last_page: 1,
            fav: [],
            noData: false
        });
        this.getList();
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