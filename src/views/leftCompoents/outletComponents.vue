<template>
  <div id="outletComponents">
    <p class="popupNav">
      <span class="title">排口数据</span>
      <img class="closePopup" src="../../assets/img/gisdemo/close.png" alt="" @click="closeOutlet">
    </p>
    <ul class="paramsList">
        <li class="value">
          <span class="lon">经度：{{dataList.lon=='0.0'?'118.808797':dataList.lon}}</span>
          <span>纬度：{{dataList.lat=='0.0'?'31.996371':dataList.lat}}</span>
          <span class="imgtitle">现场照片</span>
          <img v-if="checked==0" class="outletImg" src="../../assets/img/gisdemo/outletImg.png" alt="">
          <img v-if="checked==1" class="outletImg" src="../../assets/img/gisdemo/outletImg2.png" alt="">
          <img v-if="checked==2" class="outletImg" src="../../assets/img/gisdemo/outletImg3.png" alt="">
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
    checked: {
      type: Number,
      default() {
        return 0
      }
    }
  },
  mounted() {
  },
  methods: {
    closeOutlet() {
      this.$emit('closeOutlet');
    }
  }
}
</script>

<style scoped>
    #outletComponents {
      width: 100%;
      height: 100%;
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
    #outletComponents .title {
      text-align: start;
      color: #000;
      font-size: 0.14rem;
      font-weight: 600;
    }
    #outletComponents .paramsList {
      width: 100%;
      margin: 0.1rem auto;
      padding: 0 0.1rem;
      list-style: none;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: flex-start;  
    }
    .value {
      width: 100%;
      margin-top: 0.08rem;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: flex-start;
    }
    .value span {
      text-align: start;
    }
    .imgtitle {
      margin: 0.08rem 0px;
      font-size: 0.14rem;
    }
    .closePopup {
      width: 0.12rem;
      height: 0.12rem;
      cursor: pointer;
    }
    .outletImg {
      width: 100%;
      height: auto;
    }
    .lon {
      margin-bottom: 0.08rem;
    }
</style>