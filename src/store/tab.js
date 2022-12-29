export default {
  state: {
    isCollapse: false, //控制左侧菜单的展开
  },
  mutations: {
    //修改菜单展开的方法
    COLLAPSE_MENU(state) {
      state.isCollapse = !state.isCollapse;
    },
  },
};
