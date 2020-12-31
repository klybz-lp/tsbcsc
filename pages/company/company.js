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
    onLoad: function (options) {
        this.getDetail();
    },

    getDetail: function (){
        App.get(App.api.about).then(result => {
            let info = result.content;
            //info = info.replace(/18px/g, '14px'); 
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
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})