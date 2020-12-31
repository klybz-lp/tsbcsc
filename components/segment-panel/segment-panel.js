// components/segment-panel/segment-panel.js
Component({
    externalClasses: ['segments'], 
    options: {
        multipleSlots: true
    },
    /**
     * 组件的属性列表
     */
    properties: {
        //tab选项
        "segmentItem": {
            type: Array,
            value: []
        }
    },

    /**
     * 组件的初始数据
     */
    data: {
        circular: true, //衔接滑动
        current: 0 //当前活动滑块
    },

    pageLifetimes: {
        // 组件所在页面的生命周期函数
        show: function () { 
            //获取子组件segment-bar对象
            //var segmentBar = this.selectComponent("#bar");
            //segmentBar.setItem(this.data.segmentItem); 
        },
        hide: function () { },
        resize: function () { },
    },

    /**
     * 组件的方法列表
     */
    methods: {
        //获取子组件触发事件传递过来的数据
        selectChange: function(e) {
            var index = e.detail.index;  //获取当前点击的tab索引
            this.setData({
                current: index
            });
        },
        //swiper滑动与tab切换关联
        swiperChange: function(e) {
            var currentItem = e.detail.current;
            //获取子组件segment-bar对象
            var segmentBar = this.selectComponent("#bar");
            segmentBar.setCurrentItem(currentItem);
        }
    }
})
