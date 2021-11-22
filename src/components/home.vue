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
      <el-aside width="200px">
        <!-- 菜单区 -->
        <el-menu active-text-color="#3EBFA0">
          <!-- 一级菜单区 -->
          <el-submenu :index="item.id + ''" v-for="item in menulist" :key="item.id">
            <template slot="title">
              <i :class="iconObj[item.id]"></i>
              <span>{{ item.authName }}</span>
            </template>
            <!-- 二级菜单区 -->
            <el-menu-item :index="subitem.id + ''" v-for="subitem in item.children" :key="subitem.id">
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
        125: 'iconfont icon-yonghu',
        103: 'iconfont icon-quanxian',
        101: 'iconfont icon-shangpin',
        102: 'iconfont icon-shouye',
        145: 'iconfont icon-shuju'
      }
    }
  },
  // 生命周期函数！
  created() {
    this.getMemuList()
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
      console.log(res)
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
.el-aside {
  background-color: #ccfef3;
}
.el-submenu{
  font-size: 10px
}
.el-button {
  background-color: #61d7b4;
}
</style>
