const App = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        info: "",
        about: []
    },

    /**
     * 生命周期函数
     */
    onShow: function (options) {
        //this.getDetail();
        var pages = getCurrentPages();
        console.log(pages);
        console.log(pages.length)
        if(pages.length == 1) {
         
        }
    },

    getDetail: function (){
        App.get(App.api.contact).then(result => {
            console.log(result)
            //img标签添加样式
            let info = result.content;
            info = info.replace(/style=\"\"/g, '');
            info = info.replace(/img/g, 'img style="width:100%;display:block;margin:20px auto;"');
    
            this.setData({
                about: result,
                info
            });
        }).catch(err => {
            console.log(err);
        })
    },
    /**
     * 点击底部导航进来触发的事件
     */
    onTabItemTap: function () {
        let siteInfo = App.globalData.siteInfo

        let pages = App.globalData.pages;
        let prevPage = "/pages/index/index";
        if(pages.length > 0){
            prevPage = '/'+pages[pages.length-1]
        }
        //console.log(prevPage)
        wx.switchTab({
            url: prevPage,
        })
        wx.makePhoneCall({
            phoneNumber: siteInfo.server_online,
            success: function (e) {

            },
            fail: function (err) {
                console.log(err)
                //wx.navigateBack()
            }
        })
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})