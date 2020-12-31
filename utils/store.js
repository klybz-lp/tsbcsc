/**
 * 数据存储库
 * 在调试器的storage里查看
 */

module.exports = {
    /**
     * 设置数据
     * 简单的设置数据只需要key与value
     * 二维数组或对象属性需要加module_name
     */
    setItem(key, value, module_name) {
        if (module_name) {
            let module_name_info = this.getItem(module_name);
            module_name_info[key] = value;
            wx.setStorageSync(module_name, module_name_info)
        } else {
            wx.setStorageSync(key, value)
        }
    },
    /**
     * 获取数据
     */
    getItem(key, module_name) {
        if (module_name) {
            let val = this.getItem(module_name);
            if (val) return val[key];
            return "";
        } else {
            return wx.getStorageSync(key)
        }
    },
    /**
     * 删除数据
     * 不传参数则删除所有数据
     */
    clear(key) {
        key ? wx.clearStorageSync(key) : wx.clearStorageSync();
    },
    /**
     * 获取设备信息
     */
    getSystemInfo() {
        return wx.getSystemInfoSync();
    }
}