const App = getApp();
Page({

    /**
     * 页面的初始数据
     */
    data: {
        info: "",
        news: []
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
        let pages = getCurrentPages(); 
        let currentPage = [...pages].pop();
        let options = currentPage.options;
        console.log(options.id)
        this.getDetail(options.id);
    },

    getDetail: function (id){
        App.get(App.api.newsDetail, {id: id}).then(result => {
            //img标签添加样式
            let info = result.content;
            // info = info.replace(/img style=\"(.+?)\"/g, '');
            // info = info.replace(/<p><br\/><\/p>/g, '');
            // info = info.replace(/img/g, 'img style="width:100%;display:block;margin:20px auto;"');
            // info = info.replace(/<p>/g, '<p style="margin-bottom:20px;">');
    
            this.setData({
                news: result,
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