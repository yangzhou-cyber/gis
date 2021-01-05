import axios from "axios"
import service from "@/config/service"
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
import TileGrid from "ol/tilegrid/TileGrid";
import WMSGetFeatureInfo from "ol/format/WMSGetFeatureInfo";
import GeoJSON from "ol/format/GeoJSON";
import { WFS } from "ol/format"
import { and, equalTo } from 'ol/format/filter';
import { Map, View } from "ol";
export function getService(type, params) {
    let url = service[type];
    if (type == 'tms') {
        return axios.get(url + "?f=pjson").then(res => {
            let data = res.data
            console.log(data)
            let extent = [data.fullExtent.xmin, data.fullExtent.ymin, data.fullExtent.xmax, data.fullExtent.ymax]
            let origin = [data.tileInfo.origin.x, data.tileInfo.origin.y];
            let resolutions = [];
            data.tileInfo.lods.forEach(item => {
                resolutions.push(item.resolution)
            })
            let tileGrid = new TileGrid({
                tileSize: data.tileInfo.rows,
                resolutions,
                origin,
                extent
            })
            let source = new XYZ({
                crossOrigin: "Anonymous",
                tileUrlFunction: function (coordinate) {
                    return (
                        url + '/tile' +
                        coordinate[0] +
                        "/" +
                        coordinate[2] +
                        "/" +
                        coordinate[1]
                    );
                },
                tileGrid: tileGrid,
            });
            let layer = new TileLayer({
                maxZoom: 13,
                source,
            })
            return layer
        })
    } else if (type == 'wfs') {
        // let map = new Map();
        // let layer = new VectorLayer({
        //     format: new GeoJSON(),
        //     loader: function (extent, resolution, projection) {
        // var proj = projection.getCode();
        var featureRequest = new WFS().writeGetFeature({
            srsName: "EPSG:3857",
            featureNS: "http://192.168.1.82:8888//demo",
            featurePrefix: "demo",
            featureTypes: ['watercourses'],

            filter: equalTo('NAME', "胥河")
        })
        axios.post(url,new XMLSerializer().serializeToString(featureRequest),{headers:{"Content-Type": "application/xml"}}).then(res => {
            console.log(res.data)
            let features = new WMSGetFeatureInfo().readFeatures(res.data);
            console.log(features)
        })
    } else if (type == 'wms') {
        return new Promise((resolve, reject) => {
            let source = new ImageArcGISRest({
                ratio: 1,
                url,
            })
            let layer = new ImageLayer({
                opacity: 0.8,
                source: source,
                visible: false,
            });
            resolve(layer)
        })
    }

}