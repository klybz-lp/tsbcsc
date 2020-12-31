const App = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        news: [],
        last_page: 1,
        page: 0,
        page_size: 10,
        noData: false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        this.getList();
    },

    /**
     * 资讯列表
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
            App.get(App.api.newsList, param, { loading: false }).then(result => {
                wx.hideNavigationBarLoading();
                result.data.forEach(item => {
                    
                });
                this.setData({
                    news: [...this.data.news, ...result.data],
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