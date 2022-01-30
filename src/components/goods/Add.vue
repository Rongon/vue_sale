<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区 -->
    <el-card>
      <el-alert title="添加商品信息" type="success" center show-icon :closable="false" label-position="top"></el-alert>
      <!-- 步骤条区域 -->
      <el-steps :space="200" :active="activeIndex - 0" align-center finish-status="success">
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- 左侧tabs栏区域 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRefs" label-width="100px" label-position="top">
        <el-tabs v-model="activeIndex" :tab-position="'left'" :before-leave="beforeLeave" @tab-click="tabsClicked">
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price"> <el-input v-model="addForm.goods_price" type="number"></el-input> </el-form-item
            ><el-form-item label="商品重量" prop="goods_weight"> <el-input v-model="addForm.goods_weight" type="number"></el-input> </el-form-item
            ><el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader v-model="addForm.goods_cat" :options="cateList" :props="cateProps" expandTrigger="hover" @change="handleChange" style="width: 200px"></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <el-form-item :label="item.attr_name" v-for="item in cateMany" :key="item.attr_id">
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :label="cb" v-for="(cb, i) in item.attr_vals" :key="i" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.attr_name" v-for="item in cateOnly" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload :action="uploadURL" :on-preview="handlePreview" :on-remove="handleRemove" list-type="picture" :headers="headersToken" :on-success="handleSuccess">
              <el-button size="small" type="primary">点击上传</el-button>
              <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器区域 -->
            <quill-editor v-model="addForm.goods_introduce"></quill-editor>
            <el-button type="primary" @click="add" class="btnAdd">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
    <!-- 预览图片的对话框 -->
    <el-dialog title="预览图片" :visible.sync="previewVisible" width="50%">
      <img :src="previewImg" alt="" class="previewImg" />
    </el-dialog>
  </div>
</template>

<script>
// 引入深拷贝工具loadsh
import _ from 'lodash'

export default {
  data() {
    return {
      // 添加进度条的高亮
      activeIndex: 0,
      // 添加商品的表单对象
      addForm: {
        goods_name: '',
        goods_price: 0,
        goods_weight: 0,
        goods_number: 0,
        // 添加商品分类所属数组
        goods_cat: [],
        // 上传图片成功的服务器临时存储路径
        pics: [],
        // 添加商品存储的详情内容
        goods_introduce: '',
        attrs: []
      },
      // 添加商品的验证规则
      addFormRules: {
        goods_name: [{ required: true, message: '请输入商品名称', trigger: 'blur' }],
        goods_price: [{ required: true, message: '请输入商品价格', trigger: 'blur' }],
        goods_weight: [{ required: true, message: '请输入商品重量', trigger: 'blur' }],
        goods_number: [{ required: true, message: '请输入商品数量', trigger: 'blur' }],
        goods_cat: [{ required: true, message: '请选择商品分类', trigger: 'blur' }]
      },
      // 商品列表数据
      goodsList: [],
      // 商品分类列表
      cateList: [],
      cateProps: {
        label: 'cat_name',
        value: 'cat_id',
        children: 'children'
      },
      // 商品动态参数列表
      cateMany: [],
      // 商品静态属性列表
      cateOnly: [],
      uploadURL: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 设置上传图片的请求头，赋予token令牌,实现真正上传
      headersToken: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 预览图片的路径
      previewImg: '',
      // 默认点击预览图片的对话框是关闭的
      previewVisible: false
    }
  },
  created() {
    this.getCateList()
  },
  computed: {
    // 专门获取三级商品分类的id的
    cateId() {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      }
      return null
    }
  },
  methods: {
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        this.$message.error('获取商品列表数据失败')
      }
      this.cateList = res.data
    },
    // 添加商品级联选择器改变事件
    handleChange() {
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
      }
    },
    // 添加商品页面未选择三级分类时，不能跳转到其他tabs
    beforeLeave(oldActiveName) {
      if (oldActiveName === '1' && this.addForm.goods_cat.length !== 3) {
        this.$message.error('请先选择三级商品分类')
        return false
      }
    },
    // 点击切换tabs，调用不同接口，展示不同页面
    async tabsClicked() {
      // this.activeIndex === '1'证明是在动态参数tabs中
      if (this.activeIndex === '1') {
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: 'many' } })
        if (res.meta.status !== 200) {
          this.$message.error('获取动态参数失败')
        }
        // 将后台api接口的attr_vals字符串转换成数组形式
        res.data.forEach((item) => {
          item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
        })
        this.cateMany = res.data
      }
      // this.activeIndex === '2'证明是在静态属性tabs中
      if (this.activeIndex === '2') {
        const { data: res } = await this.$http.get(`categories/${this.cateId}/attributes`, { params: { sel: 'only' } })
        if (res.meta.status !== 200) {
          this.$message.error('获取动态参数失败')
        }
        this.cateOnly = res.data
      }
    },
    // 点击上传图片标题预览触发的事件
    handlePreview(file) {
      this.previewImg = file.response.data.url
      this.previewVisible = true
    },
    // 图片删除时执行的事件
    handleRemove(file) {
      // 1.获取将要删除图片的临时路径
      const filePath = file.response.data.tmp_path
      // 2.从pics数组中，找到这个图片对应的索引值
      const i = this.addForm.pics.findIndex((x) => x.params === filePath)
      // 3、调用数组的splice方法，把图片信息对象，从pics数组移除
      this.addForm.pics.splice(i, 1)
    },
    // 图片上传成功执行的事件
    handleSuccess(response) {
      const tempPath = { params: response.data.tmp_path }
      this.addForm.pics.push(tempPath)
    },
    // 点击提交富文本详情内容
    add() {
      // 添加商品前的表单预验证
      this.$refs.addFormRefs.validate(async (valid) => {
        if (!valid) {
          return this.$message.error('请填写必要的表单项')
        }
        // 提交商品中的goods_cat需要为字符串，但是级联选择器需要是数组，因此要进行深拷贝
        // 使用深拷贝工具lodash
        const form = _.cloneDeep(this.addForm)
        form.goods_cat = form.goods_cat.join(',')
        // 处理attrs数组，包含 `动态参数` 和 `静态属性`
        this.cateMany.forEach((item) => {
          const newInfo = { attr_id: item.attr_id, attr_value: item.attr_vals.join(' ') }
          this.addForm.attrs.push(newInfo)
        })
        this.cateOnly.forEach((item) => {
          const newInfo = { attr_id: item.attr_id, attr_value: item.attr_vals }
          this.addForm.attrs.push(newInfo)
        })
        form.attrs = this.addForm.attrs
        // 发起请求，添加商品
        const { data: res } = await this.$http.post('/goods', form)
        if (res.meta.status !== 201) {
          return this.$message.error('添加商品失败')
        }
        this.$message.success('添加商品成功')
        this.$router.push('/goods')
      })
    }
  }
}
</script>

<style lang="less" scoped>
.el-checkbox {
  margin-right: 10px;
}
.previewImg {
  width: 100%;
}
.btnAdd {
  margin-top: 15px;
}
</style>
