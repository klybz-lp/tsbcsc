const App = getApp();
let store = require("../../utils/store.js");  //数据存储库
Page({

    /**
     * 页面的初始数据
     */
    data: {
        chooseImages: [], //被选中的图片数组
        uploadFile: [],
        type: 2,
        inputValue: ""
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
        // var pages = getCurrentPages();
        // let currentPage = pages[pages.length - 1]; //当前页面
        // let route = currentPage['route'];
        // App.globalData.pages.push(route)
    },

    setType: function (e) {
        let type = e.target.dataset.type;
        this.setData({
            type
        })
    },

    /**
     * 
     * @param {表单提交} e 
     */
    formSubmit: function (e) {
        let data= e.detail.value;
        data.user_id = store.getItem('user_id') || 0;
        data.type = this.data.type;
        if(data.name == "") {
            App.showError('请输入供需石材标题');
            return;
        }
        if(data.name.length > 60 ) {
            App.showError('供需石材标题过长');
            return;
        }
        if(data.remark == "") {
            App.showError('请输入供需石材描述');
            return;
        }
        if(data.remark.length > 200 ) {
            App.showError('供需石材描述过长');
            return;
        }
        if(data.user_name == "") {
            App.showError('请输入您的名字');
            return;
        }
        if (data.mobile == "") {
            App.showError('请输入您的联系方式');
            return;
        }

        if (!(/^1[3456789]\d{9}$/.test(data.mobile))) {
            App.showError('手机号格式不正确');
            return;
        }

        data.images = this.data.uploadFile.map(item => {
            return item.file_id
        })
        if(data.images.length == 0){
            App.showError('请上传图片');
            return;
        }

        App.post(App.api.addSupply, data, { loading: false, token: store.getItem('token') }).then(result => {
            //服务器端code为-1的不会执行下面的代码
            if(result.msg == "发布内容违规"){
                App.showError(result.msg);
                return;
            }
            App.showSuccess(result.msg,function(){
                wx.switchTab({
                    url: '../supply/supply',
                })
            });
        }).catch(err => {
            console.log(err);
        })
    },

    /**
     * 图片上传
     */
    chooseImage: function(e){
        wx.chooseImage({
            count: 9,
            sizeType: ['original', 'compressed'],
            sourceType: ['album', 'camera'],
            success: (res) => {
                var tempFilePaths = res.tempFilePaths;
                this.setData({
                    chooseImages: [...this.data.chooseImages, ...res.tempFilePaths]
                });
                //将上传图片保存到服务器
                this.uploadImage(res.tempFilePaths);
            },
            complete: function(){
                //wx.hideLoading();
            }
        })
    },

    /**
     * 
     * @param {图片上传} e 
     */
    uploadImage: function(data){
        var that = this,
            i = data.i ? data.i : 0,
            success = data.success ? data.success : 0,
            fail = data.fail ? data.fail : 0;
        wx.showLoading({
            title: '图片上传中',
        });
        wx.uploadFile({
            url: App.api.supplyUpload,
            filePath: data[i],
            header: {
                'content-type': 'multipart/form-data'
            },        
            name: 'file',
            success(res) {
                let result = JSON.parse(res.data);
                if (res.statusCode == 200) {
                    if(result.code == 1) {
                        success++;
                        let result = JSON.parse(res.data);
                        let uploadFile = that.data.uploadFile;
                        uploadFile.push(result.result);
                        that.setData({uploadFile});
                        wx.showToast({
                            title: result.message,
                            icon: 'success',
                            duration: 2000
                        })
                    } else {
                        wx.showToast({
                            title: result.message,
                            icon: 'success',
                            duration: 2000
                        })
                    }
                } else {
                    wx.showToast({
                        title: result.message || '图片上传失败',
                        icon: 'none',
                        duration: 2000
                    })
                }
                
            },
            fail: function (res) {
                console.log(res);
                fail++;
                console.log('fail:' + i + "fail:" + fail);
            },
            complete: () => {
                i++;
                if (i == data.length) { //当图片传完时，停止调用     
                    wx.hideLoading();
                    console.log('执行完毕');
                    console.log('成功：' + success + " 失败：" + fail);
                } else { //若图片还没有传完，则继续调用函数
                    data.i = i;
                    data.success = success;
                    data.fail = fail;
                    that.uploadImage(data);//递归，回调自己
                }
            }
        })
    },

    /**
     * 删除图片
     */
    removeImg: function(e){
        let index = e.currentTarget.dataset.index;
        let uploadFile = this.data.uploadFile;
        console.log(index)
        //删除当前点击的图片
        uploadFile.splice(index,1);
        this.setData({
            uploadFile
        });
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})