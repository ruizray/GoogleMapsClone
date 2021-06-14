const txml = require("txml");
var _ = require("lodash");
var parsed;
var Nodes;
var buildings = {};
var test;
var bounds;
var tempBuildings = {};
var tempNodes = {};
var footwaysCoordinates = [];
var tempFootways = {};
var tempPointNodes = [];
var PathNodes = {};
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

function getBuildings2(ways) {
	console.log(ways);
	_.forEach(ways, (elem) => {
		if (_.find(elem.tag, (child) => child._attributes.k === "building")) {
			_.forEach(elem.tag, (child) => {
				if (child._attributes.k === "name") {
					var totalLong = 0;
					var totalLat = 0;

					var totalNodes = 0;
					var id = elem._attributes.id;

					_.forEach(elem.nd, (nd) => {
						var tempNode = tempNodes[nd._attributes.ref];
						totalLat = +tempNode.lat + totalLat;
						totalLong = +tempNode.lon + totalLong;
						totalNodes++;
					});
					var lat = totalLat / totalNodes;
					var long = totalLong / totalNodes;

					buildings[child._attributes.v] = { id, lat, lon: long };
				}
			});
		}
	});
	console.log(buildings);
}

export function load(e) {
	console.log(e);
	var reader = new FileReader();
	var file = e.target.files[0];
	console.log(file);

	reader.onloadend = function () {
		parsed = txml.parse(this.result);
		test = txml.simplifyLostLess(parsed);
		console.log(test);

		console.log(parsed);
		getNodes(Nodes);
		getBuildings2(test.osm[0].way);
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
				if (kVal === "building") {
					addBuilding(parsed[1].children[i], Nodes);
				} else if (kVal == "highway") {
					addFootway(parsed[1].children[i], Nodes);
				}
			}
		}
	}

	console.log("NODES: " + Object.keys(tempNodes).length);
	console.log("FOOTWAYS: " + Object.keys(tempFootways).length);
	console.log(PathNodes);
}

function addNodeTest(node, Nodes) {
	tempNodes[node.id] = { lat: node.lat, lon: node.lon };
	const tempMap = new Map();
	tempAdjList.set(node.id, tempMap);
}

function checkSameNodes(NodeRef, id) {
	var footwaysToCheck = PathNodes[NodeRef];

	for (var i = 0; i < footwaysToCheck.length; i++) {
		if (footwaysToCheck[i] === id) {
		} else {
			var weight;
			var temp = tempFootways[footwaysToCheck[i]];
			var nearest = Number.MAX_SAFE_INTEGER;
			var pathID = 0;
			for (var j = 0; j < temp.length; j++) {
				var current = temp[j];
				if (current === NodeRef) {
	
				} else {
					weight = distBetween2Points(tempNodes[current].lat, tempNodes[current].lon, tempNodes[NodeRef].lat, tempNodes[NodeRef].lon);
					if (weight < nearest) {
						nearest = weight;
						pathID = current;
					}
				}
			}
			if (weight === 0) {
			} else {
				tempAdjList.get(pathID).set(NodeRef, weight);

				tempAdjList.get(NodeRef).set(pathID, weight);
			}
		}
	}
}

function getEdges(id) {
	var temp = tempFootways[id];
	tempPointNodes.push(temp[0]);
	tempPointNodes.push(temp[temp.length - 1]);

	for (var j = 0; j < temp.length - 1; j++) {
		var current = temp[j];
		var next = temp[+j + 1];
		if (current === next) {
			return;
		} else {
			checkSameNodes(current, id);
			var weight = distBetween2Points(tempNodes[current].lat, tempNodes[current].lon, tempNodes[next].lat, tempNodes[next].lon);

			tempAdjList.get(current).set(next, weight);

			tempAdjList.get(next).set(current, weight);
		}
	}
}

function addFootway(footway) {
	var coordinates = [];
	var length = footway.children.length;
	for (var i = 0; i < length; i++) {
		var child = footway.children[i];
		if (child.tagName === "nd") {
			var id = footway.attributes.id;
			if (!tempFootways[id]) {
				tempFootways[id] = [];
			}
			if (!PathNodes[child.attributes.ref]) {
				PathNodes[child.attributes.ref] = [];
			}
			coordinates.push([tempNodes[child.attributes.ref].lon, tempNodes[child.attributes.ref].lat]);
			tempFootways[id].push(child.attributes.ref);
			PathNodes[child.attributes.ref].push(id);
		}
	}

	const randomColor = Math.floor(Math.random() * 16777215).toString(16);

	var obj = {
		type: "Feature",
		properties: {
			color: "#" + randomColor, // red
		},
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
