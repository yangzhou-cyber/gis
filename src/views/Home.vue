<template>
  <div class="home" style="position: relative" id="home">
    <!-- nav -->
    <div class="nav"></div>
    <!-- 地图 -->
    <div id="map"></div>

    <!-- 占地图例信息 -->
    <ul id="landmark" v-if="isPlace">
      <li class="landItem" v-for="(item, index) in landuseList" :key="index">
        <span class="landName">{{ item.lc }}</span>
        <span class="landcolor" :style="{ background: item.color }"></span>
      </li>
    </ul>

    <!-- 统计弹框 -->
    <div class="chart" v-if="isPoint || isPlace">
      <div class="chartBox">
        <div class="cancelChart" @click="cancelChart">
          <img class="closeBtn" src="../assets/img/gisdemo/close.png" alt="" />
        </div>
        <div class="chartContent">
          <div class="pointChart" v-if="isPoint">
            <div class="placeTitle">采样点数据分析</div>
            <div class="chooseParams">
              <p
                class="parmasItem"
                v-for="(item, index) in paramsList"
                :key="index"
                :class="{ pointParamsActive: checkedPointParams == index }"
                @click="choosePointItem(item.value, index)"
              >
                {{ item.name }}
              </p>
            </div>
            <div class="utilslist">
              <p class="utils" v-if="isParams == 'tp'">(μg/L)</p>
              <p class="utils" v-else>(mg/L)</p>
            </div>
            <point-qulity :dataList="pointParamsData"></point-qulity>
            <p class="pointId">(点号)</p>
          </div>

          <div class="placeChart" v-if="isPlace">
            <div class="placeTitle">土地利用数据分析</div>
            <land-use :dataList="landuseList" :color="landColor"></land-use>
          </div>
        </div>
      </div>
    </div>

    <!-- 弹出框 -->
    <div class="showPopupPoint" ref="popup">
      <popup-compoents
        :dataList="popupData"
        @closePopup="closePointPopup"
      ></popup-compoents>
    </div>

    <div class="showPopupPlace" ref="placePopup">
      <place-component
        :dataList="popupPlace"
        @closePlace="closePlacePopup"
      ></place-component>
    </div>

    <div class="showPopupOutlet" ref="outletPopup">
      <outlet-components
        :dataList="popupOutlet"
        :checked="checkedRiver"
        @closeOutlet="closeOutletPopup"
      ></outlet-components>
    </div>

    <!-- 右侧控制栏 -->
    <div id="rightSide">
      <!-- 标题 -->
      <div class="controlTitle">图层管理</div>
      <!-- 河道切换 -->
      <el-row class="tac">
        <el-col :span="12">
          <el-menu
            class="menu-vertical-demo"
            @open="selectRiver"
            :unique-opened="true"
          >
            <el-submenu
              v-for="(item, index) in riverList"
              :index="index + ''"
              :key="index"
              @close="handleClose"
            >
              <template slot="title">
                <span>{{ item.name }}</span>
              </template>
              <el-menu-item-group>
                <template slot="title">反演结果</template>
                <el-menu-item
                  v-for="($item, $index) in item.item"
                  :key="$index"
                  :index="index + $index + 1 + ''"
                  @click="selectParams($item.type, $item.value, index, $index)"
                  :class="{ paramsActive: checkedParamsActive == $item.type }"
                  >{{ $item.name }}: {{ $item.cf }}</el-menu-item
                >
              </el-menu-item-group>
              <el-menu-item-group>
                <template slot="title">风险源</template>
                <el-menu-item
                  v-for="($item, $index) in refList"
                  :key="$index"
                  :index="index + '-5'"
                >
                  <input
                    :id="'tip' + index + '-2' + $index"
                    type="checkbox"
                    @change="selectRef($event, $index, index)"
                    v-model="checked[index][$index]"
                  />
                  <label
                    class="refcheck"
                    :for="'tip' + index + '-2' + $index"
                    >{{ $item }}</label
                  >
                </el-menu-item>
              </el-menu-item-group>
            </el-submenu>
          </el-menu>
        </el-col>
      </el-row>
    </div>

    <div class="markBox">
      <!-- 色带 -->
      <div class="colorMark" v-if="showColor">
        <div class="colorMain">
          <p class="colorImg" alt=""></p>
          <p class="colorValue">
            <span>{{ colorHL && colorHL.value.low }}</span>
            <span v-if="checkedParams == 'tp'">单位：μg/L</span>
            <span v-else>单位：mg/L</span>
            <!-- <span v-if="checkedParams=='tp'">{{colorHL&&colorHL.value.high*200}}</span> -->
            <span v-if="checkedParams == 'tp'">500</span>
            <span v-else>{{ colorHL && colorHL.value.high }}</span>
          </p>
        </div>
      </div>
      <!-- 排口、采样点 标志信息 -->
      <ul class="mark">
        <li class="markItem" v-if="isPoint">
          <span>采样点</span>
          <img class="markImg" src="../assets/img/gisdemo/point.png" alt="" />
        </li>
        <li class="markItem" v-if="isOutlet">
          <span>排水口</span>
          <img class="markImg" src="../assets/img/gisdemo/outlet.png" alt="" />
        </li>
      </ul>
    </div>

    <!-- 地图切换 -->
    <div id="changeMap">
      <div class="mapItem">
        <label
          class="mapText"
          for="osm"
          :class="{ mapActive: isChecked == 'osm' }"
          >OSM</label
        >
        <input type="checkbox" id="osm" :checked="isChecked == 'osm'" />
      </div>
      <div class="mapItem google">
        <label
          class="mapText"
          for="google"
          :class="{ mapActive: isChecked == 'google' }"
          >Google</label
        >
        <input type="checkbox" id="google" :checked="isChecked == 'google'" />
      </div>
      <div class="mapItem">
        <label class="unaMap" for="UAV" :class="{ mapActive: isUAV }"
          >无人机影像图</label
        >
        <input type="checkbox" id="UAV" :checked="isUAV" />
      </div>
    </div>
    <div
      style="
        position: absolute;
        left: 50px;
        bottom: 50px;
        background: #fff;
        padding: 5px 20px;
        cursor: pointer;
      "
      ref="length"
    >
      测距
    </div>
  </div>
</template>

<script>
import pointQulity from "./leftCompoents/pointQulity";
import landUse from "./leftCompoents/landUse";
import popupCompoents from "./leftCompoents/popupComponents";
import placeComponent from "./leftCompoents/placeComponent";
import outletComponents from "./leftCompoents/outletComponents";
import { getService } from "@/utils/service";
import "ol/ol.css";
import { Map as OMap, View } from "ol";
import {
  OSM,
  ImageArcGISRest,
  XYZ,
  TileArcGISRest,
  Vector as VectorSource,
  ImageWMS,
  TileWMS,
} from "ol/source";
import {
  Tile as TileLayer,
  Image as ImageLayer,
  Vector as VectorLayer,
} from "ol/layer";
import {
  transform,
  get as getProjection,
  getTransform,
  addProjection,
  addCoordinateTransforms,
} from "ol/proj";
import TileGrid from "ol/tilegrid/TileGrid";
import GeoJSON from "ol/format/GeoJSON";
import { Fill, Stroke, Style, Circle, Icon } from "ol/style";
import jsonp from "jsonp";
import WMSCapabilities from "ol/format/WMSCapabilities";
import axios from "axios";
// 弹出框
import { Select } from "ol/interaction";
import Overlay from "ol/Overlay";
import { Point, MultiPolygon } from "ol/geom";
// 重新投影
import { applyTransform } from "ol/extent";
import proj4 from "proj4";
import proj from "ol/proj";
import { Projection } from "ol/proj";
import * as control from "ol/control";
import { register } from "ol/proj/proj4";
import LandUse from "./leftCompoents/landUse.vue";
import WMSGetFeatureInfo from "ol/format/WMSGetFeatureInfo";
// 全屏
import { FullScreen } from "ol/control";
import { Draw, Modify, Snap } from "ol/interaction";
axios.defaults.baseURL = process.env.VUE_APP_BASE_URL;
import length from "@/utils/length";
export default {
  name: "gisdemo-index",
  data() {
    return {
      // 数据初始
      pointParamsData: [], // 当前采样点对应参数的具体数据
      pointList: [], // 当前采样点数据
      landuseList: [], // 当前土地数据
      colorHL: {}, // 当前色带数据
      colorList: [], // 当前河道4个色带参数
      allPointList: [], // 所有采样点数据
      allLanduseList: [], // 所有土地参数
      allcolorList: [], // 所有色带参数
      popupData: {}, // 采样点弹出框数据
      popupPlace: {}, // 土地弹出框数据
      popupOutlet: {}, // 排口弹出框数据
      overlay: null, // 采样点弹出框
      overlayPlace: null, // 土地弹出框
      overlayOutlet: null, // 排口弹出框
      // 控制数据初始
      showColor: false, // 控制色带显示影藏
      checkedRiver: 0, // 当前河道
      checkedParams: "cod", // 当前参数
      checkedParamsActive: "", // 当前选中参数高亮显示
      checkedRef: false, // 当前主题，是否被选中
      checkedPointParams: 0, // 当前采样点参数
      isChecked: "google", //
      isPoint: false, // 是否点击采样点
      isPlace: false, // 是否点击土地
      isOutlet: false, // 是否为排口
      isUAV: false, //是否叠加无人机
      isParams: "cod", // 统计图参数
      // 总菜单
      riverList: [
        {
          id: 0,
          name: "解溪河",
          item: [
            { type: "cod", value: 1, name: "高锰酸盐指数", cf: "COD_Mn" },
            { type: "tn", value: 2, name: "总氮", cf: "TN" },
            { type: "tp", value: 3, name: "总磷", cf: "TP" },
            { type: "nh4_n", value: 4, name: "氨氮", cf: "NH4_N" },
          ],
        },
        {
          id: 5,
          name: "东风河",
          item: [
            { type: "cod", value: 6, name: "高锰酸盐指数", cf: "COD_Mn" },
            { type: "tn", value: 7, name: "总氮", cf: "TN" },
            { type: "tp", value: 8, name: "总磷", cf: "TP" },
            { type: "nh4_n", value: 9, name: "氨氮", cf: "NH4_N" },
          ],
        },
        {
          id: 10,
          name: "秦淮新河",
          item: [
            { type: "cod", value: 11, name: "高锰酸盐指数", cf: "COD_Mn" },
            { type: "tn", value: 12, name: "总氮", cf: "TN" },
            { type: "tp", value: 13, name: "总磷", cf: "TP" },
            { type: "nh4_n", value: 14, name: "氨氮", cf: "NH4_N" },
          ],
        },
      ],
      // 主题菜单
      refList: ["排口", "采样点", "土地利用"],
      // 采样点参数
      paramsList: [
        { value: "cod", name: "COD_Mn" },
        { value: "nh4_n", name: "NH4_N" },
        { value: "tn", name: "TN" },
        { value: "tp", name: "TP" },
      ],
      // 主题选中数据
      checked: [
        [false, false, false],
        [false, false, false],
        [false, false, false],
      ],
      // 地图数据初始
      map: null,
      view: null,
      num: 0,
      source: null,
      sourceDong4: null,
      tileDong: null, // 参数反演图层
      place: null, // 土地利用图层
      adrainageLayer: null, // 排口图层
      tileNoman: null,
      river: "river2",
      landColorList: [],
      landColor: null,
      center: [116.632997, 30.113954],
      zoom: 12,
      select: null, // 覆盖框overlay选中
      pointActiveIcon: null, // 选中采样点样式
      outletActiveIcon: null, // 选中排口样式
    };
  },
  components: {
    pointQulity,
    landUse,
    popupCompoents,
    placeComponent,
    outletComponents,
  },
  watch: {
    isPoint(newValue) {},
    checked: {
      deep: true,
      handler() {},
    },
  },
  created() {
    // wfs
    let vectorDot = new VectorSource({
      projection: "EGSP:3857",
    });
    let paramVaules = {};
    axios
      .get(
        "/api" +
          "?service=WFS&version=1.0.0&request=GetFeature&typeName=demo%3Asample_all&maxFeatures=50"
      )
      .then((res) => {
        let features = new WMSGetFeatureInfo().readFeatures(res.data);
        features.forEach((feature) => {
          let obj = feature.getProperties();
          if (paramVaules[obj["river"]]) {
            paramVaules[obj["river"]].cod.push({
              value: parseFloat(obj.cod),
              key: ~~paramVaules[obj["river"]].cod.length + 1 + "",
            });
            paramVaules[obj["river"]].tp.push({
              value: parseFloat(obj.tp),
              key: ~~paramVaules[obj["river"]].tp.length + 1 + "",
            });
            paramVaules[obj["river"]].tn.push({
              value: parseFloat(obj.tn),
              key: ~~paramVaules[obj["river"]].tn.length + 1 + "",
            });
            paramVaules[obj["river"]]["nh4_n"].push({
              value: parseFloat(obj["nh4_n"]),
              key: ~~paramVaules[obj["river"]]["nh4_n"].length + 1 + "",
            });
          } else {
            paramVaules[obj["river"]] = {};
            paramVaules[obj["river"]].cod = [
              {
                value: parseFloat(obj.cod),
                key: "1",
              },
            ];
            paramVaules[obj["river"]].tp = [
              {
                value: parseFloat(obj.tp),
                key: "1",
              },
            ];
            paramVaules[obj["river"]].tn = [
              {
                value: parseFloat(obj.tn),
                key: "1",
              },
            ];
            paramVaules[obj["river"]]["nh4_n"] = [
              {
                value: parseFloat(obj["nh4_n"]),
                key: "1",
              },
            ];
          }
        });
        vectorDot.addFeatures(features);
        for (var key in paramVaules) {
          this.allPointList.push(paramVaules[key]);
        }
      });
    let icon = new Style({
      image: new Icon({
        anchor: [0.5, 0.5],
        src: require("@/assets/img/gisdemo/point.png"),
        crossOrigin: "",
        scale: [0.8, 0.8],
        rotation: Math.PI / 4,
        rotateWithView: true,
      }),
    });
    this.pointActiveIcon = new Style({
      image: new Icon({
        anchor: [0.5, 0.5],
        src: require("@/assets/img/gisdemo/point-h.png"),
      }),
    });
    this.outletActiveIcon = new Style({
      image: new Icon({
        anchor: [0.5, 0.5],
        src: require("@/assets/img/gisdemo/outlet-h.png"),
      }),
    });
    this.dotPlace = new VectorLayer({
      source: vectorDot,
      style: icon,
      visible: false,
    });
    // color色带数据
    let regions = [];
    axios
      .get(
        "http://121.4.38.11:6080/arcgis/rest/services/demo/result_rasters/MapServer/legend?f=pjson"
      )
      .then((res) => {
        let layers = res.data.layers;
        layers.forEach((layer) => {
          let region = { high: 0, low: 0 };
          let obj = { type: layer.layerName, value: region };
          layer.legend.forEach((label) => {
            let stop = label.label;
            let arr = stop.split(":");
            if (arr.length > 1) {
              arr[1] = parseFloat(arr[1]);
              if (region.high > arr[1]) {
                region.low = arr[1];
              } else {
                region.high = arr[1];
              }
            }
          });
          regions.push(obj);
        });

        this.allcolorList = regions;
        // 分割每条河的色带值
      });
  },
  mounted() {
    // console.log(getService('wfs'));
    // 排口数据
    let adrainage = new VectorSource({});
    axios
      .get(
        "/name" +
          "?service=WFS&version=1.0.0&request=GetFeature&typeName=demo%3Awatercourses&maxFeatures=50"
      )
      .then((res) => {
        let features = new WMSGetFeatureInfo(res.data).readFeatures(res.data);
        adrainage.addFeatures(features);
      });
    let circle = new Style({
      image: new Icon({
        anchor: [0.5, 0.5],
        src: require("@/assets/img/gisdemo/outlet.png"),
        crossOrigin: "",
        scale: [0.7, 0.7],
        rotation: Math.PI / 4,
        rotateWithView: true,
      }),
    });
    this.adrainageLayer = new VectorLayer({
      source: adrainage,
      style: circle,
      visible: false,
    });
    // 颜色
    // 土地占有面积
    this.landColor = [
      ["居民小区", "#F4102F"],
      ["城市绿化用地", "#00FF3E"],
      ["道路", "#666666"],
      ["河道边坡生态岸线", "#00B800"],
      ["商服用地", "#FFA975"],
      ["建筑工地", "#D09500"],
      ["建设用地", "#7FFFFF"],
      ["生态绿化用地", "#6DD400"],
      ["生态护岸", "#A6FF47"],
      ["农田", "#E3D700"],
      ["草地", "#29CD29"],
      ["灌木林地", "#5D954A"],
      ["交通用地", "#A0A0A0"],
      ["居民点", "#B9B85B"],
      ["堆料场", "#8D9117"],
      ["工矿企业", "#B98A5C"],
      ["未利用地", "#B9B85B"],
      ["水域", "#18B4FF"],
      ["教育用地", "#FD81BF"],
      ["居民地", "#1E6510"],
      ["拆迁未利用地", "#7FFFFF"],
      ["堆土", "#571919 "],
      ["林地", "brown"],
    ];
    this.landColorList = this.landColor; // 土地占有面积

    let styleFunction = this.landColor.map((item) => {
      let style = new Style({
        fill: new Fill({
          color: item[1],
        }),
      });
      return [item[0], style];
    });
    styleFunction = new Map(styleFunction);
    this.landColor = new Map(this.landColor);
    let landData = {};
    let vector = new VectorSource({});
    axios
      .get(
        "/api" +
          "?service=WFS&version=1.0.0&request=GetFeature&typeName=demo%3Alanduse_all"
      )
      .then((res) => {
        let features = new WMSGetFeatureInfo().readFeatures(res.data);
        features.forEach((feature) => {
          vector.addFeatures(features);
          let obj = feature.getProperties();
          obj.color = this.landColor.get(obj.lc);
          if (landData[obj.objectid]) {
            landData[obj.objectid].push(obj);
          } else {
            landData[obj.objectid] = [obj];
          }
        }); // 土地占比数据
        this.allLanduseList = landData;
        this.landuseList = this.allLanduseList[1]; // 设置土地占比初始值
      });

    this.place = new VectorLayer({
      source: vector,
      opacity: 0.5,
      style: (feature) => {
        let lc = feature.getProperties().lc;
        return styleFunction.get(lc);
      },
      visible: false,
    });

    // 加载切片服务
    // 河道无人机影像（3条）

    // tms
    let resolutionsDong = [
      52.91677250021167,
      26.458386250105836,
      13.229193125052918,
      6.614596562526459,
      3.9687579375158752,
      2.6458386250105836,
      1.3229193125052918,
      0.7937515875031751,
      0.26458386250105836,
      0.13229193125052918,
      0.06614596562526459,
    ];
    let originDong = [-2.00377e7, 3.02411e7];
    let extentDong = [
      1.3208182632841771e7,
      3745046.606619288,
      1.3236917029063372e7,
      3763312.538603185,
    ];
    let tileGridDong = new TileGrid({
      tileSize: 128,
      resolutions: resolutionsDong,
      origin: originDong,
      extent: extentDong,
    });
    let sourceDong = new XYZ({
      crossOrigin: "Anonymous",
      tileUrlFunction: function (coordinate) {
        return (
          "http://121.4.38.11:6080/arcgis/rest/services/demo/photo/MapServer/tile/" +
          coordinate[0] +
          "/" +
          coordinate[2] +
          "/" +
          coordinate[1]
        );
      },
      tileGrid: tileGridDong,
    });
    this.tileNoman = new TileLayer({
      // opacity: 0.8,
      minZoom: 14,
      source: sourceDong,
      visible: false,
    });

    // 切换图层、加载栅格图层

    // 东风4参数

    // wms
    this.sourceDong4 = new ImageArcGISRest({
      // params: { layers: "show:0" },
      ratio: 1,
      url:
        "http://121.4.38.11:6080/arcgis/rest/services/demo/result_rasters/MapServer",
    });
    this.tileDong = new ImageLayer({
      opacity: 0.8,
      source: this.sourceDong4,
      visible: false,
    });

    // 底图
    let google = new TileLayer({
      projection: "EPSG:4326",
      title: "谷歌地图服务",
      source: new XYZ({
        url: "http://mt1.google.cn/vt/lyrs=s&x={x}&y={y}&z={z}",
      }),
      visible: true,
    });
    let osm = new TileLayer({
      source: new OSM(),
      opacity: 0.5,
      visible: false,
    });

    this.view = new View({
      // minZoom: 11,
      maxZoom: 19,
      zoom: 17,
      center: transform([118.803623, 31.998328], "EPSG:4326", "EPSG:3857"),
    });
    this.map = new OMap({
      controls: control
        .defaults({ attribution: false, zoom: false, rotate: false })
        .extend([
          new FullScreen({
            source: "home",
          }),
        ]),
      logo: "false",
      target: "map",
      layers: [
        osm,
        google,
        this.place,
        this.tileNoman,
        // getService('tms'),
        // 土地
        this.tileDong, // 四参数
        this.dotPlace, //采样点
        this.adrainageLayer, // 排口
      ],
      view: this.view,
    });
    this.$refs.length.addEventListener("click", length(this.map,'LineString'));

    // 切换底图  与无人机影像的叠加
    let changeMap = document.getElementById("changeMap");
    changeMap.addEventListener("click", (event) => {
      if (event.target.checked) {
        switch (event.target.id) {
          case "osm":
            this.isChecked = "osm";
            this.map.getLayers().item(0).setVisible(true);
            this.map.getLayers().item(1).setVisible(false);
            break;
          case "google":
            this.isChecked = "google";
            this.map.getLayers().item(0).setVisible(false);
            this.map.getLayers().item(1).setVisible(true);
            break;
          case "UAV":
            this.isUAV = true;
            this.map.getLayers().item(3).setVisible(true);
            break;
          default:
            break;
        }
      } else {
        switch (event.target.id) {
          case "osm":
            this.isChecked = "google";
            this.map.getLayers().item(0).setVisible(false);
            this.map.getLayers().item(1).setVisible(true);
            break;
          case "google":
            this.isChecked = "google";
            this.map.getLayers().item(1).setVisible(true);
            this.map.getLayers().item(0).setVisible(false);
            break;
          case "UAV":
            this.isUAV = false;
            this.map.getLayers().item(3).setVisible(false);
            break;
          default:
            break;
        }
      }
    });
    // 采样点弹出框
    this.overlay = new Overlay({
      element: this.$refs.popup,
      autoPan: true,
      positioning: "bottom-center",
    });
    // 土地弹出框
    this.overlayPlace = new Overlay({
      element: this.$refs.placePopup,
      autoPan: true,
      positioning: "bottom-center",
    });
    // 排口弹出框
    this.overlayOutlet = new Overlay({
      element: this.$refs.outletPopup,
      autoPan: true,
      positioning: "bottom-center",
    });

    this.select = new Select({
      style: (feature) => {
        let properties = feature.getProperties();
        if (properties.geom instanceof Point) {
          if (properties.river) {
            // 表示为采样点数据
            return this.pointActiveIcon;
          } else {
            // 表示为排口数据
            return this.outletActiveIcon;
          }
        } else {
          return new Style({
            stroke: new Stroke({
              color: "cyan",
              width: 5,
            }),
          });
        }
      },
    });
    // this.map.addInteraction(this.select);
    this.select.on("select", (e) => {
      if (e.selected.length > 0) {
        let properties = e.selected[0].getProperties();
        if (properties.geom instanceof Point) {
          this.map.removeOverlay(this.overlayPlace);
          if (properties.river) {
            // 表示为采样点数据
            this.popupData = properties;
            console.log(properties);
            let coordinate = e.mapBrowserEvent.coordinate;
            this.overlay.setPosition(coordinate);
            this.overlay.setOffset([140, -10]);
            this.map.removeOverlay(this.overlayOutlet);
            this.map.addOverlay(this.overlay);
          } else {
            // 表示为排口数据
            this.popupOutlet = properties;
            let coordinate = e.mapBrowserEvent.coordinate;
            this.overlayOutlet.setPosition(coordinate);
            this.overlayOutlet.setOffset([140, -10]);
            this.map.removeOverlay(this.overlay);
            this.map.addOverlay(this.overlayOutlet);
          }
        }

        if (properties.geom instanceof MultiPolygon) {
          this.popupPlace = properties;
          let coordinate = e.mapBrowserEvent.coordinate;
          this.overlayPlace.setPosition(coordinate);
          this.overlayPlace.setOffset([140, -10]);
          this.map.removeOverlay(this.overlay);
          this.map.removeOverlay(this.overlayOutlet);
          this.map.addOverlay(this.overlayPlace);
        }
      } else {
        this.map.removeOverlay(this.overlay);
        this.map.removeOverlay(this.overlayPlace);
        this.map.removeOverlay(this.overlayOutlet);
      }
    });

    // 点击非地图区域控制弹框消失
    let meunTab = document.getElementById("rightSide");
    let mapTab = document.getElementById("changeMap");
    meunTab.addEventListener("click", () => {
      this.select.getFeatures().clear();
      this.map.removeOverlay(this.overlay);
      this.select.getFeatures().clear();
      this.map.removeOverlay(this.overlayPlace);
      this.select.getFeatures().clear();
      this.map.removeOverlay(this.overlayOutlet);
    });
    mapTab.addEventListener("click", () => {
      this.select.getFeatures().clear();
      this.map.removeOverlay(this.overlay);
      this.select.getFeatures().clear();
      this.map.removeOverlay(this.overlayPlace);
      this.select.getFeatures().clear();
      this.map.removeOverlay(this.overlayOutlet);
    });
  },
  methods: {
    // 菜单按钮
    // 选择采样点、土地
    selectRef($event, $index, index) {
      // 显示图层以及处理相应的数据
      // 1-1 排口显示
      if ($index == 0) {
        if ($event.target.checked) {
          this.isOutlet = true;
          this.adrainageLayer.setVisible(true);
        } else {
          this.isOutlet = false;
          this.adrainageLayer.setVisible(false);
        }
      }
      // 1-2 采样点显示
      if ($index == 1) {
        if (index == 0) {
          index = 2;
        } else if (index == 1) {
          index = 0;
        } else if (index == 2) {
          index = 1;
        }
        if ($event.target.checked) {
          // 设置初始采样点统计图数据
          this.pointList = this.allPointList[index];
          this.pointParamsData = this.pointList.cod;
          // 设置采样点图层以及采样点数据显示
          this.dotPlace.setVisible(true);
          this.isPoint = true;
          // 设置排水口以及土地数据不显示
        } else {
          this.dotPlace.setVisible(false);
          this.isPoint = false;
        }
      }
      // 1-3 土地利用图层显示
      if ($index == 2) {
        if (index == 0) {
          index = 3;
        }
        if ($event.target.checked) {
          // 1-3-1 设置面积占比数据
          let arr = this.allLanduseList[index];

          let data = [];
          arr.forEach((item) => {
            for (var i = 0; i < data.length; i++) {
              if (item.lc == data[i].lc) {
                data[i].area += parseFloat(item.area);
                data[i].ratio += parseFloat(item.ratio);
                break;
              }
            }
            if (i == data.length) {
              data[data.length] = {
                area: parseFloat(item.area),
                ratio: parseFloat(item.ratio),
                color: item.color,
                lc: item.lc,
              };
            }
          });
          this.landuseList = data;
          // 1-3-2 设置土地统计图显示，排口以及采样点统计图关闭
          this.isPlace = true;
          // this.isPoint = false;
          // this.isOutlet = false;
          // 1-3-3 设置土地图层显示
          this.place.setVisible(true);
        } else {
          this.place.setVisible(false);
          this.isPlace = false;
        }
      }
      // 2.默认选中第一个参数
      this.checkedPointParams = 0;
      this.isParams = "cod";
    },

    // 选择反演参数
    selectParams(type, id, index, $index) {
      // 1.显示四参数的图层并展示对应的图层
      this.tileDong.setVisible(true);
      this.sourceDong4.updateParams({ layers: "show:" + id });
      // 2.显示色带以及相应的值
      this.showColor = true;
      this.checkedParams = type;
      this.checkedParamsActive = type;
      let l = 4 * this.checkedRiver;
      for (let i = l; i < l + 4; i++) {
        this.colorList.push(this.allcolorList[i]);
      }
      this.colorHL = this.colorList[$index];
    },

    // 选择河道
    selectRiver(index) {
      this.isParams = "cod";
      this.checkedParamsActive = "";
      this.checkedPointParams = 0;
      // 初始化this.colorList 东风河
      // 1.根据所选河道变换对应的位置以及缩放信息
      // 设置当前河道值为index
      this.checkedRiver = parseInt(index.slice(0, 1));
      if (index == 0) {
        this.view.animate({
          center: transform([118.89544, 31.884104], "EPSG:4326", "EPSG:3857"),
          zoom: 15,
        });
      }
      if (index == 1) {
        this.view.animate({
          center: transform([118.803623, 31.998328], "EPSG:4326", "EPSG:3857"),
          zoom: 17,
        });
      }
      if (index == 2) {
        this.view.animate({
          center: transform([118.668429, 31.965454], "EPSG:4326", "EPSG:3857"),
          zoom: 15,
        });
      }
      // 2.初始化参数反演图层不显示
      this.tileDong.setVisible(false);
      // 3.初始化土地利用图层不显示
      this.place.setVisible(false);
      // 4.排口不显示
      this.adrainageLayer.setVisible(false);
      // 5.采样点不显示
      this.dotPlace.setVisible(false);
      // 6.色带数据为空且不显示
      this.colorList = [];
      this.showColor = false;
      // 7.关闭统计数据图表
      this.isPoint = false;
      this.isPlace = false;
      this.isOutlet = false;
      // 8.关闭弹出框
      this.map.removeOverlay(this.overlay);
      this.map.removeOverlay(this.overlayPlace);
      this.map.removeOverlay(this.overlayOutlet);
      // 9.取消所有菜单勾选
      this.checked = this.checked.map((arr) => [false, false, false]);
    },
    // 关闭河道菜单
    handleClose(key, keyPath) {
      this.isPoint = false;
      this.isPlace = false;
    },
    // 设置坐标系
    setProjection(code, name, proj4def, bbox) {
      var newProjCode = "EPSG:" + code;
      proj4.defs(newProjCode, proj4def);
      register(proj4);
      var newProj = getProjection(newProjCode);
      var fromLonLat = getTransform("EPSG:4326", newProj);

      var worldExtent = [bbox[1], bbox[2], bbox[3], bbox[0]];
      newProj.setWorldExtent(worldExtent);
      if (bbox[1] > bbox[3]) {
        worldExtent = [bbox[1], bbox[2], bbox[3] + 360, bbox[0]];
      }
      var extent = applyTransform(worldExtent, fromLonLat, undefined, 8);
      newProj.setExtent(extent);
      addProjection(newProj);
      addCoordinateTransforms(
        "EPSG:4326",
        "EPSG:32650",
        function (coordinate) {
          return proj4("EPSG:4326", "EPSG:32650", coordinate);
        },
        function (coordinate) {
          return proj4("EPSG:32650", "EPSG:4326", coordinate);
        }
      );
    },
    // 关闭统计数据弹框
    cancelChart() {
      this.isPoint = false;
      this.isPlace = false;
    },
    // 选择采样点参数
    choosePointItem(item, index) {
      this.isParams = item;
      this.checkedPointParams = index;
      this.pointParamsData = this.pointList[item];
    },
    // 自定义事件关闭弹出框
    closePointPopup() {
      // 关闭采样点弹出框
      this.select.getFeatures().clear();
      this.map.removeOverlay(this.overlay);
    },
    closePlacePopup() {
      this.select.getFeatures().clear();
      this.map.removeOverlay(this.overlayPlace);
    },
    closeOutletPopup() {
      this.select.getFeatures().clear();
      this.map.removeOverlay(this.overlayOutlet);
    },
  },
};
</script>

<style>
html,
body {
  height: 100%;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
.home,
#map {
  overflow: hidden;
  width: 100%;
  height: 100%;
  position: relative;
}
/* 导航大标题 */
.nav {
  z-index: 99;
  width: 100%;
  height: 0.7rem;
  background-image: url("../assets/img/gisdemo/top.png");
  background-size: cover;
  position: absolute;
  top: 0px;
}
/* 全屏 */
/deep/.ol-full-screen,
.ol-control {
  position: absolute;
  right: 0.5em;
  top: 5em;
}
/* 标志信息 */
.mark {
  /* width: 120px; */
  height: 0.3rem;
  margin-left: 0.1rem;
  list-style: none;
  font-size: 0.14rem;
  color: #fff;
  background-color: rgba(51, 51, 51, 0.576);
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.markItem {
  width: 100%;
  margin: 0 0.1rem;
  display: flex;
  justify-content: center;
  align-items: center;
}
.markImg {
  width: 0.18rem;
  height: 0.18rem;
  margin-left: 0.1rem;
}
/*  */
.markBox {
  position: absolute;
  bottom: 0.1rem;
  left: 0.1rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}
/* 色带 */
.colorMark {
  padding: 0.1rem;
  color: #333;
  font-size: 0.12rem;
  background-color: rgb(249, 251, 253);
}
.colorMain {
  margin-top: 0.04rem;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: flex-start;
}
.colorMain .colorImg {
  height: 0.14rem;
  width: 1.6rem;
  background-image: url("../assets/img/gisdemo/color.png");
  background-size: contain;
}
.colorValue {
  height: 0.15rem;
  width: 1.6rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
/* 菜单 */
#rightSide {
  width: 2rem;
  position: absolute;
  top: 1.2rem;
  right: 0.1rem;
}
.controlTitle {
  width: 2rem;
  height: 0.4rem;
  padding-left: 0.2rem;
  font-size: 0.16rem;
  font-weight: 600;
  color: #333;
  background-color: #fff;
  line-height: 0.4rem;
  text-align: start;
}
.el-menu {
  width: 2rem;
  overflow: hidden;
}
/deep/ .el-menu-item-group {
  padding: 0;
  background-color: #eeeeee;
  font-size: 0.1rem;
  color: #666666;
}

/deep/ .el-menu-item {
  padding-left: 0.4rem !important;
  font-size: 0.12rem;
  position: relative;
}
/deep/ .el-menu-item-group .el-submenu__title {
  font-weight: 400;
  font-size: 0.12rem;
  padding-left: 0.4rem !important;
}
/deep/.el-menu-item-group .el-submenu .el-menu .el-menu-item {
  padding-left: 0.5rem !important;
}
/deep/ .el-submenu__title {
  height: 0.4rem;
  line-height: 0.4rem;
  padding: 0.2rem !important;
  display: flex;
  align-items: center;
  font-weight: 600;
}

/deep/.el-menu-item-group .el-menu-item-group__title {
  padding-left: 0.25rem !important;
  font-size: 0.13rem;
  color: #333;
}
.el-menu-item.is-active {
  color: #333;
}
.el-submenu {
  text-align: start;
}
.refcheck {
  height: 100%;
  margin-left: 0.08rem;
  line-height: 0.5rem;
}
/* 数据统计弹框 */
.chart {
  width: 3.6rem;
  position: absolute;
  top: 0.8rem;
  left: 0.1rem;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: flex-start;
}
.chartBtn {
  width: 0.8rem;
  height: 0.22rem;
  background-image: url("../assets/img/gisdemo/head-date.png");
  background-size: cover;
}
.chartBox {
  width: 100%;
  margin-top: 0.04rem;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: flex-start;
  background: rgb(255, 255, 255);
}
.cancelChart {
  width: 100%;
  padding: 0.1rem 0.2rem 0 0;
  font-size: 0.16rem;
  color: rgba(51, 51, 51, 0.822);
  text-align: end;
}
.closeBtn {
  width: 0.14rem;
  height: 0.14rem;
  cursor: pointer;
}
.chartContent {
  width: 100%;
}
.pointChart {
  position: relative;
  padding-bottom: 0.2rem;
}
.chooseParams {
  width: 90%;
  margin: 0 auto;
  display: flex;
  justify-content: space-around;
  align-items: center;
}
.parmasItem {
  width: 0.55rem;
  height: 0.23rem;
  margin-bottom: 0.1rem;
  background-color: #eeeeee;
  display: flex;
  justify-content: space-around;
  align-items: center;
  color: #000;
  font-size: 0.12rem;
  line-height: 0.23rem;
}
.utils {
  font-size: 0.12rem;
  color: #666;
  text-align: start;
  padding-left: 0.4rem;
}
.pointId {
  font-size: 0.12rem;
  color: #666;
  position: absolute;
  bottom: 0.2rem;
  right: 0.3rem;
}
.placeChart {
  width: 100%;
  /* padding: 10px; */
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;
}
.placeTitle {
  width: 100%;
  text-align: start;
  padding-left: 0.2rem;
  margin-bottom: 0.1rem;
  font-size: 0.14rem;
  font-weight: 600;
  color: #000;
}

/* 弹出框 */
.showPopupPoint {
  width: 2.2rem;
  height: 1.6rem;
  padding: 0.1rem;
  background-color: rgb(255, 255, 255);
}
.showPopupPlace {
  width: 2.2rem;
  height: 1.4rem;
  padding: 0.1rem;
  background-color: rgb(255, 255, 255);
}
.showPopupOutlet {
  width: 2.2rem;
  height: 2.5rem;
  padding: 0.1rem;
  background-color: rgb(255, 255, 255);
}
/* 底图 */
#changeMap {
  width: 2.4rem;
  position: absolute;
  bottom: 0.1rem;
  right: 0rem;
  display: flex;
  justify-content: space-around;
  align-items: center;
}
.mapItem {
  display: flex;
}
.mapText {
  width: 0.6rem;
  height: 0.24rem;
  color: #333333;
  font-size: 0.12rem;
  font-weight: 600;
  line-height: 0.24rem;
  background-color: #ffffff;
  cursor: pointer;
}
.unaMap {
  width: 0.9rem;
  height: 0.24rem;
  color: #333333;
  font-size: 0.12rem;
  font-weight: 600;
  line-height: 0.24rem;
  background-color: #ffffff;
  cursor: pointer;
}
.google {
  margin-left: -0.16rem;
}
#changeMap input {
  display: none;
}
/* 土地占比图例信息 */
#landmark {
  max-width: 5.5rem;
  list-style: none;
  position: absolute;
  bottom: 0.1rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  align-content: flex-start;
  color: #000;
  background-color: #eeeeee;
  font-size: 0.12rem;
}
.landItem {
  margin: 0.1rem;
  display: flex;
  justify-content: space-around;
  align-items: center;
}
.landItem .landcolor {
  width: 0.1rem;
  height: 0.1rem;
  margin-left: 0.1rem;
}

/* 高亮显示 */
.btnActive {
  background-color: #0091ff;
}
.riverActive {
  background-image: url("../assets/img/gisdemo/river-h.png");
  background-size: contain;
}
.refActive {
  background-image: url("../assets/img/gisdemo/button-h.png");
  background-size: cover;
}
.paramsActive {
  color: #fff !important;
  background-color: #0091ff !important;
}
.mapActive {
  color: #fff;
  font-size: 0.12rem;
  background-color: #0091ff;
}
.pointParamsActive {
  height: 0.23rem;
  color: #fff;
  font-size: 0.12rem;
  background: #0091ff;
}

/*  */
.cursor {
  cursor: crosshair;
}

.ol-tooltip {
  position: relative;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 4px;
  color: white;
  padding: 4px 8px;
  opacity: 0.7;
  white-space: nowrap;
  font-size: 12px;
}
.ol-tooltip-measure {
  opacity: 1;
  font-weight: bold;
}
.ol-tooltip-static {
  background-color: #ffcc33;
  color: black;
  border: 1px solid white;
}
.ol-tooltip-measure:before,
.ol-tooltip-static:before {
  border-top: 6px solid rgba(0, 0, 0, 0.5);
  border-right: 6px solid transparent;
  border-left: 6px solid transparent;
  content: "";
  position: absolute;
  bottom: -6px;
  margin-left: -7px;
  left: 50%;
}
.ol-tooltip-static:before {
  border-top-color: #ffcc33;
}
</style>