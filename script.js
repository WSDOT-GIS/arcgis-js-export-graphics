/*global require*/
require([
	"esri/map",
	"esri/toolbars/draw",
	"esri/graphic",
	"esri/layers/GraphicsLayer",
	"esri/symbols/SimpleMarkerSymbol",
	"esri/symbols/SimpleLineSymbol",
	"esri/symbols/SimpleFillSymbol"
], function (Map, Draw, Graphic, GraphicsLayer, SimpleMarkerSymbol, SimpleLineSymbol, SimpleFillSymbol) {
	var map;
	var drawSelect = document.getElementById("drawSelect");

	map = new Map("map", {
		basemap: "hybrid",
		center: [-120.80566406246835, 47.41322033015946],
		zoom: 7,
		showAttribution: true
	});

	var graphicsLayer = new GraphicsLayer({
		id: "graphics"
	});
	map.addLayer(graphicsLayer);

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


});