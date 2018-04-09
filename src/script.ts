import pluralize from "pluralize";
import {
  addDialogPolyfillCss,
  makeCloseableTextAreaDialog,
  showDialogHandler
} from "./dialogUtils";

import { loadModules } from "esri-loader";

addDialogPolyfillCss(
  "https://cdn.jsdelivr.net/npm/dialog-polyfill@0.4.9/dialog-polyfill.css",
  "sha256-hT0ET4tfm+7MyjeBepBgV2N5tOmsAVKcTWhH82jvoaA="
);

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

    const dialog = makeCloseableTextAreaDialog("exportDialog");

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
        label: `This is a ${e.geometry.type}`
      });
      console.log("graphic", g);
      graphicsLayer.add(g);
    });

    // When the user selects an option from the select,
    // change the activated tool (or deactivate if no
    // tool is selected).
    drawSelect.addEventListener("change", e => {
      const target = e.target as HTMLSelectElement;
      const val = target.value;
      if (val) {
        draw.activate(Draw[val]);
      } else {
        draw.deactivate();
      }
    });

    function layerHasGraphics(layer: any) {
      return layer && layer.graphics && layer.graphics.length;
    }

    function projectGraphic(graphic: any) {
      const { geometry, attributes } = graphic;
      const projectedGeometry = webMercatorUtils.webMercatorToGeographic(
        geometry
      );
      delete projectedGeometry.spatialReference;
      return {
        geometry: projectedGeometry,
        attributes
      };
    }

    function createAnchor(gLayer: any) {
      const sr = { wkid: 4326 };
      const jsonFeatures = gLayer.graphics.map(projectGraphic);
      const jsonObjects = { features: jsonFeatures, spatialRefernence: sr };

      const jsonString = JSON.stringify(jsonObjects);
      const url = `data:application/json,${encodeURIComponent(jsonString)}`;
      const a = document.createElement("a");
      a.dataset.dialogId = dialog.id;
      a.title = "Right-click this link to open in new tab.";
      a.href = url;
      a.target = "_blank";
      a.textContent = pluralize("feature", jsonFeatures.length, true);
      a.addEventListener("click", showDialogHandler);

      return a;
    }

    const exportButton = document.getElementById("exportButton")!;
    exportButton.addEventListener("click", () => {
      if (layerHasGraphics(graphicsLayer)) {
        const a = createAnchor(graphicsLayer);

        const li = document.createElement("li");
        li.appendChild(a);
        document.getElementById("exportedGraphics")!.appendChild(li);
      }
    });
  }
);
