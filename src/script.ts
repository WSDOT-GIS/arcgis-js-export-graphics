import proj4 from "proj4";
import { showDataInDialog, showDialogHandler } from "./dialogUtils";

import { loadModules } from "esri-loader";

loadModules([
  "esri/geometry/webMercatorUtils",
  "esri/graphic",
  "esri/layers/GraphicsLayer",
  "esri/map",
  "esri/symbols/SimpleFillSymbol",
  "esri/symbols/SimpleLineSymbol",
  "esri/symbols/SimpleMarkerSymbol",
  "esri/toolbars/draw"
]).then(
  ([
    webMercatorUtils,
    Graphic,
    GraphicsLayer,
    EsriMap,
    SimpleFillSymbol,
    SimpleLineSymbol,
    SimpleMarkerSymbol,
    Draw
  ]) => {
    const drawSelect = document.getElementById(
      "drawSelect"
    ) as HTMLSelectElement;

    proj4.defs(
      "EPSG:2927",
      "+proj=lcc +lat_1=47.33333333333334 +lat_2=45.83333333333334 +lat_0=45.33333333333334 +lon_0=-120.5 +x_0=500000.0001016001 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=us-ft +no_defs"
    );
    const MAP_PRJ_NAME = "EPSG:3857";

    const map = new EsriMap("map", {
      basemap: "gray-vector",
      center: [-120.80566406246835, 47.41322033015946],
      zoom: 7,
      showAttribution: true
    });

    const graphicsLayer = new GraphicsLayer({
      id: "graphics"
    });
    map.addLayer(graphicsLayer);

    document.getElementById("clearButton")!.addEventListener("click", () => {
      graphicsLayer.clear();
    });

    const pointSymbol = new SimpleMarkerSymbol();
    const lineSymbol = new SimpleLineSymbol();
    const polygonSymbol = new SimpleFillSymbol();

    const draw = new Draw(map);

    draw.on("draw-complete", (e: any) => {
      console.log("draw-complete", e);
      const geoType = e.geometry.type;
      const symbol = /point/i.test(geoType)
        ? pointSymbol
        : /line/i.test(geoType) ? lineSymbol : polygonSymbol;
      const g = new Graphic(e.geometry, symbol, {
        label: ["This is a", e.geometry.type].join(" ")
      });
      console.log("graphic", g);
      graphicsLayer.add(g);
    });

    drawSelect.addEventListener("change", e => {
      const target = e.target as HTMLSelectElement;
      const val = target.value;
      if (val) {
        draw.activate(Draw[val]);
      } else {
        draw.deactivate();
      }
    });

    function projectPoints(pointsOrCoords: any, outPrj?: string) {
      const re = /^(?:(?:points)|(?:rings)|(?:paths))$/;
      if (
        (pointsOrCoords.hasOwnProperty("x") &&
          pointsOrCoords.hasOwnProperty("y")) ||
        (Array.isArray(pointsOrCoords) &&
          pointsOrCoords.length >= 2 &&
          typeof pointsOrCoords[0] === "number")
      ) {
        return proj4(MAP_PRJ_NAME, outPrj, pointsOrCoords);
      } else {
        let match!: RegExpMatchArray | null;
        // tslint:disable-next-line:forin
        for (const propName in pointsOrCoords) {
          match = propName.match(re);
          if (match) {
            break;
          }
        }
        if (match) {
          const output: {
            [key: string]: any;
            points?: number[];
            rings?: number[];
            paths?: number[];
          } = {};
          output[match[0]] = projectPoints(pointsOrCoords[match[0]]);
          return output;
        } else {
          return pointsOrCoords.map((a: number[]) => {
            proj4(MAP_PRJ_NAME, outPrj, a);
          });
        }
      }
    }

    const exportButton = document.getElementById("exportButton")!;
    exportButton.addEventListener("click", () => {
      const csSelect = document.getElementById(
        "csSelect"
      ) as HTMLSelectElement | null;
      if (!csSelect) {
        throw new TypeError("Expected #csSelect to be a valid DOM element");
      }
      const outPrj = csSelect.value;
      if (
        graphicsLayer &&
        graphicsLayer.graphics &&
        graphicsLayer.graphics.length
      ) {
        const sr = { wkid: parseInt(outPrj.match(/EPSG:(\d+)/)![1], 10) }; // graphicsLayer.graphics[0].geometry.spatialReference;
        const jsonFeatures = graphicsLayer.graphics.map((g: any) => {
          const o = g.toJson();
          delete o.symbol;
          delete o.geometry.spatialReference;
          if (outPrj !== MAP_PRJ_NAME) {
            // Project geometry.
            o.geometry = projectPoints(o.geometry, outPrj);
          }
          return o;
        });
        const jsonObjects = { features: jsonFeatures, spatialRefernence: sr };
        const jsonString = JSON.stringify(jsonObjects);

        const url = [
          "data:application/json",
          encodeURIComponent(jsonString)
        ].join(",");
        const a = document.createElement("a");
        a.title = "Right-click this link to open in new tab.";
        a.href = url;
        a.target = "_blank";
        a.textContent = "Exported Graphics";
        a.addEventListener("click", showDialogHandler);

        const li = document.createElement("li");
        li.appendChild(a);
        document.getElementById("exportedGraphics")!.appendChild(li);
      }
    });
  }
);
