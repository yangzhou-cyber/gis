<template>
  <div class="landuse" id="landUse"></div>
</template>

<script>
import { Chart } from "@antv/g2";
import insertCss from "insert-css";
export default {
  name: "landuse",
  data() {
    return {};
  },
  props: {
    color: {
      default() {
        return new Map([]);
      },
    },
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
        return newVal;
      },
    },
  },
  created() {},
  mounted() {
    const data = this.dataList;
    const chart = new Chart({
      container: "landUse",
      //   autoFit: true,
      width: 350,
      height: 250,
      padding: [0, 40, 10, 40],
    });
    chart.data(data);
    chart.scale("ratio", {
      formatter: (val) => {
        val = new Number(val).toFixed(2) + "%";
        return val;
      },
    });
    chart.coordinate("theta", {
      radius: 0.55,
      innerRadius: 0.6,
    });
    chart.tooltip({
      showTitle: false,
      showMarkers: false,
      itemTpl: '<li class="g2-tooltip-list-item"><span style="background-color:{color};" class="g2-tooltip-marker"></span>{name}: {value}</li>',

    });
    chart.legend(false);
    // 辅助文本
    chart
      .annotation() // 注释
      .text({
        position: ["50%", "50%"],
        content: "土地利用占比",
        style: {
          fontSize: 12,
          fill: "#333",
          textAlign: "center",
        },
        offsetY: -5,
      })
      .text({
        position: ["50%", "50%"],
        content: "单位：",
        style: {
          fontSize: 10,
          fill: "#333",
          textAlign: "center",
        },
        offsetX: -10,
        offsetY: 20,
      })
      .text({
        position: ["50%", "50%"],
        content: "公顷",
        style: {
          fontSize: 10,
          fill: "#333",
          textAlign: "center",
        },
        offsetY: 20,
        offsetX: 15,
      });
    chart
      .interval()
      .adjust("stack")
      .position("area")
      .color("lc", (lc) => {
        return this.color.get(lc);
      })
      .label("ratio", (ratio) => {
        return {
          content: (data) => {
            return `${data.lc.substr(0, 4)} ${parseFloat(ratio).toFixed(2)}%`;
          },
        };
      })
      .tooltip('lc*area', (lc,area) => {
        return {
          name:lc,
          value: parseFloat(area).toFixed(2) + ' 公顷',
        };
      });

    chart.interaction("element-active");

    chart.render();
  },
};
</script>

<style scoped>
.g2-tooltip .g2-tooltip-list .g2-tooltip-list-item {
  width: auto;
}
</style>