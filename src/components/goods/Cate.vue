<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区 -->
    <el-card>
      <!-- 添加按钮区 -->
      <el-row>
        <el-col>
          <el-button round @click="showAddCateDialVisi">添加商品</el-button>
        </el-col>
      </el-row>
      <!-- 表格区 -->
      <tree-table class="treeTable" :data="cateList" :columns="columns" :selection-type="false" :expand-type="false" index-text="#" show-index>
        <!-- 是否有效列 -->
        <template slot="isok" slot-scope="scope">
          <i class="el-icon-success" v-if="scope.row.cat_deleted === false" style="color: #61d7b4"></i>
          <i class="el-icon-error" v-else style="color: red"></i>
        </template>
        <!-- 排序列 -->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag type="success" size="mini" v-else-if="scope.row.cat_level === 1">二级</el-tag>
          <el-tag type="warning" size="mini" v-else>三级</el-tag>
        </template>
        <!-- 操作列 -->
        <template slot="opt">
          <el-button type="primary" icon="el-icon-edit" size="mini">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini">删除</el-button>
        </template>
      </tree-table>
      <!-- 分页区 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[3, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
    <!-- 添加商品分类对话框 -->
    <el-dialog title="添加分类" :visible.sync="addCateDialVisi" width="50%" @close="addCateDialVisiClosed">
      <el-form :model="addCateForm" :rules="addCateFormRules" ref="addCateFormRefs" label-width="100px">
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类：">
          <el-cascader v-model="selectedKeysArr" expandTrigger="hover" :options="parentCateList" :props="cascaderProps" @change="parentCateChange" clearable change-on-select></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="addCateDialVisi = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 请求参数列表
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 所以商品列表信息
      cateList: [],
      // 商品总数赋值
      total: 0,
      // 商品每一列展示的信息
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          // 表示当前列为模板列
          type: 'template',
          // 表示当前这一列使用的名称
          template: 'isok'
        },
        {
          label: '排序',
          // 表示当前列为模板列
          type: 'template',
          // 表示当前这一列使用的名称
          template: 'order'
        },
        {
          label: '操作',
          // 表示当前列为模板列
          type: 'template',
          // 表示当前这一列使用的名称
          template: 'opt'
        }
      ],
      addCateDialVisi: false,
      // 添加分类的表单数据对象
      addCateForm: {
        // 添加分类的层级
        cat_level: 0,
        // 添加分类的父级id
        cat_pid: 0,
        // 添加分类的名称
        cat_name: ''
      },
      // 添加分类的名称，需要验证规则
      addCateFormRules: {
        cat_name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }]
      },
      // 父级分类数据信息
      parentCateList: [],
      // 指定级联选择器的配置对象
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 选中的父级分类的ID数组
      selectedKeysArr: []
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get('categories', { params: this.queryInfo })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类列表数据失败')
      }
      this.cateList = res.data.result
      this.total = res.data.total
    },
    // 渲染当前显示数据大小
    handleSizeChange(newPageSize) {
      this.queryInfo.pagesize = newPageSize
      this.getCateList()
    },
    // 渲染当前的页码数
    handleCurrentChange(newPageNum) {
      this.queryInfo.pagenum = newPageNum
      this.getCateList()
    },
    // 点击添加商品按钮，弹出对话框
    showAddCateDialVisi() {
      // 先获取父级商品分类信息
      this.getParentCate()
      // 在弹出对话框渲染
      this.addCateDialVisi = true
    },
    // 获取父级分类数据
    async getParentCate() {
      const { data: res } = await this.$http.get('categories', { params: { type: 2 } })
      if (res.meta.status !== 200) {
        return this.$message.error('获取父级数据失败')
      }
      this.parentCateList = res.data
      // console.log(res.data)
    },
    // 分类时选择项发生变化触发这个函数
    parentCateChange() {
      // 如果selectedKeysArr数组中的length大于0，证明选中了父级分类
      if (this.selectedKeysArr.length > 0) {
        this.addCateForm.cat_level = this.selectedKeysArr.length
        this.addCateForm.cat_pid = this.selectedKeysArr[this.selectedKeysArr.length - 1]
      } else {
        this.addCateForm.cat_level = 0
        this.addCateForm.cat_pid = 0
      }
    },
    // 监听对话框关闭，情况表单内容
    addCateDialVisiClosed() {
      this.$refs.addCateFormRefs.resetFields()
      this.selectedKeysArr = []
      this.addCateForm.cat_pid = 0
      this.addCateForm.cat_level = 0
    },
    // 点击按钮，添加分类
    addCate() {
      this.$refs.addCateFormRefs.validate(async (valid) => {
        if (!valid) return
        const { data: res } = await this.$http.post('categories', this.addCateForm)
        if (res.meta.status !== 201) {
          return this.$message.error('添加分类失败')
        }
        this.$message.success('添加分类成功')
        this.getCateList()
        this.addCateDialVisi = false
      })
    }
  }
}
</script>

<style lang="less">
.el-col {
  > .el-button {
    background-color: #61d7b4;
    color: white;
  }
}

.treeTable {
  margin-top: 15px;
}
.el-cascader {
  width: 100%;
}
.el-cascader-menu {
  height: 300px;
}
</style>
