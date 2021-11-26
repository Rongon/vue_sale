<!--  -->
<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片搜索区域 -->
    <el-card class="box-card">
      <!-- 用户搜索添加区域 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserLists">
            <el-button slot="append" icon="el-icon-search" @click="getUserLists"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" round @click="addUserDialog = true">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 用户渲染区域 -->
      <el-table :data="userLists" stripe border>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="username" label="姓名"></el-table-column>
        <el-table-column prop="mobile" label="电话"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column prop="mg_state" label="状态">
          <template slot-scope="slotProps">
            <el-switch v-model="slotProps.row.mg_state" active-color="#13ce66" @change="mgstateChange(slotProps.row)"> </el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="slotProps">
            <!-- 修改按钮 -->
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(slotProps.row.id)"></el-button>
            <!-- 删除按钮 -->
            <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteUser(slotProps.row.id)"></el-button>
            <!-- 权限按钮 -->
            <el-button type="warning" icon="el-icon-setting" size="mini"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页部分 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
    <!-- 点击添加用户后响应提示框 -->
    <el-dialog title="添加用户" :visible.sync="addUserDialog" width="50%" @close="addDialogClosed">
      <!-- 添加用户弹出的显示框 -->
      <el-form :model="addForm" :rules="addRules" label-width="80px" ref="addFormRef">
        <el-form-item label="用户名称" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email"><el-input v-model="addForm.email"></el-input> </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="addForm.phone"></el-input>
        </el-form-item>
      </el-form>
      <!-- 添加用户底部按钮 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addUserDialog = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 点击修改用户响应提示框 -->
    <el-dialog title="修改用户" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <el-form ref="editFormRef" :model="editForm" label-width="80px" :rules="editFormRules">
        <el-form-item label="用户名:">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱:" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机号:" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    // 邮箱的验证规则
    var checkEmail = (rule, value, cb) => {
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
      if (regEmail.test(value)) {
        // 合法
        return cb()
      }
      // 不合法
      cb(new Error('请输入合法的邮箱'))
    }
    // 手机号的验证规则
    var checkPhone = (rule, value, cb) => {
      const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
      if (regMobile.test(value)) {
        return cb()
      }
      cb(new Error('请输入合法的手机号'))
    }
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 2
      },
      userLists: [],
      total: 0,
      // 控制添加用户按钮对话框的显示与隐藏
      addUserDialog: false,
      // 添加用户的表单数据
      addForm: {
        username: '',
        password: '',
        email: '',
        phone: ''
      },
      // 编辑用户对话框的显示与隐藏
      editDialogVisible: false,
      // 查询用户的表单数据
      editForm: {},
      // 查询用户的验证规则
      editFormRules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkPhone, trigger: 'blur' }
        ]
      },
      // 添加用户的验证规则
      addRules: {
        username: [
          { required: true, message: '请输入昵称', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' }
        ],
        phone: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkPhone, trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getUserLists()
  },
  methods: {
    async getUserLists() {
      const { data: res } = await this.$http.get('users', { params: this.queryInfo })
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户信息失败')
      } else {
        this.userLists = res.data.users
        this.total = res.data.total
      }
      //   console.log(res)
    },
    // 监听pagesize改变的事件
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getUserLists()
    },
    // 监听页码值改变的事件
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getUserLists()
    },
    // 监听按钮的状态，设置保存
    async mgstateChange(newStatus) {
      //   console.log(newStatus)
      const { data: res } = await this.$http.put(`users/${newStatus.id}/state/${newStatus.mg_state}`)
      if (res.meta.status !== 200) {
        // console.log(res.meta.status)
        newStatus.mg_state = !newStatus.mg_state
        return this.$message.error('用户状态更新失败')
      }
      this.$message.success('用户状态更新成功')
    },
    // 监听添加用户的弹出框，关闭之后重置表单
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    // 点击确定，进行校验
    addUser() {
      this.$refs.addFormRef.validate(async (valid) => {
        // 如果为false，就return
        if (!valid) return
        // 如果为true，真正网络添加用户
        const { data: res } = await this.$http.post('users', this.addForm)
        if (res.meta.status !== 201) {
          this.$message.error('添加用户失败')
        }
        this.$message.success('添加用户成功')
        // 关闭窗口并重新渲染列表
        this.addUserDialog = false
        this.getUserLists()
      })
    },
    async showEditDialog(id) {
      const { data: res } = await this.$http.get('users/' + id)
      if (res.meta.status !== 200) {
        console.log(res.meta.status)
        return this.$message.error('查询用户失败')
      }
      this.$message.success('查询用户成功')
      this.editForm = res.data
      this.editDialogVisible = true
    },
    // 监听编辑用户事件关闭，情况验证规则
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    // 点击修改确定按钮，消除验证规则，并真正修改
    editUserInfo() {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) return
        // 修改用户
        const { data: res } = await this.$http.put('users/' + this.editForm.id, {
          email: this.editForm.email,
          mobile: this.editForm.mobile
        })
        // 如果成功，如果失败
        if (res.meta.status !== 200) {
          return this.$message.error('修改用户失败')
        }
        // 关闭对话框
        this.editDialogVisible = false
        // 刷新数据表格
        this.getUserLists()
        // 提交修改成功信息
        this.$message.success('修改用户成功')
      })
    },
    // 点击删除按钮，删除用户
    async deleteUser(id) {
      const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch((err) => err)
      // 如果confirmResult返回confirm表示确认删除
      // 如果返回cancel，表示点错了
      if (confirmResult === 'cancel') {
        return this.$message.info('已取消删除')
      }
      // 点击确定，真正删除，发送删除请求
      const { data: res } = await this.$http.delete('users/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除用户失败')
      }
      this.$message.success('删除用户成功')
      // 刷新用户列表
      this.getUserLists()
    }
  }
}
</script>

<style lang="less" scoped>
.el-col {
  > .el-button {
    background-color: #61d7b4;
  }
}
.el-pagination {
  margin-top: 10px;
}
</style>
