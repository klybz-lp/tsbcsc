const App = getApp()
let store = require("../../utils/store.js");  //数据存储库
// const TOKEN = 'd9c55ad403bd46a38a736141addabbe7'; // token,搜石测试环境
const TOKEN = '6d7bc05241bd4bcaa467ec0760921337'; // token,搜石正式环境
Page({

    /**
     * 页面的初始数据
     */
    data: {
        imageInfoList: [], // 格式化视频在前，图片再后
        queryList: [], // 编号列表，目前取前10个
        active: 0, // 高清图，码单切换
        hdActive: 0, // 高清图切换
        codeActive: 0, // 码单切换
        index: 0,
        current: 0,
        currentTab: 1,
        variety: '', // 品种名
        merchantId: '', // 商家id
        detail: {}, // 详情数据
        codeInfo: [], // 码单信息
        codeHeight: '1000px',
        HDHeight: '1000px',
        packetNoList: [], // 码单扎列表
        blockHDImgs: [], // 高清大图列表
        codeCancelOne: false, // 码单tab的样式
        HdCancelOne: false, // 高清大图tab的样式
        stockImageIndex: 0, // 现货高清图当前扎索引
        stockImageData: null, // 现货高清图当前扎数据
        stockImages: [], // 图片列表
        bannerList: [], // 轮播列表
        videoList: [], // 视频列表
        blockNo: '', // options的编号，用于分享进来
        count: 5,
        windowWidth: 0,
        currentTab: 0,
        left: 0,
        countHD: 5,
        currentTabHD: 0,
        leftHD: 0,
        showSpot: false
    },

    bindPickerChange: function(e) {
        console.log('picker发送选择改变，携带值为', e.detail.value)
        this.setData({
            index: e.detail.value,
            hdActive: 0, // 高清图切换
            codeActive: 0, // 码单切换
            current: 0,
            currentTab: 0, // 码单切换
            currentTabHD: 0 // 码单切换
        })
        console.log('codeActive:'+this.data.codeActive)
        const id = this.data.queryList[e.detail.value].id;
        this.getDetail(id)
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        if (options.variety) {
            this.setData({
                variety: options.variety
            })
            wx.setNavigationBarTitle({
                title: this.data.variety//页面标题为路由参数
            })
        }
        if (options.id) {
            this.setData({
                merchantId: options.id
            })
        }
        if (options.blockno) {
            this.setData({
                blockNo: options.blockno
            })
        }
        var that = this;
        wx.getSystemInfo({
            success: function(res){
                that.setData({windowWidth: res.windowWidth});
            }
        });
        this.getQuery()
    },
    /**
     * 生命周期函数--监听页面显示
     */

    onShow: function () {
        let pages = getCurrentPages();
        let currentPage = [...pages].pop();
        let options = currentPage.options;

        if(App.checkIsLogin()){
            App.checkIsStore( result => {
                if(result == 2) {
                    this.setData({
                        showSpot: true
                    });
                }
            });
        }

    },

    onReady() {
        this.videoContext = wx.createVideoContext('myVideo')
    },

    // 全屏预览
    previewFull(e) {
        // let src = e.currentTarget.dataset.src + '_Q80.jpg';
        let src = e.currentTarget.dataset.src + '?x-oss-process=style/high';
        // let resUrl = url + '_Q80.jpg'
        console.log('原src:'+e.currentTarget.dataset.src)
        console.log('80%:' + src)
        console.log(this.data.stockImages)
        wx.previewImage({
            current: src,
            urls: this.data.stockImages
        })
    },

    switchTab: function(e){
        this.setData({currentTab: e.detail.current});
        this.setLeft();
        let swiperHeight = (this.data.codeInfo[e.detail.current].slicesInfo.length + 4) * 35 + 'px'
        // console.log(this.data.codeInfo[e.detail.current].slicesInfo.length)
        // console.log(swiperHeight)
        this.setData({
            codeHeight: swiperHeight
        })
    },
    swichNav: function(e){
        var current = e.target.dataset.current;
        if(this.data.currentTab != current){
            this.setData({currentTab: current});
        }
        this.setLeft();
    },
    setLeft: function(){
        var data = this.data;
        var count = data.count;
        var windowWidth = data.windowWidth;
        var currentTab = data.currentTab;
        var per = windowWidth / count;
        var left = (currentTab - 2) * per;
        if(left < 0){
            left = 0;
        }
        this.setData({left: left});
    },

    switchTabHD: function(e){
        this.setData({currentTabHD: e.detail.current});
        this.setLeftHD();
        let swiperHeight = (this.data.blockHDImgs[this.data.currentTabHD].slicesExistHDImgInfo.length) * 290 + 100 + 'px'
        this.setData({
            HDHeight: swiperHeight
        })
    },
    swichNavHD: function(e){
        var current = e.target.dataset.current;
        if(this.data.currentTabHD != current){
            this.setData({ currentTabHD: current });
            this.getPreviewHd(current)
        }
        this.setLeft();
    },
    setLeftHD: function () {
        var data = this.data;
        var countHD = data.countHD;
        var windowWidth = data.windowWidth;
        var currentTabHD = data.currentTabHD;
        var per = windowWidth / countHD;
        var left = (currentTabHD - 2) * per;
        if(left < 0){
            left = 0;
        }
        this.setData({leftHD: left});
    },

    detailTabChange: function (e) {
        let num = e.currentTarget.dataset.num;
        this.setData({
            active: num
        })
    },

    // 获取编号跟id
    getQuery: function () {
        App.get(App.api.goodsQuery, { merchantId: this.data.merchantId, token: TOKEN, variety: this.data.variety }).then(result => {
            if (!result.length) {
                wx.showToast({
                    title: '未上传现货',
                    icon: 'none'
                })
                setTimeout(() => {
                    wx.navigateBack()
                }, 1500)
                
                return
            }
            const queryList = result.splice(0, 500)
            this.setData({
                queryList: queryList
            })
            // 用于分享出去，设置编号
            let targetBLockNoIndex = queryList.findIndex((item, index) => {
                return item.blockNo == this.data.blockNo
            })
            let blockNoIndex = targetBLockNoIndex === -1 ? 0 : targetBLockNoIndex
            this.setData({
                index: blockNoIndex
            })
            this.getDetail(queryList[blockNoIndex].id)
        }).catch(err => {
            console.log(err);
            setTimeout(() => {
                wx.navigateBack()
            }, 1500)
        })
    },

    // 获取详情tab-码单
    detailCodeTab: function (blockId) {
        App.get(App.api.detailTab, { id: blockId, token: TOKEN, tab: 2 }).then(result => {
            // console.log(result)
            let codeInfo = result.packetList
            // console.log(codeInfo)
            let swiperHeight = (codeInfo[0].slicesInfo.length + 4) * 35 + 'px'
            let packetNoList = codeInfo.map((item, index) => {
              return {name: `扎${item.packetNo}`, id: index}
            })
            console.log(swiperHeight)
            this.setData({
                codeInfo,
                codeHeight: swiperHeight,
                packetNoList
            })
        }).catch(err => {
            console.log(err);
        })
    },

    // 获取详情tab-高清图
    detailHdTab: function (blockId) {
        App.get(App.api.detailTab, { id: blockId, token: TOKEN, tab: 3 }).then(result => {
            let blockHDImgs = result.blockHDImgs
            let swiperHeight = blockHDImgs[0] ? (blockHDImgs[0].slicesExistHDImgInfo.length) * 290 + 100 + 'px' : '1000rpx'
            console.log('高清图数量：'+blockHDImgs[0].slicesExistHDImgInfo.length)
            this.setData({
                blockHDImgs,
                HDHeight: swiperHeight
            })
            console.log(swiperHeight)
            if (!blockHDImgs.length) {
                this.setData({
                    active: 1
                })
            } else {
                this.setData({
                    active: 0
                })
            }
            // 初始化当前扎的高清图列表
            console.log(this.data.currentTabHD)
            this.getPreviewHd(this.data.currentTabHD)
            // this.swiperHdHeight = (this.blockHDImgs[this.index].slicesExistHDImgInfo.length) * 580 + 80 + 'rpx'

        }).catch(err => {
            this.setData({
                active: 1
            })
            console.log(err);
        })
    },

    // 获取商品详情
    getDetail: function (blockId) {
        App.get(App.api.goodsDetail, { id: blockId, token: TOKEN }).then(result => {
            this.setData({
                detail: result
                // codeCancelOne: false, // 码单tab的样式
                // HdCancelOne: false, // 高清大图tab的样式
            })
            this.setData({
                videoList: [],
                bannerList: [],
                imageInfoList: []
            })
            let bannerList = []
            let videoList = []
            let imageList = []
            result.imageInfoList.forEach((item) => {
                if (item.imageType == 1) {
                    bannerList.push(item.imageUrl + '?x-oss-process=style/high')
                    imageList.push(item)
                } else if (item.imageType == 5) {
                    videoList.push(item)
                }
            })

            
            this.setData({
                videoList,
                bannerList,
                imageInfoList: videoList.concat(imageList)
            })
            console.log(this.data.imageInfoList)
            
            // 获取高清图
            this.detailHdTab(blockId)
            // 获取码单tab
            this.detailCodeTab(blockId)
        }).catch(err => {
            console.log(err);
        })
        // App.get(App.api.stoneDetail, {id: id}).then(result => {
        //     //img标签添加样式
        //     let info = result.store.content;
        //     info = info.replace(/style=\"(.+?)\"/g, ''); 
        //     info = info.replace(/<p><br\/><\/p>/g, ''); 
        //     info = info.replace(/img/g, 'img style="width:100%;display:block;margin:20px auto;"');
        //     let pics = result.images.map(item => { return item.file_path });
        //     pics.unshift(result.stone_cover);
        //     this.setData({
        //         merchantId: result.store.id,
        //         variety: result.name,
        //         stone: result,
        //         info,
        //         pics
        //     });
        //     // console.log(this.data.merchantId)
        //     this.getQuery()
        //     this.isFav();
        // }).catch(err => {
        //     console.log(err);
        // })
    },

    // 码单点击
    onCodeClick: function (e) {  
        // console.log(e.detail.index)
        let index = e.detail.index
        this.setData({
            codeActive: index,
            codeCancelOne: true
        })
        console.log(this.data.codeActive)
    },

    // 高清图点击
    // onHdClick: function () {
    //     this.setData({
    //         HdCancelOne: true
    //     })
    // },

    // 高清图的扎切换
    tabChange: function (e) {
        console.log(e.detail.index)
        const index = e.detail.index
        this.setData({
            hdActive: index
        })
        this.getPreviewHd(index)
    },

    // 获取当前扎高清图列表
    getPreviewHd: function (index) {
        this.setData({
            stockImageIndex: index
        })
        if (this.data.blockHDImgs.length > index) {
            this.data.stockImageData = this.data.blockHDImgs[this.data.stockImageIndex]
        }
        if (this.data.stockImageData) {
            let stockImages = []
            this.data.stockImageData.slicesExistHDImgInfo.forEach(item => {
                // stockImages.push(item.sliceImg + '_Q80.jpg')
                stockImages.push(item.sliceImg + '?x-oss-process=style/high')
            })
            this.setData({
                stockImages: stockImages
            })
        }
        // console.log(this.data.stockImages)
    },

    swiperChange: function (e) {
        var that = this;
        // that.videoContext.pause()
        // console.log(e)
        console.log(this.data.videoList)
        let video = null
        this.data.videoList.forEach((item, index) => {
            // console.log(item)
            video = wx.createVideoContext('myVideo' + index)
            video.pause()
        });
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
        let src = e.currentTarget.dataset.src + '?x-oss-process=style/high';
        console.log(src)
        console.log(this.data.bannerList)
        wx.previewImage({
            current: src,
            urls: this.data.bannerList,
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
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
        return {
            path: `/pages/spot_detail/spot_detail?id=${this.data.merchantId}&variety=${this.data.variety}&blockno=${this.data.queryList[this.data.index].blockNo}`
        }
    }
})