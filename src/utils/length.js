import 'ol/ol.css';
import Draw from 'ol/interaction/Draw';
import Map from 'ol/Map';
import Overlay from 'ol/Overlay';
import View from 'ol/View';
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style';
import { LineString, Polygon } from 'ol/geom';
import { OSM, Vector as VectorSource } from 'ol/source';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import { getArea, getLength } from 'ol/sphere';
import { unByKey } from 'ol/Observable';
import { DoubleClickZoom } from "ol/interaction"

export default function length(context,map, type) {
    const dblClickInteraction = map
        .getInteractions()
        .getArray()
        .find(interaction => {
            return interaction instanceof DoubleClickZoom;
        });
    map.removeInteraction(dblClickInteraction);
    let overlays=[];
    var source = new VectorSource();

    var vector = new VectorLayer({
        source: source,
        style: new Style({
            fill: new Fill({
                color: 'rgba(255, 255, 255, 0.2)',
            }),
            stroke: new Stroke({
                color: '#ffcc33',
                width: 2,
            }),
            image: new CircleStyle({
                radius: 7,
                fill: new Fill({
                    color: '#ffcc33',
                }),
            }),
        }),
    });

    map.addLayer(vector)
    /**
     * Currently drawn feature.
     * @type {import("../src/ol/Feature.js").default}
     */
    var sketch;

    /**
     * The help tooltip element.
     * @type {HTMLElement}
     */
    var helpTooltipElement;

    /**
     * Overlay to show the help messages.
     * @type {Overlay}
     */
    var helpTooltip;

    /**
     * The measure tooltip element.
     * @type {HTMLElement}
     */
    var measureTooltipElement;

    /**
     * Overlay to show the measurement.
     * @type {Overlay}
     */
    var measureTooltip;

    var cancel,cancelElement


    var pointerMoveHandler = function (evt) {
        if (evt.dragging) {
            return;
        }
        helpTooltip.setPosition(evt.coordinate);
        helpTooltipElement.classList.remove('hidden');
    };



    var draw; // global so we can remove it later

    /**
     * Format length output.
     * @param {LineString} line The line.
     * @return {string} The formatted length.
     */
    var formatLength = function (line) {
        var length = getLength(line);
        var output;
        if (length > 100) {
            output = Math.round((length / 1000) * 100) / 100 + ' ' + 'km';
        } else {
            output = Math.round(length * 100) / 100 + ' ' + 'm';
        }
        return output;
    };

    /**
     * Format area output.
     * @param {Polygon} polygon The polygon.
     * @return {string} Formatted area.
     */
    var formatArea = function (polygon) {
        var area = getArea(polygon);
        var output;
        if (area > 10000) {
            output = Math.round((area / 1000000) * 100) / 100 + ' ' + 'km<sup>2</sup>';
        } else {
            output = Math.round(area * 100) / 100 + ' ' + 'm<sup>2</sup>';
        }
        return output;
    };
    let add=false;
    function addInteraction() {
        this.$refs.map.classList.add('cursor')
        if(add){
            return
        }
        add=true
        let movein=map.on('pointermove', pointerMoveHandler);
        let moveout=map.getViewport().addEventListener('mouseout', function () {
            helpTooltipElement.classList.add('hidden');
        });
        draw = new Draw({
            source: source,
            type,
            style: new Style({
                fill: new Fill({
                    color: 'rgba(255, 255, 255, 0.2)',
                }),
                stroke: new Stroke({
                    color: 'rgba(0, 0, 0, 0.5)',
                    lineDash: [10, 10],
                    width: 2,
                }),
            }),
        });
        map.addInteraction(draw);

        createMeasureTooltip();
        createHelpTooltip();

        var listener;
        let showLength = false;
        let clickListener;
        draw.on('drawstart', function (evt) {
            showLength = false;
            clickListener = map.on('singleclick', function (e) {
                if (showLength) {
                    if (geom instanceof LineString) {
                        console.log(formatLength(geom))
                        createTooltip(formatLength(geom), e.coordinate)
                    }
                }
            })
            sketch = evt.feature;
            let geom = sketch.getGeometry();
            var tooltipCoord = evt.coordinate;
            listener = sketch.getGeometry().on('change', function (evt) {
                var output;
                if (geom instanceof Polygon) {
                    output = formatArea(geom);
                    tooltipCoord = geom.getInteriorPoint().getCoordinates();
                } else if (geom instanceof LineString) {
                    output = formatLength(geom);
                    if (geom.getCoordinates().length > 2) {
                        showLength = true
                    }
                    tooltipCoord = geom.getLastCoordinate();
                }
                measureTooltipElement.innerHTML = output;
                measureTooltip.setPosition(tooltipCoord);
            });
        });
        draw.on('drawend',  (e)=> {
            unByKey('dbclick')
            measureTooltip.setOffset([0, -7]);
            // unset sketch
            sketch = null;
            // unset tooltip so that a new one can be created
            measureTooltipElement = null;
            createMeasureTooltip()
            unByKey([listener,clickListener,movein,moveout]);
            console.log(e.feature.getGeometry())
            let geom = e.feature.getGeometry();
            let center;
            if(geom instanceof LineString){
                center=e.feature.getGeometry().getLastCoordinate();
            }else if(geom instanceof Polygon){
                center=e.feature.getGeometry().getInteriorPoint().getCoordinates();
            }
            createdCancel(center)
            map.removeOverlay(helpTooltip)
            map.removeOverlay(measureTooltip)
            map.removeInteraction(draw)
            add=false
        this.$refs.map.classList.remove('cursor')
        });
    }
    addInteraction=addInteraction.bind(context)

    /**
     * Creates a new help tooltip
     */
    function createHelpTooltip() {
        if (helpTooltipElement) {
            helpTooltipElement.parentNode.removeChild(helpTooltipElement);
        }
        helpTooltipElement = document.createElement('div');
        helpTooltipElement.className = 'ol-tooltip hidden';
        helpTooltipElement.innerHTML = '双击结束';
        helpTooltip = new Overlay({
            element: helpTooltipElement,
            offset: [15, 0],
            positioning: 'center-left',
        });
        map.addOverlay(helpTooltip);
        overlays.push(helpTooltip)
    }

    /**
     * Creates a new measure tooltip
     */
    function createMeasureTooltip() {
        if (measureTooltipElement) {
            measureTooltipElement.parentNode.removeChild(measureTooltipElement);
        }
        measureTooltipElement = document.createElement('div');
        measureTooltipElement.className = 'ol-tooltip ol-tooltip-measure';
        measureTooltipElement.innerHTML = "双击结束"
        measureTooltip = new Overlay({
            element: measureTooltipElement,
            offset: [0, -15],
            positioning: 'bottom-center',
        });
        map.addOverlay(measureTooltip);
        overlays.push(measureTooltip)
    }
    function createTooltip(output, coordinate) {
        let element = document.createElement('div')
        element.className = "ol-tooltip ol-tooltip-measure"
        element.innerHTML = output
        let overlay = new Overlay({
            element,
            offset: [-30, -30],
            position: "bottom-center"
        })
        overlay.setPosition(coordinate)
        map.addOverlay(overlay)
        overlays.push(overlay)
        return overlay
    }
    function createdCancel(coordinate){
        if(!cancelElement){
            cancelElement = document.createElement('div');
            cancelElement.className = 'ol-tooltip';
            cancelElement.style.cursor="pointer"
            cancelElement.addEventListener('click',()=>{
                overlays.forEach(item=>{
                    map.removeOverlay(item)
                })
                vector.getSource().clear()
            })
            cancelElement.innerHTML="<span class='el-icon-delete-solid' style='color:red;font-size:18px;'></span>"
        }
        let overlay=new Overlay({
            element:cancelElement,
            position:"top-center",
            offset:[-20,30]
        })
        overlay.setPosition(coordinate)
        map.addOverlay(overlay)
        overlays.push(overlay)
    }
    // createHelpTooltip()
    return addInteraction
}