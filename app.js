//app.js
let api = require("./utils/api.js"); //异步请求API地址
let request = require("./utils/request.js");  //异步请求库
let store = require("./utils/store.js");  //数据存储库
let QQMapWX = require('./utils/qqmap-wx-jssdk.min.js');
let qqmapsdk;

const tabBarLinks = [
    'pages/index/index',
    'pages/stone/stone',
    'pages/release/release',
    'pages/contanct/contanct',
    'pages/about/about'
  ];

App({
    api, 
    get: request.fetch,
    post: (url, data, option) => {
        option.method = 'post';
        return request.fetch(url, data, option);
    },
    onLaunch: function () {
        let _this =this;
        //判断用户是否已经注册
        wx.login({
            success(res) {
                _this.get(_this.api.checkRegister, {  
                    code: res.code,
                }).then(result => {
                    console.log(result)
                    _this.globalData.isRegister = result.isRegister;
                    //用户登录
                    if (!_this.checkIsLogin()) {
                        wx.navigateTo({
                            url: '/pages/login/login',
                        });
                    }
                }).catch(err => {
                    console.log(err);
                    if (!_this.checkIsLogin()) {
                        wx.navigateTo({
                            url: '/pages/login/login',
                        });
                    }
                })
            }
        });
        //获取小程序配置信息
        this.get(this.api.site).then(res => {
            this.globalData.siteInfo = res;
        }).catch(err => {
            console.log(err);
        })

        // 实例化API核心类
        qqmapsdk = new QQMapWX({
            key: 'GNDBZ-7USY6-YXKS5-EFLUG-D3JKO-VNBHU'
        });
    
    },

    /**
     * 记录访问的页面
     */
    onShow() {
    
    },

    /**
   * 执行用户登录
   */
    doLogin() {
        // 保存当前页面
        let pages = getCurrentPages();
        if (pages.length) {
            let currentPage = pages[pages.length - 1];
            "pages/login/login" != currentPage.route &&
                wx.setStorageSync("currentPage", currentPage);
        }
        // 跳转授权页面
        wx.navigateTo({
            url: "/pages/login/login"
        });
    },

    /**
     * 当前用户id
     */
    getUserId() {
        return wx.getStorageSync('user_id') || 0;
    },

    /**
     * 显示成功提示框
     */
    showSuccess(msg, callback) {
        wx.showToast({
            title: msg,
            icon: 'success',
            success() {
                callback && (setTimeout(() => {
                    callback();
                }, 1500));
            }
        });
    },

    /**
     * 显示失败提示框
     */
    showError(msg, callback) {
        wx.showModal({
            title: '友情提示',
            content: msg,
            showCancel: false,
            success(res) {
                // callback && (setTimeout(() => {
                //   callback();
                // }, 1500));
                callback && callback();
            }
        });
    },

    /**
     * get请求
     */
    _get(url, data, success, fail, complete, check_login) {
        let App = this;
        wx.showNavigationBarLoading();

        // 构造请求参数
        data = Object.assign({
            wxapp_id: 10001,
            token: wx.getStorageSync('token')
        }, data);

        // if (typeof check_login === 'undefined')
        //   check_login = true;

        // 构造get请求
        let request = () => {
            data.token = wx.getStorageSync('token');
            wx.request({
                url:  url,
                header: {
                    'content-type': 'application/json'
                },
                data,
                success(res) {
                    if (res.statusCode !== 200 || typeof res.data !== 'object') {
                        console.log(res);
                        App.showError('网络请求出错');
                        return false;
                    }
                    if (res.data.code === -1) {
                        // 登录态失效, 重新登录
                        wx.hideNavigationBarLoading();
                        App.doLogin();
                    } else if (res.data.code === 0) {
                        App.showError(res.data.msg);
                        return false;
                    } else {
                        success && success(res.data);
                    }
                },
                fail(res) {
                    // console.log(res);
                    App.showError(res.errMsg, () => {
                        fail && fail(res);
                    });
                },
                complete(res) {
                    wx.hideNavigationBarLoading();
                    complete && complete(res);
                },
            });
        };
        // 判断是否需要验证登录
        check_login ? App.doLogin(request) : request();
    },

    /**
     * post提交
     */
    _post_form(url, data, success, fail, complete) {
        wx.showNavigationBarLoading();
        let App = this;
        // 构造请求参数
        data = Object.assign({
            wxapp_id: 10001,
            token: wx.getStorageSync('token')
        }, data);
        wx.request({
            url: url,
            header: {
                'content-type': 'application/x-www-form-urlencoded',
            },
            method: 'POST',
            data,
            success(res) {
                if (res.statusCode !== 200 || typeof res.data !== 'object') {
                    App.showError('网络请求出错');
                    return false;
                }
                if (res.data.code === -1) {
                    // 登录态失效, 重新登录
                    App.doLogin(() => {
                        App._post_form(url, data, success, fail);
                    });
                    return false;
                } else if (res.data.code === 0) {
                    App.showError(res.data.msg, () => {
                        fail && fail(res);
                    });
                    return false;
                }
                success && success(res.data);
            },
            fail(res) {
                // console.log(res);
                App.showError(res.errMsg, () => {
                    fail && fail(res);
                });
            },
            complete(res) {
                wx.hideLoading();
                wx.hideNavigationBarLoading();
                complete && complete(res);
            }
        });
    },

    /**
     * 验证是否存在user_info
     */
    validateUserInfo() {
        let user_info = wx.getStorageSync('user_info');
        return !!wx.getStorageSync('user_info');
    },

    /**
     * 对象转URL
     */
    urlEncode(data) {
        var _result = [];
        for (var key in data) {
            var value = data[key];
            if (value.constructor == Array) {
                value.forEach(_value => {
                    _result.push(key + "=" + _value);
                });
            } else {
                _result.push(key + '=' + value);
            }
        }
        return _result.join('&');
    },

    /**
     * 设置当前页面标题
     */
    setTitle() {
        let App = this,
            wxapp;
        if (wxapp = wx.getStorageSync('wxapp')) {
            wx.setNavigationBarTitle({
                title: wxapp.navbar.wxapp_title
            });
        } else {
            App.getWxappBase(() => {
                App.setTitle();
            });
        }
    },

    /**
     * 设置navbar标题、颜色
     */
    setNavigationBar() {
        let App = this;
        // 获取小程序基础信息
        App.getWxappBase(wxapp => {
            // 设置navbar标题、颜色
            wx.setNavigationBarColor({
                frontColor: wxapp.navbar.top_text_color.text,
                backgroundColor: wxapp.navbar.top_background_color
            })
        });
    },

    /**
     * 获取tabBar页面路径列表
     */
    getTabBarLinks() {
        return tabBarLinks;
    },

    /**
     * 验证登录
     */
    checkIsLogin() {
        return wx.getStorageSync('token') != '' && wx.getStorageSync('user_id') != '';
    },

     /**
     * 验证是否为注册商家
     */
    checkIsStore(callback) {
        if (!this.checkIsLogin()) {
            // wx.navigateTo({
            //   url: '../login/login',
            // })
            callback && callback(0);
            return false;
        }
        //验证商家状态是否为正常
        this.post(this.api.isStore, {}, {loading: false, token: store.getItem('token')}).then(result => {
            console.log(result)
            let is_store = (result.store_status === 1 && result.store_close === 0) ? 1 : 0; //注册商家
            if(is_store) is_store = (result.store_level === 2) ? 2 : 1;  //入驻商家
            callback && callback(is_store);
        });
    },

    /**
     * 授权登录
     */
    getUserInfo(e, callback) {
        let App = this;
        if (e.detail.errMsg !== 'getUserInfo:ok') {
            return false;
        }
        wx.showLoading({
            title: "正在登录",
            mask: true
        });
        App.globalData.userInfo = e.detail.rawData
        store.setItem('userInfo', e.detail.rawData);
       // const { encryptedData, iv, rawData, signature, userInfo } = e.detail;
        // 执行微信登录
        wx.login({
            success(res) {
                App.post(App.api.login, {  
                    code: res.code,
                    user_info: e.detail.rawData,
                    encrypted_data: e.detail.encryptedData,
                    iv: e.detail.iv,
                    signature: e.detail.signature
                }, { token: store.getItem('token')}).then(result => {
                    store.setItem('token', result.token);
                    store.setItem('user_id', result.user_id);
                    // 执行回调函数
                    callback && callback();
                    //wx.navigateBack();
                }).catch(err => {
                    console.log(err);
                })
            }
        });
    },

    /**
     * 通过地址获取经纬度坐标
     */
    geocoder(address, callback) {
        let _this = this;
        if(!address) {
            _this.showError("位置信息获取失败2")
            return false;
        }
        //调用地址解析接口
        qqmapsdk.geocoder({
            address: address,
            success: function(res) {//成功后的回调
                let data = {latitude: res.result.location.lat, longitude: res.result.location.lng};
                callback && callback(data);
            },
            fail: function(error) {
                _this.showError("位置信息获取失败");
                return false;
            },
            complete: function(res) {
                console.log(res);
            }
        });
    },

    /**
     * 拨打电话
     * @param mobile  商家电话
     * @param callback  回调函数
     */
    call: function (mobile, callback) {
        //用户登录
        if (!this.checkIsLogin()) {
            wx.navigateTo({
                url: '/pages/login/login',
            });
            return false;
        }
        let _this = this;
        wx.makePhoneCall({
            phoneNumber: mobile,
            success: function (e) {
                //发送短信通知
                _this.post(_this.api.sendSms, {mobile: mobile}, {loading: false, token: store.getItem('token')}).then(result => {
                    console.log(result)
                });
            },
            fail: function (err) {
                console.log(err)
            },
            complete: function () {
                console.log(typeof callback)
                typeof callback == "function" && callback()
            }
        })
    },

    globalData: {
        user_id: null,
        userInfo: null,
        siteInfo: null,
        isRegister: false, //是否已经注册
        pages: []  //记录访问的页面
    }
})