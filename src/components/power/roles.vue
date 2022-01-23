<!--  -->
<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 添加按钮 -->
    <el-row>
      <el-col>
        <el-button type="success" round>添加角色</el-button>
      </el-col>
    </el-row>
    <!-- 角色渲染区域 -->
    <el-table :data="roleLists" border stripe>
      <!-- 展开列 -->
      <el-table-column type="expand">
        <template slot-scope="scope">
          <el-row :class="['bdbottom', i1 === 0 ? 'bdtop' : '', 'vcenter']" v-for="(item1, i1) in scope.row.children" :key="item1.id">
            <!-- 渲染一级权限 -->
            <el-col :span="5">
              <el-tag closable @close="removeRightById(scope.row, item1.id)">{{ item1.authName }}</el-tag>
              <i class="el-icon-caret-right"></i>
            </el-col>
            <!-- 渲染二级权限 -->
            <el-col :span="19">
              <el-row :class="[i2 === 0 ? '' : 'bdtop', 'vcenter']" v-for="(item2, i2) in item1.children" :key="item2.id">
                <!-- 二级和三级 -->
                <el-col :span="6">
                  <el-tag type="success" closable @close="removeRightById(scope.row, item2.id)">{{ item1.authName }}</el-tag>
                  <i class="el-icon-caret-right"></i>
                </el-col>
                <el-col :span="13">
                  <el-tag type="warning" v-for="(item3, i3) in item2.children" :key="i3.id" closable @close="removeRightById(scope.row, item3.id)">{{ item2.authName }}</el-tag>
                  <i class="el-icon-caret-right"></i>
                </el-col>
              </el-row>
            </el-col>
          </el-row>
        </template>
      </el-table-column>
      <!-- 索引列 -->
      <el-table-column type="index" label="#" width="50"></el-table-column>
      <el-table-column prop="roleName" label="角色名称" width="300"> </el-table-column>
      <el-table-column prop="roleDesc" label="角色描述" width="300"> </el-table-column>
      <el-table-column label="操作" width="300">
        <template slot-scope="slotProps">
          <!-- 修改按钮 -->
          <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(slotProps.row.id)">编辑</el-button>
          <!-- 删除按钮 -->
          <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteUser(slotProps.row.id)">删除</el-button>
          <!-- 权限按钮 -->
          <el-button type="warning" icon="el-icon-setting" size="mini" @click="showSetRightDialog(slotProps.row)">分配权限</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分配权限的对话框 -->
    <el-dialog title="分配权限" :visible.sync="setRightDialogVisible" width="50%" @close="clearDefKeysArr()">
      <el-tree :data="rightList" :props="treeProps" node-key="id" default-expand-all show-checkbox :default-checked-keys="defKeys"  ref="treeRef"></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="assRight()">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 获取权限列表的参数对象
      queryInfo: {
        roleId: '',
        roleName: '',
        roleDesc: ''
      },
      roleLists: [],
      // 初始分配权限默认为false，点击后true
      setRightDialogVisible: false,
      // 所有权限的数据存储
      rightList: [],
      // 树形控件的属性绑定对象
      treeProps: {
        label: 'authName',
        children: 'children'
      },
      // 默认选中的节点ID值数组
      defKeys: [105, 116],
      // 要分配权限的那个人的id
      roleId: ''
    }
  },
  created() {
    this.getRoleList()
  },
  methods: {
    async getRoleList() {
      const { data: res } = await this.$http.get('roles', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限列表失败!')
      }
      this.roleLists = res.data
      // console.log(res)
    },
    // 根据id删除对应的权限
    async removeRightById(role, rightId) {
      const confirmResult = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch((err) => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('取消了删除')
      }
      const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除权限失败')
      }
      // 方式每次删除都要刷新一次页面降低用户体验
      role.children = res.data
    },
    // 分配权限的对话框
    async showSetRightDialog(role) {
      this.roleId = role.id
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error('获取分配权限列表失败')
      }
      // 获取到的权限保存到rightList中
      this.rightList = res.data
      // 递归获取三级节点的Id
      this.showDefKeyRight(role, this.defKeys)
      this.setRightDialogVisible = true
    },
    // 展示真正的默认权限数组
    showDefKeyRight(node, arr) {
      // 如果该节点没有children，就说明是三级节点
      if (!node.children) {
        return arr.push(node.id)
      }
      // 通过递归循环出所有三级节点赋值到数组中
      node.children.forEach((item) => this.showDefKeyRight(item, arr))
    },
    // 监听分配权限对话框关闭时清空数组，避免干扰下一个数组
    clearDefKeysArr() {
      this.defKeys = []
    },
    // 发起请求实现分配权限
    async assRight() {
      const keys = [...this.$refs.treeRef.getCheckedKeys(), ...this.$refs.treeRef.getHalfCheckedKeys()]
      const idStr = keys.join(',')
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, { rids: idStr })
      if (res.meta.status !== 200) {
        return this.$message.error('分配权限失败')
      }
      this.$message.success('分配权限成功')
      this.getRoleList()
      this.setRightDialogVisible = false
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
.el-tag {
  margin: 10px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>
