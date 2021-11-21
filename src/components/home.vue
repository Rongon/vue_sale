<!--  -->
<template>
  <div>
    <el-button type="warning" round @click="loginOut">离开</el-button>
  </div>
</template>

<script>
export default {
  data() {
    return {}
  },
  methods: {
    loginOut() {
      window.sessionStorage.clear()
      this.$router.push('/login')
    }
  }
}
</script>

<style lang="less" scoped></style>
