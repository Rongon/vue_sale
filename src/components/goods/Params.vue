<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片视图区-->
    <el-card>
      <el-alert title="注意：只允许第三级分类设置相关参数" type="warning" :closable="false" show-icon></el-alert>
      <el-row class="cat_opt">
        <el-col>
          <span>选择商品分类：</span>
          <!--级联部分-->
          <el-cascader v-model="selectedKeys" expandTrigger="hover" :options="cateList" :props="cascaderProps" @change="cateChange" clearable></el-cascader>
          <!--tabs 选择标签部分-->
          <el-tabs v-model="activeName" @tab-click="handleTabsClick">
            <!-- 添加动态参数的面板 -->
            <el-tab-pane label="动态参数" name="many">
              <!--添加动态参数的按钮-->
              <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="showAddParDiaVisible">添加参数</el-button>
              <!-- 动态参数表格 -->
              <el-table :data="mangTableData" border stripe>
                <!-- 展开行 -->
                <el-table-column type="expand">
                  <!-- 循环渲染的小tag标签属性 -->
                  <template slot-scope="scope">
                    <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable @close="handleClosed(i, scope.row)">{{ item }}</el-tag>
                    <!-- 点击添加新tag -->
                    <el-input
                      class="input-new-tag"
                      v-if="scope.row.inputVisible"
                      v-model="scope.row.inputValue"
                      ref="saveTagInput"
                      size="small"
                      @keyup.enter.native="handleInputConfirm(scope.row)"
                      @blur="handleInputConfirm(scope.row)"
                    >
                    </el-input>
                    <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                  </template>
                </el-table-column>
                <!-- 索引列 -->
                <el-table-column type="index"></el-table-column>
                <el-table-column label="参数名称" prop="attr_name"></el-table-column>
                <el-table-column label="操作">
                  <template slot-scope="scope">
                    <el-button size="mini" type="primary" icon="el-icon-eidt" @click="showEditParDiaVisible(scope.row.attr_id)">编辑</el-button>
                    <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeParams(scope.row.attr_id)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>
            <!-- 添加静态属性的面板 -->
            <el-tab-pane label="静态属性" name="only">
              <!--添加静态属性的按钮-->
              <el-button type="primary" size="mini" :disabled="isBtnDisabled" @click="showAddParDiaVisible">添加属性</el-button>
              <!-- 静态属性表格 -->
              <el-table :data="onlyTableData" border stripe>
                <!-- 展开行 -->
                <el-table-column type="expand">
                  <!-- 循环渲染的小tag标签属性 -->
                  <template slot-scope="scope">
                    <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable @close="handleClosed(i, scope.row)">{{ item }}</el-tag>
                    <!-- 点击添加新tag -->
                    <el-input
                      class="input-new-tag"
                      v-if="scope.row.inputVisible"
                      v-model="scope.row.inputValue"
                      ref="saveTagInput"
                      size="small"
                      @keyup.enter.native="handleInputConfirm(scope.row)"
                      @blur="handleInputConfirm(scope.row)"
                    >
                    </el-input>
                    <el-button v-else class="button-new-tag" size="small" @click="showInput(scope.row)">+ New Tag</el-button>
                  </template>
                </el-table-column>
                <!-- 索引列 -->
                <el-table-column type="index"></el-table-column>
                <el-table-column label="参数名称" prop="attr_name"></el-table-column>
                <el-table-column label="操作">
                  <template slot-scope="scope">
                    <el-button size="mini" type="primary" icon="el-icon-eidt" @click="showEditParDiaVisible(scope.row.attr_id)">编辑</el-button>
                    <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeParams(scope.row.attr_id)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
    </el-card>
    <!-- 添加属性的对话框部分 -->
    <el-dialog :title="'添加' + titleText" :visible.sync="addParDiavisible" width="50%" @close="addParDiavisClosed">
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addParDiavisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑的对话框部分 -->
    <el-dialog :title="'修改' + titleText" :visible.sync="editParDiavisible" width="50%" @close="editParDiavisClosed">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="editParDiavisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 所以商品信息
      cateList: [],
      // 级联选择框渲染的参数对象
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 级联选择框双向绑定的数组
      selectedKeys: [],
      // tabs默认展示第一个
      activeName: 'many',
      // 动态参数
      mangTableData: [],
      // 静态属性
      onlyTableData: [],
      // 控制添加属性对话框的显示与隐藏
      addParDiavisible: false,
      // 添加参数的表单数据对象
      addForm: {},
      // 添加参数的表单验证规则
      addFormRules: {
        attr_name: [{ required: true, message: '请输入参数名称', trigger: 'blur' }]
      },
      // 控制编辑属性按钮的显示
      editParDiavisible: false,
      // 编辑属性对话框的表单对象
      editForm: {},
      // 编辑属性对话框的验证规则
      editFormRules: {
        attr_name: [{ required: true, message: '请输入参数名称', trigger: 'blur' }]
      }
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 获取所有商品分类的信息
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品信息失败')
      }
      this.cateList = res.data
    },
    // 级联选择框变化时，触发函数
    async cateChange() {
      this.getCateParams()
    },
    // tabs标签的点击函数
    handleTabsClick() {
      this.getCateParams()
    },
    // 获取动静参数的函数
    async getCateParams() {
      if (this.selectedKeys.length !== 3) {
        this.selectedKeys = []
        this.mangTableData = []
        this.onlyTableData = []
      }
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: this.activeName } })
      if (res.meta.status !== 200) {
        return this.$message.error('获取参数失败')
      }
      res.data.forEach((item) => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        // 控制每个展开项自己的tag标签
        item.inputVisible = false
        item.inputValue = ''
      })
      if (this.activeName === 'many') {
        this.mangTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    },
    // 控制添加属性对话框的显示
    showAddParDiaVisible() {
      this.addParDiavisible = true
    },
    // 当对话框关闭时，清空表单
    addParDiavisClosed() {
      this.$refs.addFormRef.resetFields()
    },
    // 发起请求，实现添加参数
    addParams() {
      // 首先验证
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.post(`categories/${this.cateId}/attributes`, { attr_name: this.addForm.attr_name, attr_sel: this.activeName })
        if (res.meta.status !== 201) {
          return this.$message.error('添加参数失败')
        }
        this.$message.success('添加参数成功')
        this.addParDiavisible = false
        this.getCateParams()
      })
    },
    // 关闭编辑对话框，清空表单
    editParDiavisClosed() {
      this.$refs.editFormRef.resetFields()
    },
    // 编辑对话框点击确定，发起请求
    editParams() {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`, { attr_name: this.editForm.attr_name, attr_sel: this.activeName })
        if (res.meta.status !== 200) {
          return this.$message.error('编辑参数失败')
        }
        this.$message.success('编辑属性成功')
        this.getCateParams()
        this.editParDiavisible = false
      })
    },
    // 控制编辑属性对话框的显示
    async showEditParDiaVisible(attrId) {
      const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes/${attrId}`, { attr_sel: this.activeName })
      if (res.meta.status !== 200) {
        return this.$message.error('获取该属性失败')
      }
      this.editForm = res.data
      this.editParDiavisible = true
    },
    // 根据id删除对应的参数
    async removeParams(attrId) {
      const confirmResult = await this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch((err) => err)
      // 用户取消删除
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      // 实现删除
      const { data: res } = await this.$http.delete(`categories/${this.cateId}/attributes/${attrId}`)
      if (res.meta.status !== 200) {
        this.$message.error('删除参数失败')
      }
      this.$message.success('删除参数成功')
      this.getCateParams()
    },
    // 新建tag失去焦点或者按下enter键触发的事件
    async handleInputConfirm(row) {
      // 对没有输入新tag进行优化
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }
      // 实现真正的新添加tag
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false
      this.saveAttrVals(row)
    },
    // 保存对attr_vals的修改
    async saveAttrVals(row) {
      const { data: res } = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, { attr_name: row.attr_name, attr_sel: row.attr_sel, attr_vals: row.attr_vals.join(' ') })
      if (res.meta.status !== 200) {
        return this.$message.error('修改tag失败')
      }
      this.$message.success('修改tag成功')
    },
    // 控制文本框的显示
    showInput(row) {
      row.inputVisible = true
      // 让tag文本框自动获取焦点
      // 这里$nextTick方法的作用是，将页面的元素重新渲染一次，执行里面的代码
      this.$nextTick((_) => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 实现删除tag
    handleClosed(i, row) {
      row.attr_vals.splice(i, 1)
      this.saveAttrVals(row)
    }
  },
  // 计算属性
  computed: {
    // 控制添加按钮的禁用，只有选择了3级分类才能添加
    isBtnDisabled() {
      if (this.selectedKeys.length !== 3) {
        return true
      }
      return false
    },
    // 当前选中的三级分的id
    cateId() {
      if (this.selectedKeys.length === 3) {
        return this.selectedKeys[2]
      }
      return null
    },
    // 控制添加属性对话框的标题
    titleText() {
      if (this.activeName === 'many') {
        return '动态参数'
      } else {
        return '静态属性'
      }
    }
  }
}
</script>

<style lang="less" scoped>
.cat_opt {
  margin: 15px 0;
}
.el-cascader-menu {
  height: 300px;
}
.el-cascader {
  width: 20%;
}
.el-tag {
  margin: 0 10px;
}
.input-new-tag {
  width: 150px;
}
</style>
