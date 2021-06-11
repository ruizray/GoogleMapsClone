const Graph = require("node-dijkstra");
const txml = require("txml");

var parsed;
var Nodes;
var bounds;
var tempBuildings = {};
var tempNodes = {};
var tempFootways = {};
var tempPointNodes = [];
var tempAdjList = new Map();

export async function returnValues() {
	return [tempNodes, tempPointNodes, tempBuildings, tempFootways, tempAdjList];
}
export function returnNodesList() {
	return Nodes;
}

export function returnBounds() {
	return bounds;
}

export function getBuildings() {
	return tempBuildings;
}

export function getPointNodes() {
	return tempPointNodes;
}

export function getAdjList() {
	return Nodes;
}

export function getFootways() {
	return tempFootways;
}

export function getNodesList2() {
	return tempNodes;
}
class NodesList {
	constructor() {
		this.Nodes = new Map();
		this.Footways = new Map();
		this.Buildings = new Map();
		this.adjList = new Map();
		this.pointNodes = [];

		this.addNode = function (id, lat, lon) {
			this.Nodes.set(id, { lat: lat, lon: lon });
			var temp = new Map();
			this.adjList.set(id, temp);
		};
		this.addFootway = function (id, id2) {
			if (this.Footways.get(id) == undefined) {
				this.Footways.set(id, []);
			}
			this.Footways.get(id).push(id2);
		};
		this.addBuilding = function (fullname, id, lat, lon) {
			this.Buildings.set(fullname, { id: id, lat: lat, lon: lon });
		};

		this.getEdges = function (id) {
			var temp = this.Footways.get(id);
			this.pointNodes.push(temp[0]);
			this.pointNodes.push(temp[temp.length - 1]);
			for (var j = 0; j < temp.length - 1; j++) {
				var weight = this.distBetween2Points(
					this.Nodes.get(temp[j]).lat,
					this.Nodes.get(temp[j]).lon,
					this.Nodes.get(temp[j + 1]).lat,
					this.Nodes.get(temp[j + 1]).lon
				);
				this.adjList.get(temp[j]).set(temp[+j + 1], weight);
				this.adjList.get(temp[+j + 1]).set(temp[j], weight);
			}
		};
		this.numNodes = function () {
			return this.Nodes.size;
		};
		this.numFootways = function () {
			return this.Footways.size;
		};
		this.distBetween2Points = function (lat1, long1, lat2, long2) {
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
		};
		this.getNearestNode = function (building) {
			var buildingName;
			for (let [key, value] of this.Buildings) {
				if (key.includes(building)) {
					buildingName = value;
				}
			}

			var pathID = 0;
			var nearest = Number.MAX_SAFE_INTEGER;
			for (var i = 0; i < this.pointNodes.length; i++) {
				var dist = distBetween2Points(
					buildingName.lat,
					buildingName.lon,
					this.Nodes.get(this.pointNodes[i]).lat,
					this.Nodes.get(this.pointNodes[i]).lon
				);

				if (dist < nearest) {
					nearest = dist;
					pathID = this.pointNodes[i];
				}
			}
			return pathID;
		};

		this.returnNode = function (node) {
			return this.Nodes.get(node);
		};
		this.getBuildingID = function (building) {
			for (let [key, value] of this.Buildings) {
				if (key.includes(building)) {
					return value.id;
				}
			}
		};
		this.getBuildingCoordinates = function (building) {
			var temp = [];

			temp.push(+this.Nodes.get(building).lon);
			temp.push(+this.Nodes.get(building).lat);
			return temp;
		};
	}
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
	Nodes = new NodesList();
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
				if (vVal === "footway") {
					addFootway(parsed[1].children[i], Nodes);
				} else if (kVal == "building" && vVal == "university") {
					addBuilding(parsed[1].children[i], Nodes);
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
	Nodes.addNode(node.id, node.lat, node.lon);
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

function addFootway(footway, Nodes) {
	for (var i = 0; i < footway.children.length; i++) {
		var child = footway.children[i];
		if (child.tagName === "nd") {
			if (!tempFootways[footway.attributes.id]) {
				tempFootways[footway.attributes.id] = [];
			}
			tempFootways[footway.attributes.id].push(child.attributes.ref);

			Nodes.addFootway(footway.attributes.id, child.attributes.ref);
		}
	}

	getEdges(footway.attributes.id);
	Nodes.getEdges(footway.attributes.id);
}

function addBuilding(building, Nodes) {
	var totalLong = 0;
	var totalLat = 0;
	var totalLong2 = 0;
	var totalLat2 = 0;
	var totalNodes = 0;
	var id = building.attributes.id;
	var fullname = "";
	var abbrev = "?";
	var length = building.children.length;
	for (var i = 0; i < length; i++) {
		var child = building.children[i];
		if (child.tagName == "nd") {
			var tempNode = Nodes.returnNode(child.attributes.ref);
			totalLat = +tempNode.lat + totalLat;
			totalLong = +tempNode.lon + totalLong;

			var tempNode2 = tempNodes[child.attributes.ref];

			totalLat2 = +tempNode2.lat + totalLat2;
			totalLong2 = +tempNode2.lon + totalLong2;

			totalNodes++;
		} else if (child.tagName === "tag" && child.attributes.k === "name") {
			fullname = child.attributes.v;
		}
	}
	var lat = totalLat / totalNodes;
	var long = totalLong / totalNodes;

	Nodes.addBuilding(fullname, id, lat, long);
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

export function getBuildingCoordinates(Nodes, building){
	var temp = [];

	temp.push(+Nodes[building].lon);
	temp.push(+Nodes[building].lat);
	return temp;
}