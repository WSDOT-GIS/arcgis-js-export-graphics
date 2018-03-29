require([
    "esri/map",
    "esri/toolbars/draw",
    "esri/graphic",
    "esri/layers/GraphicsLayer",
    "esri/symbols/SimpleMarkerSymbol",
    "esri/symbols/SimpleLineSymbol",
    "esri/symbols/SimpleFillSymbol",
    "esri/geometry/webMercatorUtils",
    "proj4"
], function (Map, Draw, Graphic, GraphicsLayer, SimpleMarkerSymbol, SimpleLineSymbol, SimpleFillSymbol, webMercatorUtils, proj4) {
    var map;
    var drawSelect = document.getElementById("drawSelect");

    proj4.defs("EPSG:2927", "+proj=lcc +lat_1=47.33333333333334 +lat_2=45.83333333333334 +lat_0=45.33333333333334 +lon_0=-120.5 +x_0=500000.0001016001 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=us-ft +no_defs");
    MAP_PRJ_NAME = "EPSG:3857";

    map = new Map("map", {
        basemap: "gray-vector",
        center: [-120.80566406246835, 47.41322033015946],
        zoom: 7,
        showAttribution: true
    });

    var graphicsLayer = new GraphicsLayer({
        id: "graphics"
    });
    map.addLayer(graphicsLayer);

    document.getElementById("clearButton").addEventListener("click", function () {
        graphicsLayer.clear();
    });

    var pointSymbol = new SimpleMarkerSymbol();
    var lineSymbol = new SimpleLineSymbol();
    var polygonSymbol = new SimpleFillSymbol();

    var draw = new Draw(map);

    draw.on("draw-complete", function (e) {
        console.log("draw-complete", e);
        var geoType = e.geometry.type;
        var symbol = /point/i.test(geoType) ? pointSymbol : /line/i.test(geoType) ? lineSymbol : polygonSymbol;
        var g = new Graphic(e.geometry,
            symbol, {
                label: ["This is a", e.geometry.type].join(" ")
            });
        console.log("graphic", g);
        graphicsLayer.add(g);
    });

    drawSelect.addEventListener("change", function (e) {
        var target = e.target;
        var val = target.value;
        if (val) {
            draw.activate(Draw[val]);
        } else {
            draw.deactivate();
        }
    });

    function projectPoints(pointsOrCoords, outPrj) {
        var re = /^(?:(?:points)|(?:rings)|(?:paths))$/, match, output;
        if (pointsOrCoords.hasOwnProperty("x") && pointsOrCoords.hasOwnProperty("y") || Array.isArray(pointsOrCoords) && pointsOrCoords.length >= 2 && typeof pointsOrCoords[0] === "number") {
            return proj4(MAP_PRJ_NAME, outPrj, pointsOrCoords);
        } else {
            for (var propName in pointsOrCoords) {
                match = propName.match(re);
                if (match) {
                    break;
                }
            }
            if (match) {
                output = {};
                output[match[0]] = projectPoints(pointsOrCoords[match[0]]);
                return output;
            } else {
                return pointsOrCoords.map(function (a) {
                    proj4(MAP_PRJ_NAME, outPrj, a);
                });
            }
        }
    }

    var exportButton = document.getElementById("exportButton");
    exportButton.addEventListener("click", function () {
        var jsonObjects, jsonString, url, a, li, sr;
        var outPrj = document.getElementById("csSelect").value;
        if (graphicsLayer && graphicsLayer.graphics && graphicsLayer.graphics.length) {
            sr = { wkid: parseInt(outPrj.match(/EPSG:(\d+)/)[1]) }; //graphicsLayer.graphics[0].geometry.spatialReference;
            jsonObjects = graphicsLayer.graphics.map(function (g) {
                var o = g.toJson();
                delete o.symbol;
                delete o.geometry.spatialReference;
                if (outPrj !== MAP_PRJ_NAME) {
                    // Project geometry.
                    o.geometry = projectPoints(o.geometry, outPrj);
                }
                return o;
            });
            jsonObjects = { features: jsonObjects, spatialRefernence: sr };
            jsonString = JSON.stringify(jsonObjects);

            url = ["data:application/json", encodeURIComponent(jsonString)].join(",");
            a = document.createElement("a");
            a.href = url;
            a.target = "_blank";
            a.textContent = "Exported Graphics";

            li = document.createElement("li");
            li.appendChild(a);
            document.getElementById("exportedGraphics").appendChild(li);
        }
    });

});