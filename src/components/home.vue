<!--  -->
<template>
  <el-container class="home_contain">
    <!-- 头部区域 -->
    <el-header>
      <div>
        <img src="../assets/mina6.jpg" alt="" />
        <span>twice后台管理系统</span>
      </div>

      <el-button type="warning" round @click="loginOut">离开</el-button>
    </el-header>
    <el-container>
      <!-- 侧边栏区域 -->
      <el-aside :width="isCollapse ? '64px' : '200px'">
        <!-- 折叠按钮 -->
        <div class="collapseBtn" @click="toggleCollapse">|||</div>
        <!-- 菜单区 -->
        <el-menu active-text-color="#3EBFA0" unique-opened :collapse="isCollapse" :collapse-transition="false" :router="true" :default-active="activePath">
          <!-- 一级菜单区 -->
          <el-submenu :index="item.id + ''" v-for="item in menulist" :key="item.id">
            <template slot="title">
              <i :class="iconObj[item.id]"></i>
              <span>{{ item.authName }}</span>
            </template>
            <!-- 二级菜单区 -->
            <el-menu-item :index="'/' + subitem.path" v-for="subitem in item.children" :key="subitem.id" @click="saveActivePath('/' + subitem.path)">
              <i class="el-icon-menu"></i>
              <span>{{ subitem.authName }}</span>
            </el-menu-item>
          </el-submenu>
        </el-menu>
      </el-aside>
      <!-- 主体区域 -->
      <el-main><router-view></router-view></el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  data() {
    return {
      // 左侧菜单数据
      menulist: [],
      iconObj: {
        125: 'iconfont icon-yonghu1',
        103: 'iconfont icon-quanxian',
        101: 'iconfont icon-shangpin',
        102: 'iconfont icon-dingdandingdanmingxishouzhimingxi',
        145: 'iconfont icon-shuju'
      },
      // 侧边栏是否折叠
      isCollapse: false,
      // 高亮地址
      activePath: ''
    }
  },
  // 生命周期函数！
  created() {
    this.getMemuList()
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  methods: {
    loginOut() {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    async getMemuList() {
      const { data: res } = await this.$http.get('menus')
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      this.menulist = res.data
      // console.log(res)
    },
    // 点击按钮切换折叠
    toggleCollapse() {
      this.isCollapse = !this.isCollapse
    },
    // 保存高亮地址，设置点击时二级菜单高亮
    saveActivePath(activePath) {
      window.sessionStorage.setItem('activePath', activePath)
      this.activePath = activePath
    }
  }
}
</script>

<style lang="less" scoped>
.home_contain {
  height: 100%;
}
.el-header {
  background-color: #3ebfa0;
  display: flex;
  padding-left: 0px;
  color: #fff;
  align-items: center;
  justify-content: space-between;
  > div {
    display: flex;
    align-items: center;
    span {
      margin-left: 10px;
    }
  }
  img {
    width: 61px;
    height: 56px;
    border-radius: 50%;
  }
}
.collapseBtn {
  background-color: #ccfef3;
  text-align: center;
  letter-spacing: 0.2em;
  font-size: 10px;
  line-height: 24px;
  cursor: pointer;
}
.el-button{
   background-color: #61d7b4;
}
</style>
