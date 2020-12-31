const App = getApp()
let store = require("../../utils/store.js");  //数据存储库
Page({

    /**
     * 页面的初始数据
     */
    data: {
        detail: []
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let id = options.id;
        this.getDetail(id);
    },

    getDetail: function (id){
        App.get(App.api.cooperCaseDetail, {id: id}).then(result => {
            //let commentLength = result.comments.length;
            this.setData({
                detail: result,
            });
            this.isFav();
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