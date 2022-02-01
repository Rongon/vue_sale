<template>
  <div>
    <!-- 面包屑区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区 -->
    <el-card>
      <!-- 搜索部分 -->
      <el-row :span="8">
        <el-input placeholder="请输入内容">
          <el-button slot="append" icon="el-icon-search"></el-button>
        </el-input>
      </el-row>
      <!-- 展示部分 -->
      <el-table :data="ordersList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="订单编号" prop="order_number"></el-table-column>
        <el-table-column label="订单价格" prop="order_price"></el-table-column>
        <el-table-column label="是否付款" prop="pay_status">
          <template slot-scope="scope">
            <el-tag type="success" v-if="scope.row.pay_status === '1'">已付款</el-tag>
            <el-tag type="danger" v-else>未付款</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="是否发货" prop="is_send"></el-table-column>
        <el-table-column label="下单时间" prop="create_time">
          <template slot-scope="scope">
            {{ scope.row.create_time | dateFormat }}
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="">
            <el-button type="primary" icon="el-icon-edit" size="mini" @click="locationEdit"></el-button>
            <el-button type="success" icon="el-icon-location" size="mini" @click="progressBox"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页部分 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      >
      </el-pagination>
    </el-card>
    <!-- 修改物流对话框部分 -->
    <el-dialog title="修改地址" :visible.sync="locaDialVisible" width="50%" @close="locaDialVisiClosed">
      <el-form :model="locaFrom" :rules="locaFromRules" ref="locaFromRef" label-width="100px">
        <el-form-item label="省市区/县" prop="location1">
          <el-cascader :options="cityData" v-model="locaFrom.location1" :props="{ expandTrigger: 'hover' }"></el-cascader>
        </el-form-item>
        <el-form-item label="具体地址" prop="location2">
          <el-input v-model="locaFrom.location2" style="width: 100%"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="locaDialVisible = false">取 消</el-button>
        <el-button type="primary" @click="locaDialVisible = false">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 展示物流进度的对话框 -->
    <el-dialog title="物流进度" :visible.sync="progdialVisible" width="50%">
      <span>这是一段信息</span>
    </el-dialog>
  </div>
</template>

<script>
import cityData from './citydata.js'
export default {
  data() {
    return {
      // 查询订单数据列表的参数
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10
      },
      total: 0,
      ordersList: [],
      // 控制修改物流对话框的显示与否
      locaDialVisible: false,
      locaFrom: {
        location1: [],
        location2: ''
      },
      locaFromRules: {
        location1: [
          {
            required: true,
            message: '请选择省市区/县',
            trigger: 'blur'
          }
        ],
        location2: [
          {
            required: true,
            message: '请填写具体地址',
            trigger: 'blur'
          }
        ]
      },
      cityData: cityData,
      progdialVisible: false,
      progressInfo: []
    }
  },
  created() {
    this.getOrdersList()
  },
  methods: {
    async getOrdersList() {
      const { data: res } = await this.$http.get('orders', { params: this.queryInfo })
      if (res.meta.status !== 200) {
        return this.$message.error('获取订单数据列表失败')
      }
      this.total = res.data.total
      this.ordersList = res.data.goods
    },
    // pageSize 改变时会触发
    handleSizeChange(newPageSize) {
      this.queryInfo.pagesize = newPageSize
      this.getOrdersList()
    },
    // currentPage 改变时会触发
    handleCurrentChange(newCurrentPage) {
      this.queryInfo.pagenum = newCurrentPage
      this.getOrdersList()
    },
    // 控制修改物流的点击事件
    locationEdit() {
      this.locaDialVisible = true
    },
    // 编辑物流地址对话框关闭，清空表单
    locaDialVisiClosed() {
      this.$refs.locaFromRef.resetFields()
    },
    // 展示物流进度的对话框
    async progressBox() {
      this.progdialVisible = true
      // 由于后台接口的快递单号给的不对，所以这部分不做了

      // const { data: res } = await this.$http.get('/kuaidi/804909574412544580')
      // if (res.meta.status !== 200) {
      //   return this.$message.error('获取物流信息失败')
      // }
      // this.progressInfo = res.data
      // console.log(this.progressInfo)
    }
  }
}
</script>

<style lang="less" scoped>
.el-input {
  width: 300px;
}
</style>
