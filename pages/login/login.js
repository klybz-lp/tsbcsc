//index.js
//获取应用实例
const App = getApp()
let store = require("../../utils/store.js");  //数据存储库

Page({
    data: {
        userInfo: {},
        hasUserInfo: false,
        showMobile: false,
        openSet: false,
        canIUse: wx.canIUse('button.open-type.getUserInfo'),
        items: [
            {value: 1, name: '游客'},
            {value: 2, name: '设计师'},
            {value: 3, name: '商家'},
            {value: 4, name: '建材同行'},
        ],
        identity: 1,
        showIdentity: false
    },
    onLoad: function () {
        var that = this;
    },

    onShow: function () {
        this.setData({
            showIdentity: !App.globalData.isRegister
        });
        var pages = getCurrentPages();
        let currentPage = pages[pages.length - 1];
    
        console.log(pages);
        if(pages.length == 1) {
            console.log(pages[0]['route']);
        } else {
            let prevpage = pages[pages.length - 2];
            console.log(prevpage.route)
        }
    },
   /**
   * 授权登录
   */
    getUserInfo(e) {
        let _this = this;
        if (e.detail.errMsg !== 'getUserInfo:ok') {
            return false;
        }
        App.globalData.userInfo = e.detail.rawData
        store.setItem('userInfo', e.detail.rawData);
        let identity = App.globalData.isRegister ? 0 :  _this.data.identity;
        let data = {  
            user_info: e.detail.rawData,
            encrypted_data: e.detail.encryptedData,
            iv: e.detail.iv,
            signature: e.detail.signature,
            identity: identity,
        };
        if(App.globalData.refer_id && !App.globalData.isRegister){
            data.refer_id = App.globalData.refer_id;
        }
    
        wx.login({
            success(res) {
                data.code = res.code,
                //post请求  
                App.post(App.api.login, data, { token: store.getItem('token')}).then(result => {
                    store.setItem('token', result.token);
                    store.setItem('user_id', result.user_id);
                    //判断是否已经绑定手机号
                    if(!result.mobile){
                        wx.showToast({ title: "请绑定手机号"});
                        _this.setData({
                            showMobile: true,
                            showIdentity: false
                        });
                        return false;
                    }
                    store.setItem('mobile', result.mobile);
                    _this.onNavigateBack();
                }).catch(err => {
                    console.log(err);
                })
            }
            
        })
    
    },

    /**
     * 获取手机号,需要开通权限
     */
    getPhoneNumber: function (e) {
        var _this = this;
        if (e.detail.errMsg == "getPhoneNumber:ok") {
            App.get(App.api.user_mobile, {encryptedData: e.detail.encryptedData,iv: e.detail.iv}, { loading: false,token: store.getItem('token') }).then(result => {
                console.log(result)
                store.setItem('mobile', result.phoneNumber);
                wx.showToast({ title: "手机号绑定成功"});
                _this.onNavigateBack();
            }).catch(err => {
                console.log(err);
            })
        } else {
            wx.showToast({ title: '取消授权'});
        }
    },

    /**
   * 暂不登录
   */
    onNotLogin() {
        let _this = this;
        // 跳转回原页面
        _this.onNavigateBack();
    },

    /**
     * 授权成功 跳转回原页面
     */
    onNavigateBack() {
        let pages = getCurrentPages();
        wx.navigateBack({
            delta: 1,
            fail: function (err) {
                wx.switchTab({
                  url: '/pages/index/index',
                })
            },
        });
    },

    /**
     * 身份选择
     */
    radioChange(e) {
        let identity = e.detail.value;
        this.setData({
            identity
        });
    },

    identitySure: function () {
        let identity = this.data.identity;
        if (identity == 0) {
            wx.showToast({
                icon: 'none',
                title: '请选择您的身份',
            })
            return false;
        }

        this.setData({
            showIdentity: false
        });
        console.log(identity)
    }
})
