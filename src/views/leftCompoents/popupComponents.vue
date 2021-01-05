<template>
  <div id="popupComponents">
    <p class="popupNav">
      <span class="title">采样点数据</span>
      <img class="closePopup" src="../../assets/img/gisdemo/close.png" alt="" @click="closePopup"
      >
    </p>
    <ul class="paramsList">
        <li class="value">
          <span>COD_Mn：{{dataList.cod}} mg/L</span>
          <span class="upImg" v-show="dataList.cod > 20"></span> 
        </li>
        <li class="value">
          <span>TN：{{dataList.tn}} mg/L</span>
          <span class="upImg" v-show="dataList.tn > 1"></span> 
        </li>
        <li class="value">
          <span>TP：{{dataList.tp}} μg/L</span>
          <span class="upImg" v-show="dataList.tp > 200"></span> 
        </li>
        <li class="value">
          <span>NH4_N：{{dataList.nh4_n}} mg/L</span>
          <span class="upImg" v-show="dataList.nh4_n > 1"></span> 
        </li>
    </ul>
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
    closePopup () {
      this.$emit('closePopup');
    }
  }
}
</script>

<style scoped>
    #popupComponents {
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
      padding: 0 0.1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    #popupComponents .title {
      color: #000;
      font-size: 0.14rem;
      font-weight: 600;
    }
    #popupComponents .paramsList {
      width: 100%;
      margin-left: 0.1rem;
      list-style: none;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: flex-start;  
    }
    .value {
      width: 80%;
      margin-top: 0.08rem;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .value span {
      text-align: start;
    }
    .upImg {
      width: 0.1rem;
      height: 0.14rem;
      background-image: url('../../assets/img/gisdemo/up.png');
      background-size: cover;
    }
    .closePopup {
      width: 0.12rem;
      height: 0.12rem;
      cursor: pointer;
    }
</style>