<template>
  <div class="point" id="pointQulity"></div>
</template>

<script>
import { Chart } from "@antv/g2";
import insertCss from "insert-css";
export default {
  name: "point",
  data() {
    return {};
  },
  created() {},
  props: {
    dataList: {
      type: Array,
      default() {
        return [];
      },
    },
  },
  watch: {
    dataList: {
      deep: true,
      handler: function (newVal, oldVal) {
        if (this.chart) {
          newVal = [...newVal].map((item) => {
            return Object.assign(item, { value: parseFloat(item.value) });
          });
          this.chart.data(newVal);
          this.chart.render();
        }
      },
    },
  },

  mounted() {
    const data = this.dataList;
    let chart = new Chart({
      container: "pointQulity",
      width: 280,
      height: 200,
      padding: [10, 30, 20, 30],
    });

    chart.data(data);

    chart.scale("value", {
      nice: true,
    });

    chart.axis("value", {
      label: {
        formatter: (val) => {
          return parseFloat(val);
        },
      },
    });

    chart.axis("key", {
      tickLine: null,
    });

    chart.tooltip({
      containerTpl: '<div class="g2-tooltip">' + '<div class="g2-tooltip-title"></div>'
    + '<ul class="g2-tooltip-list" style="line-height:40px"></ul></div>',
      itemTpl: '<li data-index={index}><span style="background-color:{color};width:8px;height:8px;border-radius:50%;display:inline-block;margin-right:8px;"></span>浓度: {value}</li>',
    });
    chart.interaction("active-region");
    chart.interval().position("key*value");
    chart.render();
    this.chart = chart;
  },
};
</script>

<style scoped>
#point {
  width: 100%;
}
</style>