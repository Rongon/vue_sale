<template>
  <div>
    <!-- 2.为 ECharts 准备一个定义了宽高的 DOM -->
    <div id="main" style="width: 800px; height: 500px"></div>
  </div>
</template>

<script>
// 1.引入echarts包
import * as echarts from 'echarts'
import _ from 'lodash'
export default {
  data() {
    return {
      // 与后台数据合并的数据
      options: {
        title: {
          text: '用户来源'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#E9EEF3'
            }
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            boundaryGap: false
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ]
      }
    }
  },
  created() {},
  // 加载完dom后才会执行mounted函数
  async mounted() {
    // 3、基于准备好的dom，初始化echarts实例
    var myChart = echarts.init(document.getElementById('main'))
    const { data: res } = await this.$http.get('reports/type/1')
    if (res.meta.status !== 200) {
      return this.$message.error('获取数据统计失败')
    }
    // 4、指定图表的配置项和数据
    const result = _.merge(res.data, this.options)
    // 5、使用刚指定的配置项和数据显示图表。
    myChart.setOption(result)
  },
  methods: {}
}
</script>

<style lang="less" scoped></style>
