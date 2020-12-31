const App = getApp();
let store = require("../../utils/store.js");  //数据存储库
// components/apply/apply.js
Component({
    /**
     * 组件的属性列表
     */
    properties: {
        applyData: {
            type: Object,
            value: null
        },
        showApplyDialog: {
            type: Boolean,
            value: false
        }
    },

    /**
     * 组件的初始数据
     */
    data: {
      inputValue: ""
    },

    /**
     * 组件的方法列表
     */
    methods: {
        hideDialog: function (e) {
            this.setData({
                showApplyDialog: false,
                applyData: {}
            });
            this.triggerEvent('hideApply', { showApplyDialog: false, applyData: null})
        },
        formSubmit: function (e) {
            let data= e.detail.value;
            data.stone_id = this.data.applyData.stone_id;
            data.store_id = this.data.applyData.store_id;
            if(data.user_name == "") {
                wx.showToast({
                    icon: 'none',
                    title: '请输入您的名字',
                })
                return;
            }
            if (data.mobile == "") {
                wx.showToast({
                    icon: 'none',
                    title: '请输入您的联系方式',
                })
                return;
            }
            if (data.project_name == "") {
                wx.showToast({
                    icon: 'none',
                    title: '请输入您的项目名称',
                })
                return;
            }
            if (data.project_address == "") {
                wx.showToast({
                    icon: 'none',
                    title: '请输入您的项目地址',
                })
                return;
            }
            if (data.address == "") {
                wx.showToast({
                    icon: 'none',
                    title: '请输入您的联系地址',
                })
                return;
            }
            if (data.num == "") {
                wx.showToast({
                    icon: 'none',
                    title: '请输入样品数量',
                })
                return;
            }
            App.post(App.api.stoneApply, data, { loading: false, token: store.getItem('token') }).then(result => {
                console.log(result);
                wx.showToast({
                    title: result.msg,
                    icon: 'success',
                    duration: 2000
                })
                this.setData({
                    showApplyDialog: false,
                    applyData: [],
                    inputValue: ""
                });
                this.triggerEvent('hideApply', { showApplyDialog: false, applyData: null })
            }).catch(err => {
                console.log(err);
            })
        }
    }
})
