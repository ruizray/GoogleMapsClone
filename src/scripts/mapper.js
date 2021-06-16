const txml = require("txml");
var _ = require("lodash");
var parsed;
var center = [];
var Nodes = {};
var Paths = {};
var EndNodes = [];
var buildings = {};
var footwaysCoordinates = [];
var AdjList = new Map();

export async function returnValues() {
	return [Nodes, EndNodes, buildings, AdjList, footwaysCoordinates, center, Paths];
}

function getBuildings(ways) {
	_.remove(ways, (elem) => {
		if (_.find(elem.tag, (child) => child._attributes.k === "building")) {
			_.forEach(elem.tag, (child) => {
				if (child._attributes.k === "name") {
					var totalLong = 0;
					var totalLat = 0;
					var totalNodes = 0;
					var id = elem._attributes.id;

					_.forEach(elem.nd, (nd) => {
						var tempNode = Nodes[nd._attributes.ref];
						totalLat = +tempNode.lat + totalLat;
						totalLong = +tempNode.lon + totalLong;
						totalNodes++;
					});
					var lat = totalLat / totalNodes;
					var long = totalLong / totalNodes;

					buildings[child._attributes.v] = { id, lngLat: [long, lat] };
				}
			});
			return elem;
		}
	});
}
function getNodes2(nodes) {
	_.forEach(nodes, (node) => {
		var temp = _.find(node.tag, (child) => child._attributes.k === "name") || "";
		if (!temp) {
			temp = "";
		} else {
			console.log(node);
			buildings[temp._attributes.v] = { id: node._attributes.id, lngLat: [node._attributes.lon, node._attributes.lat] };

			temp = temp._attributes.v;
		}
		const tempMap = new Map();
		AdjList.set(node._attributes.id, tempMap);
		Nodes[node._attributes.id] = { name: temp, lngLat: [+node._attributes.lon, +node._attributes.lat] };
	});
}

function getPaths(ways) {
	_.remove(ways, (path) => {
		if (_.find(path.tag, (child) => child._attributes.k === "highway" )) {
			var coordinates = [];
			_.forEach(path.nd, (nd, index) => {
				var currentRef = nd._attributes.ref;
				var current = Nodes[currentRef].lngLat;
				if (path.nd[index + 1]) {
					var nextRef = path.nd[index + 1]._attributes.ref;
					var next = Nodes[nextRef].lngLat;
					if (current === next) {
						return;
					} else {
						var weight = distBetween2Points(current[1], current[0], next[1], next[0]);

						AdjList.get(currentRef).set(nextRef, weight);

						AdjList.get(nextRef).set(currentRef, weight);
					}
				}
				coordinates.push(current);
			});

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
			var startID = path.nd[0]._attributes.ref;
			var endID = path.nd[path.nd.length - 1]._attributes.ref;
			EndNodes.push({ id: startID, lngLat: Nodes[startID].lngLat });
			EndNodes.push({ id: endID, lngLat: Nodes[endID].lngLat });
			Paths[path._attributes.id] = { coordinates, color:"#" + randomColor };
			return path;
		}
	});
}

export function load(e) {
	console.log(e);
	var reader = new FileReader();
	var file = e.target.files[0];
	console.log(file);

	reader.onloadend = function () {
		parsed = txml.parse(this.result);
		var test = txml.simplifyLostLess(parsed);
		console.log(test);

		console.log(parsed);
		getBounds(test.osm[0].bounds[0]);
		getNodes2(test.osm[0].node);
		getBuildings(test.osm[0].way);
		getPaths(test.osm[0].way);
	};
	reader.readAsText(file);
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

function getBounds(bounds) {
	console.log(bounds);
	var maxLat = bounds._attributes.maxlat;
	var maxLon = bounds._attributes.maxlon;
	var minLat = bounds._attributes.minlat;
	var minLon = bounds._attributes.minlon;

	var midLat = (+maxLat + +minLat) / 2;
	var midLon = (+maxLon + +minLon) / 2;
	center = [midLon, midLat];

	console.log(center);
}

export function getNearestNode(building, tempPointNodes, tempBuildings, tempNodes) {
	var pathID = 0;
	var nearest = Number.MAX_SAFE_INTEGER;
	for (var i = 0; i < tempPointNodes.length; i++) {
		var dist = distBetween2Points(
			tempBuildings[building].lngLat[1],
			tempBuildings[building].lngLat[0],
			tempPointNodes[i].lngLat[1],
			tempPointNodes[i].lngLat[0]
		);
		if (dist < nearest) {
			nearest = dist;
			pathID = tempPointNodes[i].id;
		}
	}
	return pathID;
}
