//服务器主域名
const domain = "https://www.taoshibancang.com";
// 搜石接口域名
const soushiDomain = "https://slab-api-test.soushi88.com";
// const soushiDomain = "https://slab.backend.soushi88.com";
//数据请求地址
const api = {
    goodsQuery: soushiDomain + '/open/goods/query', // 搜石_商品_查询
    goodsDetail: soushiDomain + '/open/goods/detail', // 搜石_商品_查询
    detailTab: soushiDomain + '/open/goods/detailTab', // 搜石_商品_查询
    site: domain + "/api/index/site",
    banner: domain + "/api/index/banner",
    menu: domain + "/api/index/menu",
    storeRecommend: domain + "/api/index/store",
    stoneRecommend: domain + "/api/index/stone",
    supplyRecommend: domain + "/api/index/supply",
    supplyUpload: domain + "/api/supply/upload",
    addSupply: domain + "/api/supply/add",
    userSupply: domain + "/api/supply/getUserSupply",
    newsRecommend: domain + "/api/index/news",
    cooperRecommend: domain + "/api/index/cooper",
    storeList: domain + "/api/store/getList",
    storeDetail: domain + "/api/store/getDetail",
    registerStore: domain + "/api/user/register", 
    isStore: domain + "/api/user/isStore",
    addComment: domain + "/api/store/addComment",
    stoneList: domain + "/api/stone/getList",
    stStoneList: "https://slab-api-test.soushi88.com/open/merchant/query",
    stoneType: domain + "/api/stone/getStoneType",
    stoneApply: domain + "/api/stone/apply",
    stoneDetail: domain + "/api/stone/getDetail",
    createPoster: domain + "/api/index/createPoster",
    isFav: domain + "/api/fav/isFav",
    addFav: domain + "/api/fav/add",
    favList: domain + "/api/fav/getList",
    addComment: domain + "/api/comment/add",
    cooperCategory: domain + "/api/cooper/getCooperCategory",
    cooperList: domain + "/api/cooper/getList",
    cooperDetail: domain + "/api/cooper/getDetail",
    cooperCaseList: domain + "/api/cooper/getCase",
    cooperCaseDetail: domain + "/api/cooper/getCaseDetail",
    newsList: domain + "/api/news/getList",
    newsDetail: domain + "/api/news/getDetail",
    login: domain + "/api/user/login",
    checkRegister: domain + "/api/user/checkRegister",
    about: domain + "/api/news/about",
    contact: domain + "/api/news/contact",
    user_detail: domain + "/api/user/detail",
    user_mobile: domain + "/api/user/mobile",
    sendSms: domain + "/api/user/sendSms",
    supplyList: domain + "/api/supply/getList",
    supplyDetail: domain + "/api/supply/getDetail",
}
module.exports = api; 