// components/segment-bar/segment-bar.js
Component({
    /**
     * 组件的属性列表
     * 外部传递过来属性值
     */
    properties: {
        //tab选项
        "segmentBar": {
            type: Array,
            value: []
        },
        "currentIndex": {
            type: Number,
            value: 0
        }
    },

    /**
     * 组件的初始数据
     */
    data: {
        currentIndex: 1
    },

    /**
     * 组件的方法列表
     */
    methods: {
        //设置segmentBar接口
        setItem : function(items){
            this.setData({
                segmentBar: items
            });
        },
        selectItem : function(e) {
            var id = e.currentTarget.dataset.id;
            this.setData({
                currentIndex: id
            });
            this.triggerEvent('selectChange', { id: id}, {})
        },
        setCurrentItem: function (currentItem) {
            this.setData({
                currentIndex: currentItem
            });
        }
    }
})
