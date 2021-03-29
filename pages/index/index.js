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
    current: 0,
    siteInfo: null,

    text: "如果预约时间不能到店则需要提前两个小时取消预约，如不足两个小时可联系技师取消预约",
    marqueePace: 0.5,//滚动速度
    marqueeDistance: 0,//初始滚动距离
    marquee_margin: 0,
    size:28,
    interval: 20 // 时间间隔
},

/**
 * 生命周期函数--监听页面加载
 */
onLoad: function (query) {

    const scenes = decodeURIComponent(query.scene)
    // user=17-name=lp
    if(scenes){
        let scene=scenes.split("-")[0];
        let refer_id=scene.split('=')[1];
    
        if(refer_id){
            App.globalData.refer_id = refer_id;
        }
    }

    // 实例化API核心类
    qqmapsdk = new QQMapWX({
        key: 'GNDBZ-7USY6-YXKS5-EFLUG-D3JKO-VNBHU'
    });
    this.getBanner();
    // this.getMenu();
    this.getStore();
    this.getTopStone();
    this.getStone();
    // this.getSupply();
    this.getNews();
    // this.getCooper();
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

    var that = this;
    var length = that.data.text.length * that.data.size;//文字长度
    var windowWidth = wx.getSystemInfoSync().windowWidth;// 屏幕宽度
    //console.log(length,windowWidth);
    that.setData({
        length: length,
        windowWidth: windowWidth
    });
    that.scrolltxt();// 第一个字消失后立即从右边出现
},

scrolltxt: function () {
    var that = this;
    var length = that.data.length;//滚动文字的宽度
    var windowWidth = that.data.windowWidth;//屏幕宽度
    if (length > windowWidth){
           var interval = setInterval(function () {
            var maxscrollwidth = length + that.data.marquee_margin;//滚动的最大宽度，文字宽度+间距，如果需要一行文字滚完后再显示第二行可以修改marquee_margin值等于windowWidth即可
            var crentleft = that.data.marqueeDistance;
            if (crentleft < maxscrollwidth) {//判断是否滚动到最大宽度
                 that.setData({
                  marqueeDistance: crentleft + that.data.marqueePace
                 })
            }else {
                 //console.log("替换");
                 that.setData({
                  marqueeDistance: 0 // 直接重新滚动
                 });
                 clearInterval(interval);
                 that.scrolltxt();
            }
           }, that.data.interval);
    }else{
          that.setData({ marquee_margin:"1000"});//只显示一条不滚动右边间距加大，防止重复显示
    } 
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
    App.get(App.api.storeCommend).then(result => {
        this.setData({
            store: result
        });
    }).catch(err => {
        console.log(err);
    })
}, 

/**
 * 置顶产品
 */
getTopStone: function(){
    App.get(App.api.stoneTop).then(result => {   
        this.setData({
            stoneTop: result
        });
    }).catch(err => {
        console.log(err);        
    })
}, 

/**
 * 产品推荐
 */
getStone: function () {
    App.get(App.api.stoneLast).then(result => {
        this.setData({
            // stone: this.group(result, 6),
            stone: result
        });
    }).catch(err => {
        console.log(err);
    })
}, 

group: function(array, subGroupLength) {
    let index = 0;
    let newArray = [];
    while(index < array.length) {
        newArray.push(array.slice(index, index += subGroupLength));
    }
    return newArray;
},

storeChange: function (e) {
    var that = this;
    if (e.detail.source == 'touch') {
        that.setData({
            current: e.detail.current
        })
    }
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
 * 服务团队跳转
 */
switchStore: function () {
    App.globalData.isLcsg = true;
    wx.switchTab({
        url: '/pages/store/store',
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
        imageUrl: 'https://www.taoshibancang.com/static/wechat/logo3.png'
    }
}
})