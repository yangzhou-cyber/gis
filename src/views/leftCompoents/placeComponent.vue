<template>
  <div id="placeComponent">
    <!-- 点数据 -->
    <p class="popupNav">
      <span class="title">土地利用详情</span>
      <img class="closePopup" src="../../assets/img/gisdemo/close.png" alt="" @click="closeOverlay">
    </p>
    <ul class="paramsList">
      <li class="placeValue">用地类型：{{dataList.lc}}</li>
      <li class="placeValue">占地面积为：{{parseFloat(dataList.area).toFixed(2)}}公顷</li>
      <li class="placeValue">土地占比：{{parseFloat(dataList.ratio).toFixed(2)}}%</li>
    </ul>

    <!-- 土地数据 -->
    
  </div>
</template>

<script>
export default {
  data() {
    return {}; 
  },
  props: {
    dataList: {
      type: Object,
      default() {
        return {};
      },
    },
  },
   methods: {
    closeOverlay () {
      this.$emit('closePlace');
    }
  }
}
</script>

<style scoped>

    #placeComponent {
      width: 100%;
      height: 100%;
      /* padding: 10px; */
      background-size: contain;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: flex-start;
      color: #333;
      font-size: 0.14rem;
    }
    .popupNav {
      width: 100%;
      height: 0.3rem;
      padding: 0 0.1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    #placeComponent .title {
      text-align: start;
      color: #000;
      font-size: 0.14rem;
      font-weight: 600;
    }

    #placeComponent .paramsList {
      width: 100%;
      margin-left: 0.1rem;
      list-style: none;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: flex-start;  
    }
    #placeComponent .placeValue {
      width: 100%;
      margin-top: 0.08rem;
      text-align: start;
    }
    .closePopup {
      cursor: pointer;
    }
  
</style>