const App = getApp()
var QQMapWX = require('../../utils/qqmap-wx-jssdk.min.js');
var qqmapsdk;
Page({

/**
 * 页面的初始数据
 */
data: {
    province: "",
    city: "",
    latitude: "", 
    longitude: "",
    banner: [],
    menu: [],
    store: [],
    stone: [],
    supply:[],
    news: [],
    cooper: [],
    siteInfo: null
},

/**
 * 生命周期函数--监听页面加载
 */
onLoad: function (options) {
    // 实例化API核心类
    qqmapsdk = new QQMapWX({
        key: 'GNDBZ-7USY6-YXKS5-EFLUG-D3JKO-VNBHU'
    });
    this.getBanner();
    this.getMenu();
    this.getStore();
    this.getStone();
    this.getSupply();
    this.getNews();
    this.getCooper();
    this.getSite();
},

/**
 * 生命周期函数--监听页面显示
 */
onShow: function () {
    //this.getUserLocation();
    var pages = getCurrentPages();
    let currentPage = pages[pages.length - 1]; //当前页面
    let route = currentPage['route'];
    App.globalData.pages.push(route)
},

/**
 * 
 * @param {返回顶部或指定位置} e 
 */
backUp: function (e) {
    wx.pageScrollTo({
        scrollTop: 0,
        duration: 300,
        //selector: '.supply',
        success: function(res) {
            console.log(res)
        },
        fail: function(err) {
            console.log(err)
        }
    })
},

/**
 * 头图
 */
getBanner: function(){
    App.get(App.api.banner).then(result => {   
        this.setData({
            banner: result
        });
    }).catch(err => {
        console.log(err);        
    })
}, 

/**
 * menu
 */
getMenu: function () {
    App.get(App.api.menu).then(result => {
        this.setData({
            menu: result
        });
    }).catch(err => {
        console.log(err);
    })
}, 

/**
 * 品牌推荐
 */
getStore: function () {
    App.get(App.api.storeRecommend).then(result => {
        this.setData({
            store: result
        });
    }).catch(err => {
        console.log(err);
    })
}, 

/**
 * 产品推荐
 */
getStone: function () {
    App.get(App.api.stoneRecommend).then(result => {
        this.setData({
            stone: result
        });
    }).catch(err => {
        console.log(err);
    })
}, 

/**
 * 供求推荐
 */
getSupply: function () {
    App.get(App.api.supplyRecommend).then(result => {
        this.setData({
            supply: result
        });
    }).catch(err => {
        console.log(err);
    })
}, 

/**
 * 资讯推荐
 */
getNews: function () {
    App.get(App.api.newsRecommend).then(result => {
        this.setData({
            news: result
        });
    }).catch(err => {
        console.log(err);
    })
}, 

/**
 * 合作推荐
 */
getCooper: function () {
    App.get(App.api.cooperRecommend).then(result => {
        this.setData({
            cooper: result
        });
    }).catch(err => {
        console.log(err);
    })
}, 

/**
 * 站点信息
 */
getSite: function () {
    let siteInfo = App.globalData.siteInfo;
    if(siteInfo){
        this.setData({
            siteInfo: siteInfo
        });
    } else {
        App.get(App.api.site).then(result => {
            App.globalData.siteInfo = result;
            this.setData({
                siteInfo: result
            });
        }).catch(err => {
            console.log(err);
        })
    }
}, 

gotoMini: function (e) {
    wx.navigateToMiniProgram({
        appId: 'wxf5aef99392ba9fbc',
    })
},

getUserLocation: function () {
    let vm = this;
    wx.getSetting({
        success: (res) => {
            console.log(JSON.stringify(res))
            if (res.authSetting['scope.userLocation'] != undefined && res.authSetting['scope.userLocation'] != true) {
                wx.showModal({
                    title: '请求授权当前位置',
                    content: '需要获取您的地理位置，请确认授权',
                    success: function (res) {
                        if (res.cancel) {
                            wx.showToast({
                                title: '拒绝授权',
                                icon: 'none',
                                duration: 1000
                            })
                        } else if (res.confirm) {
                            wx.openSetting({
                                success: function (dataAu) {
                                    if (dataAu.authSetting["scope.userLocation"] == true) {
                                        wx.showToast({
                                            title: '授权成功',
                                            icon: 'success',
                                            duration: 1000
                                        })
                                        //再次授权，调用wx.getLocation的API
                                        vm.getLocation();
                                    } else {
                                        wx.showToast({
                                            title: '授权失败',
                                            icon: 'none',
                                            duration: 1000
                                        })
                                    }
                                }
                            })
                        }
                    }
                })
            } else if (res.authSetting['scope.userLocation'] == undefined) {
                vm.getLocation();
            }
            else {
                vm.getLocation();
            }
        }
    })
},

// 微信获得经纬度
getLocation: function () {
    let vm = this;
    wx.getLocation({
        type: 'wgs84',
        success: function (res) {
            console.log(JSON.stringify(res))
            var latitude = res.latitude
            var longitude = res.longitude
            var speed = res.speed
            var accuracy = res.accuracy;
            vm.getLocal(latitude, longitude)
        },
        fail: function (res) {
            console.log('fail' + JSON.stringify(res))
        }
    })
},
// 获取当前地理位置
getLocal: function (latitude, longitude) {
    let vm = this;
    qqmapsdk.reverseGeocoder({
        location: {
            latitude: latitude,
            longitude: longitude
        },
        success: function (res) {
            console.log(JSON.stringify(res));
            let province = res.result.ad_info.province
            let city = res.result.ad_info.city
            let district = res.result.ad_info.district
            vm.setData({
                province: province,
                city: city,
                district: district,
                latitude: latitude,
                longitude: longitude
            })

        },
        fail: function (res) {
            console.log(res);
        },
        complete: function (res) {
            // console.log(res);
        }
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
    return {
        title: '陶石板仓',
        path: '/pages/index/index',
        imageUrl: 'https://www.taoshibancang.com/static/wechat/logo.png'
    }
}
})