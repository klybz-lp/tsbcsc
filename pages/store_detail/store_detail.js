const App = getApp()
let store = require("../../utils/store.js");  //数据存储库
Page({

    /**
     * 页面的初始数据
     */
    data: {
        currentTab: 1,
        current: 0,
        showIcon: true,
        inputValue: "",
        comment: [],
        commentLength: 0,
        commentPage: 0,
        info: "",
        store: [],
        pics: [],
        species_id: "",
        color_id: "",
        texture_id: "",
        stone: [],
        last_page: 1,
        page: 0,
        page_size: 10,
        isFav: false,
        noData: false,
        noMore: false,
        showComment: false
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let store_id = options.id;
        this.getStone(store_id);
    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        let pages = getCurrentPages();
        let currentPage = [...pages].pop();
        let options = currentPage.options;
        this.getDetail(options.id);

        // let userInfo = store.getItem('userInfo');
        // if(userInfo) userInfo = JSON.parse(userInfo);
        // console.log(userInfo)

    },

    getDetail: function (id){
        App.get(App.api.storeDetail, {id: id}).then(result => {
            console.log(result)
            //img标签添加样式
            let info = result.content;
            //info = info.replace(/style=\"\"/g, '');
            info = info.replace(/style=\"(.+?)\"/g, '');
            info = info.replace(/<p><br\/><\/p>/g, '');
            info = info.replace(/img/g, 'img style="width:100%;display:block;margin:20px auto;"');
            let pics = result.images.map(item => { return item.file_path });
            let comment = result.comments
            //let commentLength = result.comments.length;
            this.setData({
                store: result,
                info,
                pics,
                comment
            });
            if(result.category_id == 3 || result.category_id == 4){
                this.setData({showComment: true});
            }
            this.isFav();
        }).catch(err => {
            console.log(err);
        })
    },

    /**
     * 判断是否收藏
     */
    isFav: function (e) {
        if (App.checkIsLogin()) {
            let store_id = this.data.store.id;
            App.post(App.api.isFav, { store_id: store_id, user_id: store.getItem('user_id') }, { loading: false, token: store.getItem('token') }).then(result => {
                this.setData({
                    isFav: result.msg
                });
            }).catch(err => {
                console.log(err);
            })
        }
    },
    
    /**
     * 产品列表
     */
    getStone: function (store_id) {
        wx.showNavigationBarLoading();
        if(this.data.page >= this.data.last_page){
            wx.hideNavigationBarLoading();
            this.setData({
                noData: true
            });
        } else {
            this.setData({
                page: ++this.data.page,
            });
  
            let param = {
                page: this.data.page,
                page_size: this.data.page_size,
                store_id: store_id,
                species_id: 0,
                color_id: 0,
                texture_id: 0
            }
            App.get(App.api.stoneList, param, { loading: false }).then(result => {
                wx.hideNavigationBarLoading();
                this.setData({
                    stone: [...this.data.stone, ...result.data],
                    last_page: result.last_page
                });
                if(result.last_page < 2){
                    this.setData({
                        noData: true
                    });
                }
            }).catch(err => {
                console.log(err);
            })
        }
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
        let store_id = this.data.store.id;
        App.post(App.api.addFav, {store_id: store_id, user_id: store.getItem('user_id')}, {loading: false, token: store.getItem('token')}).then(result => {   
            this.setData({isFav: !this.data.isFav});
            wx.showToast({
                title: result.msg,
                icon: 'success',
                duration: 2000
            })
        }).catch(err => {
            console.log(err);        
        })
    },

    /**
     * 拨打电话
     */
    call: function (e) {
        let mobile = this.data.store.mobile;
        App.call(mobile);
    },

    /**
     * 导航
     */
    navigation: function (e) {
        let store_name = this.data.store.name;
        let store_address = this.data.store.province_name + this.data.store.city_name + this.data.store.address;
        if(this.data.store.point) {
            let location = this.data.store.point.split(',');
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
     * foucs
     */
    inputFocus: function (e) {
        this.setData({
            showIcon: false
        });
    },

    /**
     * blur
     */
    blurFocus: function (e) {
        this.setData({
            showIcon: true
        });
    },

     /**
     * 搜索
     */
    inputSearch: function (e) {
        let inputValue = e.detail.value;
        this.setData({
            inputValue
        });
    },

    /**
     * 添加评论
     */
    createComment: function(e) {
        // 判断是否登录
        if(!App.checkIsLogin()){
            App.showError('请登录后操作', function(){
                wx.navigateTo({
                    url: '../login/login',
                });
            });
        
            return false;
        }
        //判断是否拥有评论权限
        App.get(App.api.user_detail, {}, {loading: false,token: store.getItem('token')}).then(result => {   
            //let isstore = (result.store_id > 0 && result.store_status == 1) ? true : false;
            if(!result.is_comment){
                App.showError('你没有评论权限')
                return false;
            } else {
                let store_id = this.data.store.id;
                let inputValue = this.data.inputValue;
                //console.log(inputValue.replace(/\s+/g,""));
                //console.log(inputValue.replace(/^\s+|\s+$/g,""));
                inputValue = inputValue.replace(/^\s+|\s+$/g,"");
                if(inputValue == ""){
                    App.showError('请填写评论内容');
                    return false;
                }
                App.post(App.api.addComment, {store_id: store_id, content: inputValue, user_id: store.getItem('user_id')}, {loading: false, token: store.getItem('token')}).then(result => {   
                    console.log(result)
                    wx.showToast({
                        title: result.msg,
                        icon: 'success',
                        duration: 2000
                    })
                    let userInfo = store.getItem('userInfo');
                    userInfo = JSON.parse(userInfo)
                    let comment = this.data.comment
                    comment.unshift({id: 1112, store_id: store_id, content: inputValue, nickName: userInfo.nickName, avatarUrl: userInfo.avatarUrl, ctime: '刚刚'});
                    this.setData({
                        inputValue: "",
                        comment
                    });
                }).catch(err => {
                    console.log(err);        
                })
            }
        }).catch(err => {
            console.log(err);        
        })
        
    },

    loadMore: function (e) {
        let commentLength = this.data.comment.length;
        let commentPage = this.data.commentPage;
        let page_sizes = 10;
        let totalPage = Math.ceil(commentLength/page_sizes);
        if(this.data.noMore){
            App.showSuccess("评论加载完毕");
            return false;
        }
        if( totalPage== 1){
            commentLength = commentLength - 1;
            this.setData({noMore: true});
        } else {
            commentPage++
            commentLength = page_sizes*commentPage - 1
        }
    
        if(commentPage > totalPage) {
            App.showSuccess("评论加载完毕");
            return false;
        }
   
        //每次加载10个评论
        this.setData({
            commentLength,
            commentPage: commentPage
        });
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
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        let store_id = this.data.store.id;
        let currentTab = this.data.currentTab
        if(currentTab == 1) {
            this.getStone(store_id);
        }
    },


    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {

    }
})