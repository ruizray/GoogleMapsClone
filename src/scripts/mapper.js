const txml = require("txml");

var parsed;
var Nodes;
var bounds;
var tempBuildings = {};
var tempNodes = {};
var footwaysCoordinates = [];
var tempFootways = {};
var tempPointNodes = [];
var tempAdjList = new Map();

export async function returnValues() {
	return [tempNodes, tempPointNodes, tempBuildings, tempFootways, tempAdjList, footwaysCoordinates];
}

export function returnBounds() {
	return bounds;
}

class Bounds {
	constructor(maxLat, maxLon, minLat, minLon) {
		this.maxLat = maxLat;
		this.maxLon = maxLon;
		this.minLat = minLat;
		this.minLon = minLon;
		this.center = 0;
		this.getCenter = function (maxLat, minLat, maxLon, minLon) {
			var midLat = (+maxLat + +minLat) / 2;
			var midLon = (+maxLon + +minLon) / 2;
			this.center = [midLon, midLat];
		};
	}
}

export function load(e) {
	console.log(e);
	var reader = new FileReader();
	var file = e.target.files[0];
	console.log(file);

	reader.onloadend = function () {
		parsed = txml.parse(this.result);

		console.log(parsed);
		getNodes(Nodes);
	};
	reader.readAsText(file);
	return [tempNodes, tempPointNodes, tempBuildings, tempFootways, tempAdjList];
}

function getNodes(Nodes) {
	getBounds(parsed[1].children[0]);
	for (var i = 0; i < parsed[1].children.length; i++) {
		var tagName = parsed[1].children[i].tagName;
		if (tagName === "node") {
			addNodeTest(parsed[1].children[i].attributes, Nodes);
		} else if (tagName === "way") {
			for (var j = 0; j < parsed[1].children[i].children.length; j++) {
				var kVal = parsed[1].children[i].children[j].attributes.k;
				var vVal = parsed[1].children[i].children[j].attributes.v;
				 if (kVal === "building" && vVal === "university") {
					addBuilding(parsed[1].children[i], Nodes);
				}
				else  {
					addFootway(parsed[1].children[i], Nodes);
				} 
			}
		}
	}

	console.log("NODES: " + Object.keys(tempNodes).length);
	console.log("FOOTWAYS: " + Object.keys(tempFootways).length);
}

function addNodeTest(node, Nodes) {
	tempNodes[node.id] = { lat: node.lat, lon: node.lon };
	var temp = new Map();
	tempAdjList.set(node.id, temp);
}

function getEdges(id) {
	var temp = tempFootways[id];
	tempPointNodes.push(temp[0]);
	tempPointNodes.push(temp[temp.length - 1]);

	for (var j = 0; j < temp.length - 1; j++) {
		var weight = distBetween2Points(tempNodes[temp[j]].lat, tempNodes[temp[j]].lon, tempNodes[temp[j + 1]].lat, tempNodes[temp[j + 1]].lon);

		tempAdjList.get(temp[j]).set(temp[+j + 1], weight);
		tempAdjList.get(temp[+j + 1]).set(temp[j], weight);
	}
}

function addFootway(footway) {
	var coordinates = [];
	for (var i = 0; i < footway.children.length; i++) {
		var child = footway.children[i];
		if (child.tagName === "nd") {
			if (!tempFootways[footway.attributes.id]) {
				tempFootways[footway.attributes.id] = [];
			}
			coordinates.push([tempNodes[child.attributes.ref].lon, tempNodes[child.attributes.ref].lat]);

			tempFootways[footway.attributes.id].push(child.attributes.ref);
		}
	}

	var obj = {
		type: "Feature",
		geometry: {
			type: "LineString",
			coordinates: [...coordinates],
		},
	};

	footwaysCoordinates.push(obj);
	getEdges(footway.attributes.id);
}

function addBuilding(building) {
	var totalLong = 0;
	var totalLat = 0;

	var totalNodes = 0;
	var id = building.attributes.id;
	var fullname = "";
	var abbrev = "?";
	var length = building.children.length;
	for (var i = 0; i < length; i++) {
		var child = building.children[i];
		if (child.tagName == "nd") {
			var tempNode = tempNodes[child.attributes.ref];
			totalLat = +tempNode.lat + totalLat;
			totalLong = +tempNode.lon + totalLong;

			totalNodes++;
		} else if (child.tagName === "tag" && child.attributes.k === "name") {
			fullname = child.attributes.v;
		}
	}
	var lat = totalLat / totalNodes;
	var long = totalLong / totalNodes;

	tempBuildings[fullname] = { id, lat, lon: long };
}

function distBetween2Points(lat1, long1, lat2, long2) {
	var PI = 3.14159265;
	var earth_rad = 3963.1; // statue miles:
	var lat1_rad = (lat1 * PI) / 180.0;
	var long1_rad = (long1 * PI) / 180.0;
	var lat2_rad = (lat2 * PI) / 180.0;
	var long2_rad = (long2 * PI) / 180.0;
	var dist =
		earth_rad *
		Math.acos(
			Math.cos(lat1_rad) * Math.cos(long1_rad) * Math.cos(lat2_rad) * Math.cos(long2_rad) +
				Math.cos(lat1_rad) * Math.sin(long1_rad) * Math.cos(lat2_rad) * Math.sin(long2_rad) +
				Math.sin(lat1_rad) * Math.sin(lat2_rad)
		);
	return dist;
}

function getBounds(node) {
	bounds = new Bounds(node.attributes.maxlat, node.attributes.maxlon, node.attributes.minlat, node.attributes.minlon);
	bounds.getCenter(node.attributes.maxlat, node.attributes.minlat, node.attributes.maxlon, node.attributes.minlon);
	console.log(bounds);
}

export function getNearestNode(building, tempPointNodes, tempBuildings, tempNodes) {
	var pathID = 0;
	var nearest = Number.MAX_SAFE_INTEGER;
	for (var i = 0; i < tempPointNodes.length; i++) {
		var dist = distBetween2Points(
			tempBuildings[building].lat,
			tempBuildings[building].lon,
			tempNodes[tempPointNodes[i]].lat,
			tempNodes[tempPointNodes[i]].lon
		);

		if (dist < nearest) {
			nearest = dist;
			pathID = tempPointNodes[i];
		}
	}
	console.log(pathID);
	return pathID;
}

export function getBuildingCoordinates(Nodes, building) {
	var temp = [];

	temp.push(+Nodes[building].lon);
	temp.push(+Nodes[building].lat);
	return temp;
}
