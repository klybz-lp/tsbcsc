/**
 * 异步请求封装
 * url  请求的地址
 * data 请求的参数，object
 * option 请求的额外参数，如是否使用loading、toast、get/post等
 * 
 * 请求成功后台返回的数据格式：
 * {
 *     code: 1,
 *     data: {}
 * }
 * 请求失败后台返回的数据格式：
 * {
 *     code: 0,
 *     msg: string
 * }
 */

let store = require("../utils/store.js");  //数据存储库
let system = store.getSystemInfo();

/**
 * 设置请求头信息
 * clientType  请求的来源类型  mp表示是微信小程序
 * app  请求的应用名称
 * model  请求的设备型号
 * os    请求的设备的操作系统及版本
 * screen    请求设备的屏幕宽度与高度，单位px
 * os  当前小程序上线的版本号
 */
const clientInfo = {
    "clientType": "mp",
    "app": "xysxy",
    "model": system.model,
    "os": system.system,
    "screen": system.screenWidth + '*' + system.screenHeight,
    "os": '1.0.0.1'

};
module.exports = {
    fetch: (url, data = {}, option = {}) => {
        let { loading = true, toast = true, method = 'get' } = option; //设置默认值
        return new Promise((resolve, reject) => {
            if (loading) {
                wx.showLoading({
                    title: '数据加载中...',
                    mask: true
                })
            }
            wx.request({
                url: url,
                data,
                method,
                header: {
                    'clientInfo': JSON.stringify(clientInfo),
                    'ss-origin': 'W-7', // 搜石网接口标识
                    'token': option.token
                },
                success: function (result) {
                    if(result.statusCode == 401){
                        wx.showModal({
                            title: "提示",
                            content: "登录超时，请重新登录",
                            success(res) {
                                if (res.confirm) {
                                    wx.redirectTo({
                                        url: '/pages/login/login',
                                    })
                                } else {
                                    return false;
                                }
                            }
                        });
                        return false;
                    }
                    if (result.statusCode !== 200 || typeof result.data !== 'object') {
                        wx.showToast({ title: "网络请求出错"});
                        return false;
                    }
                    let res = result.data;
                    let code = '';
                    let isSourceSoushi = false; // 是否来自于搜石的接口
                    if (res.code != undefined) {
                        code = res.code;
                        isSourceSoushi = false;
                    } else {
                        code = res.status.code;
                        isSourceSoushi = true;
                    }
                    // 来自于搜石的接口，执行这里回调
                    if (isSourceSoushi) {
                        if (code === 0) {
                            if (loading) {
                                wx.hideLoading();
                            }
                            resolve(res.data);
                        } else {
                            if (toast) {
                                wx.showToast({
                                    // title: res.message || '网络请求失败',
                                    title: res.status.message || '网络请求失败',
                                    mask: true,
                                    icon: 'none'
                                })
                                reject(res)
                            } else {
                                if (loading) {
                                    wx.hideLoading();
                                }
                            }
                        }
                        return
                    }
                    if (code > 0) {
                        if (loading) {
                            wx.hideLoading();
                        }
                        resolve(res.result);
                    } else if (code == -1){
                        if (loading) {
                            wx.hideLoading();
                        }
                        wx.showToast({
                            title: "登录超时,请重新登录",
                            mask: true,
                            icon: 'none',
                            duration: 5000,
                            success: () => {
                                wx.navigateTo({
                                    url: '/pages/index/index',
                                })
                            }
                        })
                    
                    } else {
                        if (toast) {
                            wx.showToast({
                                // title: res.message || '网络请求失败',
                                title: '网络请求失败',
                                mask: true,
                                icon: 'none'
                            })
                        } else {
                            if (loading) {
                                wx.hideLoading();
                            }
                        }
                    }
                },
                fail: function (e) {
                    if (loading) {
                        wx.hideLoading();
                    }
                    reject(e);
                    console.log(e)
                }
            })
        });
    }
}