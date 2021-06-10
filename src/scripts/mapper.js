const Graph = require("node-dijkstra");
const txml = require("txml");

var parsed
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
			var temp = [];
			for (let [key, value] of this.Buildings) {
				if (key.includes(building)) {
					return value.id;
				}
			}
		};
		this.getBuildingCoordinates = function (building) {
			var temp = [];

			temp.push(this.Nodes.get(building).lon);
			temp.push(this.Nodes.get(building).lat);
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
	

		this.getCenter = function (maxLat, minLat, maxLon, minLon) {
			var midLat = (+maxLat + +minLat) / 2;
			var midLon = (+maxLon + +minLon) / 2;
			this.center = [midLat, midLon];
		};
	}
}

export default function load() {
	
	var xmlDoc;
	var reader = new FileReader();
	var file = this.files[0];
	var Nodes = new NodesList();
	reader.onloadend = function () {
		parsed = txml.parse(this.result);
		getNodes(Nodes);
	};
	reader.readAsText(file);
}

function getNodes(Nodes) {
	var bounds;
	getBounds(parsed[1].children[0], bounds);
	for (var i = 0; i < parsed[1].children.length; i++) {
		var tagName = parsed[1].children[i].tagName;
		if (tagName == "node") {
			addNodeTest(parsed[1].children[i].attributes, Nodes);
		} else if (tagName == "way") {
			for (var j = 0; j < parsed[1].children[i].children.length; j++) {
				var kVal = parsed[1].children[i].children[j].attributes.k;
				var vVal = parsed[1].children[i].children[j].attributes.v;
				if (kVal == "highway" && vVal == "footway") {
					addFootway(parsed[1].children[i], Nodes);
				} else if (kVal == "building" && vVal == "university") {
					addBuilding(parsed[1].children[i], Nodes);
				}
			}
		}
	}
	console.log("NODES: " + Nodes.numNodes());
	console.log("FOOTWAYS: " + Nodes.numFootways());

	console.log(Nodes);

	
}

function addNodeTest(node, Nodes) {
	Nodes.addNode(node.id, node.lat, node.lon);
}

function addFootway(footway, Nodes) {
	for (var i = 0; i < footway.children.length; i++) {
		var child = footway.children[i];
		if (child.tagName == "nd") {
			Nodes.addFootway(footway.attributes.id, child.attributes.ref);
		}
	}
	Nodes.getEdges(footway.attributes.id);
}

function addBuilding(building, Nodes) {
	var totalLong = 0;
	var totalLat = 0;
	var totalNodes = 0;
	var id = building.attributes.id;
	var fullname = "";
	var abbrev = "?";
	for (var i = 0; i < building.children.length; i++) {
		var child = building.children[i];
		if (child.tagName == "nd") {
			var tempNode = Nodes.returnNode(child.attributes.ref);
			totalLat = +tempNode.lat + totalLat;
			totalLong = +tempNode.lon + totalLong;
			totalNodes++;
		} else if (child.tagName == "tag" && child.attributes.k == "name") {
			fullname = child.attributes.v;
		}
	}
	var lat = totalLat / totalNodes;
	var long = totalLong / totalNodes;

	Nodes.addBuilding(fullname, id, lat, long);
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

function getBounds(node, bounds) {
	bounds = new Bounds(node.attributes.maxlat, node.attributes.maxlon, node.attributes.minlat, node.attributes.minlon);
	bounds.getCenter(node.attributes.maxlat, node.attributes.minlat, node.attributes.maxlon, node.attributes.minlon);
}
