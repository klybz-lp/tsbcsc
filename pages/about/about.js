let store = require("../../utils/store.js");  //数据存储库
const App = getApp()
Page({

    /**
     * 页面的初始数据
     */
    data: {
        isLogin: false,
        isstore: false,
        level: false, //商家级别
        userInfo: {}
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
        let _this = this;
        _this.setData({
            isLogin: App.checkIsLogin()
        });
        if (_this.data.isLogin) {
            // 获取当前用户信息
            _this.getUserDetail();
        }

        var pages = getCurrentPages();
        let currentPage = pages[pages.length - 1];
        let route = currentPage['route'];
        App.globalData.pages.push(route)
    },

    /**
   * 获取当前用户信息
   */
    getUserDetail() {
        let _this = this;
        // App._get(App.api.user_detail, {}, result => {
        //     console.log(result);
        //     _this.setData(result.data); 
        // });
        App.get(App.api.user_detail, {}, {loading: false,token: store.getItem('token')}).then(result => {   
            let isstore = (result.store_id > 0 && result.store_close === 0) ? true : false; //注册商家：普通用户
            let level = "普通用户"
            if(isstore && (result.store_status === 1) && (result.store_level === 2)){
                level = "入驻商家"
            }
            if(isstore && (result.store_status === 1) && (result.store_level === 1)){
                level = "注册商家"
            }
            if(isstore && (result.store_status === 2)){
                level = "审核中"
            }
            if(isstore && (result.store_status === 3)){
                level = "审核中"
            }

            _this.setData({
                userInfo: result,
                isstore,
                level
            });
        }).catch(err => {
            console.log(err);        
        })
    },

    /**
   * 菜单列表导航跳转
   */
    onTargetMenus(e) {
        let _this = this;
        if (!_this.onCheckLogin()) {
            return false;
        }
        wx.navigateTo({
            url: '/' + e.currentTarget.dataset.url
        })
    },

    /**
   * 跳转到登录页
   */
    onLogin() {
        wx.navigateTo({
            url: '../login/login',
        });
    },

    /**
     * 验证是否已登录
     */
    onCheckLogin() {
        let _this = this;
        if (!_this.data.isLogin) {
            App.showError('很抱歉，您还没有登录');
            return false;
        }
        return true;
    },

    /**
     * 获取登录用户信息
     */
    getuserinfo: function (e) {
        let userInfo = e.detail.userInfo;
        store.setItem('userInfo', userInfo);
        this.setData({
            userInfo
        });
    },

    /**
     * 调用系统地址管理
     */
    getAddress: function (e) {
        //判断是否获取授权
        wx.getSetting({
            success: res => {
                let scopeAddress = res.authSetting['scope.address'];
                if (scopeAddress === false) {
                    wx.openSetting({
                        success: res => {
                            wx.chooseAddress({
                                success: res2 => {
                                    res2.detail = res2.provinceName + res2.cityName + res2.countyName + res2.detailInfo;
                                    store.setItem('address', res2);
                                    console.log(res2)
                                }
                            })
                        }
                    })
                }
                wx.chooseAddress({
                    success: res2 => {
                        console.log(res2)
                        res2.detail = res2.provinceName + res2.cityName + res2.countyName + res2.detailInfo;
                        store.setItem('address', res2);
                    }
                })
            },
            fail: error => {
                console.log(error)
            }
        })
    },

    /**
     * 获取手机号,需要开通权限
     */
    getPhoneNumber: function (e) {
        var that = this;
        if (e.detail.errMsg == "getPhoneNumber:ok") {

            App.get(App.api.user_mobile, {encryptedData: e.detail.encryptedData,iv: e.detail.iv}, { loading: false,token: store.getItem('token') }).then(result => {
                console.log(result)
                wx.showToast({ title: "手机号绑定成功"});
                
            }).catch(err => {
                console.log(err);
            })
        } else {
            wx.showToast({ title: '取消授权'});
        }
    },

    /**
     * 拨打电话
     */
    call: function (e) {
        console.log(App.globalData.siteInfo)
        let siteInfo = App.globalData.siteInfo
        if(!siteInfo){
            wx.showToast({
                icon: 'none',
                title: '暂无联系信息',
            })
            return false;
        }
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
     * 
     * @param {清理缓存} e 
     */
    clear: function (e) {
        store.clear();
        wx.showToast({
            title: '缓存清理成功',
        })
    }
})