const App = getApp()
let store = require("../../utils/store.js");  //数据存储库
let region = require("../../utils/city.js");
let province = region.province
//获取到默认省下的市
let city = ((region.city || []).filter(v => { return v.parentid == "110000" }) || []).map(v => {
    return v
});
Page({

    /**
     * 页面的初始数据
     */
    data: {
        storeCategory: [],
        isStore: false,
        link: "https://www.taoshibancang.com/admin",
        index: null,
        category_id: null,
        province_id: 0,
        city_id: 0,
        p_c: [["广东省"], ["广州市"]],
        pcIndex: [null, null], 
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
        //判断是否登录
        if(!App.checkIsLogin()) {
            wx.navigateTo({
                url: '../login/login',
            });
        } else {
            //判断是否已是商家及状态
            App.get(App.api.user_detail, {}, {loading: false,token: store.getItem('token')}).then(result => {   
                //let isStore = (result.store_id > 0 && result.store_status == 1) ? true : false;
                let isStore = (result.store_id > 0) ? true : false;
                this.setData({
                    userInfo: result,
                    isStore
                });
            }).catch(err => {
                console.log(err);        
            })
        }

        this.data.p_c[0] = province
        this.data.p_c[1] = city
    
        //初始化p_c
        this.setData({ p_c: this.data.p_c })
        this.getStore();
    },

    /**
     * 品牌分类
     */
    getStore: function () {
        App.get(App.api.storeRecommend, {}, { loading: false }).then(result => {
            let storeCategory = [];
            result.map(item => {
                if(item.id != 1){
                    storeCategory.push(item)
                }
            })
            this.setData({
                storeCategory
            });
        }).catch(err => {
            console.log(err);
        })
    },

    /**
     * 
     * @param {经营范围选择} e 
     */
    bindPickerChange: function (e) {
        let index = e.detail.value; //索引值
        console.log(index);
        let category_id = this.data.storeCategory[index]['id'];
        this.setData({
            category_id,
            index
        })
    },

    pkIndex: function (e) {
        let pcIndex = e.detail.value;
        let province_id = this.data.p_c[0][pcIndex[0]]['id'];
        let city_id = this.data.p_c[1][pcIndex[1]]['id'];
        //设置province_id、city_id值
        this.setData({
            pcIndex,
            province_id,
            city_id
        })
    },

    pkCol: function (e) {
        //console.log('修改的列为', e.detail.column, '，值为', e.detail.value);
        let index = e.detail.value;
        var data = {
            p_c: this.data.p_c,
            pcIndex: this.data.pcIndex,
        };
        
        //如果选择省则区的数组会变
        if (e.detail.column == 0) {
            //code默认值为北京
            var code = "110000";
            (region.province || []).some(v => {
                if (v.id == province[e.detail.value].id) {
                    code = v.id
                    return true
                }
                return false
            });
    
            let city = ((region.city || []).filter(v => { return v.parentid == code }) || []).map(v => {
                return v
            });
            data.p_c[1] = city
            data.pcIndex[0] = e.detail.value
        } else {
            let index = e.detail.value;
            data.pcIndex[1] = index;
        }
        this.setData(data)
    },

    /**
     * 
     * @param {表单提交} e 
     */
    formSubmit: function (e) {
        let data= e.detail.value;
        data.category_id = this.data.category_id;
        data.province_id = this.data.province_id;
        data.city_id = this.data.city_id;

        if(data.name == "") {
            App.showError('请填写公司名称');
            return;
        }
        if(!data.category_id) {
            App.showError('请选择经营范围');
            return;
        }
        if(data.business == "") {
            App.showError('请填写主营产品');
            return;
        }
        if(data.contact == "") {
            App.showError('请填写联系人');
            return;
        }
        if (data.mobile == "") {
            App.showError('请填写联系方式');
            return;
        }

        //省市
        if (data.province_id == "" || data.city_id == "") {
            App.showError('请选择省市');
            return;
        }
       
        App.post(App.api.registerStore, data, { loading: false, token: store.getItem('token') }).then(result => {
            console.log(result);
            App.showSuccess(result.msg,function(){
                // wx.switchTab({
                //   url: '../about/about',
                // })
                wx.navigateTo({
                    url: '/pages/register/register',
                })
            });
        }).catch(err => {
            console.log(err);
        })
    },

    /**
     * 
     * @param {打开网站后台} e 
     */
    openBack: function (e) {
        wx.navigateTo({
          url: '/pages/register/backend',
        })
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