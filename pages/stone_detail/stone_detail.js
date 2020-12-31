const App = getApp()
let store = require("../../utils/store.js");  //数据存储库
Page({

    /**
     * 页面的初始数据
     */
    data: {
        currentTab: 1,
        current: 0,
        showCall: false,
        showApplyDialog: false,
        applyData: null,
        info: "",
        stone: [],
        pics: [],
        isFav: false,
        rpx: 1,
        windowWidth: '',
        windowHeight: '',
        posterWidth: "",
        posterHeight: "",
        posterPath: "",
        showShareDialog: false,
        maskHidden: false,
        showSpot: false,
        openSet: false,
    },

    openDialog: function () {
        this.setData({
            showShareDialog: true
        })
    },
    closeDialog: function () {
        this.setData({
            showShareDialog: false,
        })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        const poster = {
            "with": 375,
            "height": 587
        }
        const systemInfo = wx.getSystemInfoSync()
        let windowWidth = systemInfo.windowWidth  //屏幕宽
        let windowHeight = systemInfo.windowHeight  //屏幕高
        let posterHeight = parseInt((windowWidth / poster.with) * poster.height)
        let rpx = windowWidth/375;  //获取自适应单位
        this.setData({
            rpx
        });

    },
    /**
     * 生命周期函数--监听页面显示
     */

    onShow: function () {
        let pages = getCurrentPages();
        let currentPage = [...pages].pop();
        let options = currentPage.options;
        this.getDetail(options.id);
        // let id = options.id;
        // let page = currentPage.route;  //当前页面路由
        // let scene = decodeURIComponent(options.scene)
        // console.log(page, scene);
        // //生成页面二维码
        // this.createEwm(id, page, scene);
        App.checkIsStore( result => {
            if(result == 2) {
                this.setData({
                    showSpot: true
                });
            }
        });

    },

    getDetail: function (id){
        App.get(App.api.stoneDetail, {id: id}).then(result => {
            //img标签添加样式
            let info = result.store.content;
            info = info.replace(/style=\"(.+?)\"/g, ''); 
            info = info.replace(/<p><br\/><\/p>/g, ''); 
            info = info.replace(/img/g, 'img style="width:100%;display:block;margin:20px auto;"');
            let pics = result.images.map(item => { return item.file_path });
            pics.unshift(result.stone_cover);
            this.setData({
                stone: result,
                info,
                pics
            });
            this.isFav();
        }).catch(err => {
            console.log(err);
        })
    },

    /**
     * 
     * @param {生成二维码} path 
     * @param {*} cace 
     */
    createEwm: function (id, page, scene) {
        App.get(App.api.createPoster, {id: id,page: page,scene: scene}, {loading: false}).then(result => {
            console.log(result)
        }).catch(err => {
            console.log(err);
        })
    },

    swiperChange: function (e) {
        var that = this;
        if (e.detail.source == 'touch') {
            that.setData({
                current: e.detail.current
            })
        }
    }, 

    /**
     * 图片预览
     */
    previewImage: function (e) {
        let src = e.currentTarget.dataset.src;
        wx.previewImage({
            current: src,
            urls: this.data.pics,
            success: function (e) {
                console.log(e)
            },
            fail: function (e) {
                console.log(e)
            }
        })
    },

    /**
     * tab切换
     */
    selectTab: function (e) {
        var currentTab = e.currentTarget.dataset.id;
        this.setData({
            currentTab
        });
    },

    /**
     * 判断是否收藏
     */
    isFav: function (e) {
        if (App.checkIsLogin()) {
            let stone_id = this.data.stone.id;
            let stone_store_id = this.data.stone.store_id;
            App.post(App.api.isFav, { stone_id: stone_id, stone_store_id: stone_store_id, user_id: store.getItem('user_id') }, { loading: false, token: store.getItem('token') }).then(result => {
                this.setData({
                    isFav: result.msg
                });
            }).catch(err => {
                console.log(err);
            })
        }
    },

    /**
     * 收藏
     */
    fav: function (e) {
        // 判断是否登录
        if(!App.checkIsLogin()){
            App.showError('请登录后操作', function(){
                wx.navigateTo({
                    url: '../login/login',
                });
            });
        
            return false;
        }
        let stone_id = this.data.stone.id;
        let stone_store_id = this.data.stone.store_id;
        App.post(App.api.addFav, {stone_id: stone_id, stone_store_id: stone_store_id, user_id: store.getItem('user_id')}, {loading: false, token: store.getItem('token')}).then(result => { 
            this.setData({ isFav: !this.data.isFav });  
            wx.showToast({
                title: result.msg,
                icon: 'success',
                duration: 2000
            })
        }).catch(err => {
            console.log(err);        
        })
        console.log(stone_id)
    },

    /**
     * 客服管家弹窗
     */
    showCall: function (e) {
        this.setData({showCall: true});
    },

    cannel: function (e) {
        this.setData({ showCall: false });
    },

    /**
     * 拨打电话
     */
    call: function (e) {
        let mobile = this.data.stone.store.mobile;
        let _this = this;
        App.call(mobile,function(){
            _this.setData({ showCall: false });
        });
    },

    /**
     * 导航
     */
    navigation: function (e) {
        let store_name = this.data.stone.store.name;
        let store_address = this.data.stone.store.province_name + this.data.stone.store.city_name + this.data.stone.store.address
        if(this.data.stone.store.point) {
            let location = this.data.stone.store.point.split(',');
            const latitude = parseFloat(location[0]);
            const longitude = parseFloat(location[1]);
            wx.openLocation({
                latitude,
                longitude,
                scale: 18,
                name: store_name,
                address: store_address,
                success: res => {
                    console.log(res)
                }
            })
        } else {
            App.geocoder(store_address, (result) => {
                var latitude = result.latitude;
                var longitude = result.longitude;
                wx.openLocation({
                    latitude,
                    longitude,
                    scale: 18,
                    name: store_name,
                    address: store_address,
                    success: res => {
                        console.log(res)
                    }
                })
            })
        }
    
        // wx.getLocation({
        //     type: 'gcj02', //返回可以用于wx.openLocation的经纬度
        //     success (res) {
        //       const latitude = res.latitude
        //       const longitude = res.longitude
        //       console.log(latitude,longitude )
        //       wx.openLocation({
        //         latitude,
        //         longitude,
        //         scale: 18
        //       })
        //     },
        //     fail (err) {
        //         console.log(err)
        //     } 
        // })
    },

    /**
     * 索取样品
     */
    apply: function (e) {
        // 判断是否登录
        if(!App.checkIsLogin()){
            App.showError('请登录后操作', function(){
                wx.navigateTo({
                    url: '../login/login',
                });
            });
        
            return false;
        }
        let stone = this.data.stone;
        this.setData({
            showApplyDialog: true,
            applyData: { stone_id: stone.id, store_id: stone.store.id, pic: stone.stone_cover }
        });
    },

    /**
     * 接收子组件传递的值
     */
    hideApply: function (e) {
        this.setData({
            showApplyDialog: e.detail.showApplyDialog
        });
    },

    //获取图片信息
    getImage: function (url) {
        return new Promise((resolve, reject) => {
            wx.getImageInfo({
                src: url,
                success: function (res) {
                    resolve(res)
                },
                fail: function () {
                    reject("")
                }
            })
        }).catch(function (reason) {
            console.log('catch:', reason);
        });
    },

    getImageAll: function (image_src) {
        let that = this;
        var all = [];
        image_src.map(function (item) {
            all.push(that.getImage(item))
        })
        return Promise.all(all);
    },

    /**
     * 
     * @param {海报弹窗} e 
     */
    createPoster: function (e) {
        this.setData({
            maskHidden: true,
            showShareDialog: false
        })
        this.create();
    },

    //关闭生成海报弹窗
    closePosterBox: function(){
        this.setData({
            maskHidden: false
        })
    },

    /**
     * 
     * @param {生成海报} e 
     * 海报尺寸：750*1334
     */
    create: function (e) {
        wx.showLoading({title: '海报生成中...',})
        let that = this;
        //生成背景图与二维码图片
        let pages = getCurrentPages();
        let currentPage = [...pages].pop();
        let options = currentPage.options;
        let id = options.id;
        let page = currentPage.route; 
        let scene = decodeURIComponent(options.scene)
        console.log(page, scene);
        //生成页面二维码
        App.get(App.api.createPoster, {id: id,page: page,scene: scene}, {loading: false}).then(result => {
            let thumb = this.data.stone.stone_cover;  //产品缩略图
            //绘制图片
            this.getImageAll([result.bg,result.qr,thumb]).then((res) => {
                let bg = res[0];
                let qr = res[1];
                let tm = res[2];
                //设置canvas width height position-left,  为图片宽高
                this.setData({
                    posterWidth: bg.width + 'px',
                    posterHeight: bg.height + 'px'
                });
                let ctx = wx.createCanvasContext('canvas'); //创建 canvas 的绘图上下文
                //context.setFillStyle("#ffe200") //填充颜色
                //context.fillRect(0, 0, 375, 667); //填充一个矩形。用 setFillStyle 设置矩形的填充色，
                //drawImage 方法允许在 canvas 中插入其他图像
                let title = this.data.stone.name;
                let store_name = this.data.stone.store_name; //商家名称
                let tmW = 677; //缩略图宽
                let tmH = 677/tm.width*tm.height;  //缩略图高
                ctx.drawImage(bg.path, 0, 0, bg.width, bg.height);  //bg.path是背景图片的临时路径
                ctx.save() //保存状态
                ctx.drawImage(tm.path, 40, 40, tmW, tmH); //缩略图
                ctx.save()
                ctx.drawImage(qr.path, 475, 1020, qr.width * 0.6, qr.height * 0.6) //0.8表示绘制的二维码图片是原二维码尺寸的0.8
                ctx.save()
                //绘制标题文本
                // ctx.setFontSize(32)
                // ctx.setFillStyle('#000')
                // ctx.fillText(title, 40, tmH+100, tmW)
                // ctx.draw(); //将之前在绘图上下文中的描述（路径、变形、样式）画到 canvas 中

                var chr =title.split("");
                var temp = "";
                var row = [];
                ctx.setFontSize(32)
                ctx.setFillStyle("#000")
                for (var a = 0; a < chr.length; a++) {
                    if (ctx.measureText(temp).width < tmW) {
                        temp += chr[a];
                    }
                    else {
                        a--; 
                        row.push(temp);
                        temp = "";
                    }
                }
                row.push(temp); 
                //如果数组长度大于2 则截取前两个
                if (row.length > 2) {
                    var rowCut = row.slice(0, 2);
                    var rowPart = rowCut[1];
                    var test = "";
                    var empty = [];
                    for (var a = 0; a < rowPart.length; a++) {
                    if (ctx.measureText(test).width < tmW) {
                        test += rowPart[a];
                    }
                    else {
                        break;
                    }
                    }
                    empty.push(test);
                    var group = empty[0] + "..."
                    rowCut.splice(1, 1, group);
                    row = rowCut;
                }
                for (var b = 0; b < row.length; b++) {
                    ctx.fillText(row[b], 40, tmH + 100 + b * 40, tmW);
                }   
                ctx.save()
                //ctx.restore()  //恢复到上一个ctx.save()的状态

                //绘制标题文本
                ctx.setFontSize(44)
                ctx.setFillStyle('#cdb288')
                ctx.fillText(store_name, 40, tmH+220, tmW)
                ctx.draw(); 
                let that = this;
                setTimeout(function(){
                    wx.canvasToTempFilePath({//canvas 生成图片 生成临时路径
                        canvasId: 'canvas',
                        success: function (res) {
                            console.log(res)
                            that.setData({
                                posterPath: res.tempFilePath
                            });
                            wx.hideLoading();
                        },
                        fail: function (err) {
                            console.log(err)
                        }
                    })
                }, 300);
            });
        }).catch(err => {
            console.log(err);
        })
    },

    //保存海报
    savePoster: function () {
        let tempFilePath = this.data.posterPath;
        let that = this;
        // 获取用户是否开启用户授权相册
        wx.getSetting({
            success(res) {
                // 如果没有则获取授权
                if (!res.authSetting['scope.writePhotosAlbum']) {
                    console.log(res.authSetting['scope.writePhotosAlbum'])
                    wx.authorize({
                        scope: 'scope.writePhotosAlbum',
                        success() {
                            wx.saveImageToPhotosAlbum({
                                filePath: tempFilePath,
                                success() {
                                    wx.showToast({
                                        title: '保存成功',
                                    })
                                },
                                fail() {
                                    wx.showToast({
                                        title: '保存失败',
                                        icon: 'none'
                                    })
                                },
                                complete() {
                                    that.setData({maskHidden: false});
                                }
                            })
                        },
                        fail(err) {
                            console.log(err)
                            that.setData({
                                openSet: true,
                                maskHidden: false
                            })
                        }
                    })
                } else {
                    // 有则直接保存
                    wx.saveImageToPhotosAlbum({
                        filePath: tempFilePath,
                        success() {
                            wx.showToast({
                                title: '保存成功'
                            })
                        },
                        fail() {
                            wx.showToast({
                                title: '保存失败',
                                icon: 'none'
                            })
                        },
                        complete() {
                            that.setData({maskHidden: false});
                        }
                    })
                }
            }
        })
    },

    // 授权
    cancleSet() {
        this.setData({
            openSet: false
        })
    },

    /**
     * 查看现货
     */
    spot: function (e) {
        console.log(e)
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})