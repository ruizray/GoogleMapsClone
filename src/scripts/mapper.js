const txml = require("txml");
var _ = require("lodash");

var parsed;
var Bounds;
var Nodes = {};
var Paths = {};
var EndNodes = [];
var Buildings = [];
var Paths = [];
var AdjList = new Map();

export async function returnValues() {
	console.log(Buildings);
	console.log(Paths);
	return [Nodes, EndNodes, Buildings, AdjList, Bounds, Paths];
}

function getBuildings(ways) {
	_.remove(ways, (way) => {
		if (_.find(way.tag, (child) => child._attributes.k === "building")) {
			var obj = {};
			_.forEach(way.tag, (child) => {
				var temp = {};
				temp[child._attributes.k] = child._attributes.v;
				_.assign(obj, temp);
			});
			if (!obj.name) {
				return way;
			}
			var totalLong = 0;
			var totalLat = 0;
			var totalNodes = 0;
			var id = way._attributes.id;
			_.forEach(way.nd, (nd) => {
				var tempNode = Nodes[nd._attributes.ref];
				totalLat = +tempNode.lngLat[1] + totalLat;
				totalLong = +tempNode.lngLat[0] + totalLong;
				totalNodes++;
			});
			var lat = totalLat / totalNodes;
			var long = totalLong / totalNodes;
			var name = obj.name;

			Nodes[id] = {};

			_.assign(Nodes[id], obj, { lngLat: [long, lat] });
			Buildings.push(Nodes[id]);
			return way;
		}
	});

	// _.remove(ways, (elem) => {
	// 	if (_.find(elem.tag, (child) => child._attributes.k === "building")) {
	// 		_.forEach(elem.tag, (child) => {
	// 			if (child._attributes.k === "name") {
	// 				var totalLong = 0;
	// 				var totalLat = 0;
	// 				var totalNodes = 0;
	// 				var id = elem._attributes.id;
	// 				_.forEach(elem.nd, (nd) => {
	// 					var tempNode = Nodes[nd._attributes.ref];
	// 					totalLat = +tempNode.lngLat[1] + totalLat;
	// 					totalLong = +tempNode.lngLat[0] + totalLong;
	// 					totalNodes++;
	// 					tempNode = { partOf: id, ...tempNode };
	// 				});
	// 				var lat = totalLat / totalNodes;
	// 				var long = totalLong / totalNodes;
	// 				Nodes[id] = { name: child._attributes.v, lngLat: [long, lat] };
	// 				buildings[child._attributes.v] = { id, lngLat: [long, lat] };
	// 			}
	// 		});
	// 		return elem;
	// 	}
	// });
}
function getNodes(nodes) {
	_.forEach(nodes, (node) => {
		var obj = { id: node._attributes.id, lngLat: [+node._attributes.lon, +node._attributes.lat] };
var temp=new Map()
		AdjList.set(node._attributes.id, temp);
		_.forEach(node.tag, (child) => {
			var temp = {};
			temp[child._attributes.k] = child._attributes.v;
			if (child._attributes.k === "name") {
				_.assign(obj, { name: child._attributes.v, building: true });
			}
			_.assign(obj, temp);
		});
		if (obj.name) {
			console.log(obj);
			Buildings.push(obj);
		}
		Nodes[node._attributes.id] = obj;
	});

	// const filter = ["name"];
	// _.forEach(nodes, (node) => {
	// 	var temp = _.find(node.tag, (child) => {
	// 		if (filter.includes(child._attributes.k)) {
	// 			return child;
	// 		}
	// 	});
	// 	if (!temp) {
	// 		temp = "";
	// 	} else {
	// 		console.log(node);
	// 		buildings[temp._attributes.v] = { id: node._attributes.id, lngLat: [node._attributes.lon, node._attributes.lat] };
	// 		temp = temp._attributes.v;
	// 	}
	// 	const tempMap = new Map();
	// 	AdjList.set(node._attributes.id, tempMap);
	// 	Nodes[node._attributes.id] = { name: temp, lngLat: [+node._attributes.lon, +node._attributes.lat] };
	// });
}
function addOneway(path, obj, coordinates) {
	_.forEach(path, (node, index) => {
		var currentRef = node._attributes.ref;
		_.assign(Nodes[currentRef], obj);
		var current = Nodes[currentRef].lngLat;
		coordinates.push({ id: currentRef, lngLat: current });
		if (path[index + 1]) {
			var nextRef = path[index + 1]._attributes.ref;
			var next = Nodes[nextRef].lngLat;
			if (current === next) {
				return;
			} else {
				var weight = distBetween2Points(current[1], current[0], next[1], next[0]);

				AdjList.get(currentRef).set(nextRef, weight);
			}
		}


	});
}
function getPaths(ways) {
	var result = _.forEach(ways, (path) => {
		var obj = {};
		_.forEach(path.tag, (child) => {
			var temp = {};
			temp[child._attributes.k] = child._attributes.v;
			_.assign(obj, temp);
		});
		var coordinates = [];
		if (obj.oneway) {
			addOneway(path.nd, obj, coordinates);
		} else {
			_.forEach(path.nd, (nd, index) => {
				var currentRef = nd._attributes.ref;
				_.assign(Nodes[currentRef], obj);
				var current = Nodes[currentRef].lngLat;
				coordinates.push({ id: currentRef, lngLat: current });
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
			});
		}

		Paths.push({ id: path._attributes.id, attributes: obj, coordinates: [...coordinates] });
		var startID = path.nd[0]._attributes.ref;
		var endID = path.nd[path.nd.length - 1]._attributes.ref;
		EndNodes.push({ id: startID, lngLat: Nodes[startID].lngLat });
		EndNodes.push({ id: endID, lngLat: Nodes[endID].lngLat });
	});

	// _.remove(ways, (path) => {
	// 	if (_.find(path.tag, (child) => child._attributes.k === "highway")) {
	// 		var coordinates = [];
	// 		_.forEach(path.nd, (nd, index) => {
	// 			var currentRef = nd._attributes.ref;
	// 			var current = Nodes[currentRef].lngLat;
	// 			if (path.nd[index + 1]) {
	// 				var nextRef = path.nd[index + 1]._attributes.ref;
	// 				var next = Nodes[nextRef].lngLat;
	// 				if (current === next) {
	// 					return;
	// 				} else {
	// 					var weight = distBetween2Points(current[1], current[0], next[1], next[0]);
	// 					AdjList.get(currentRef).set(nextRef, weight);
	// 					AdjList.get(nextRef).set(currentRef, weight);
	// 				}
	// 			}
	// 			coordinates.push(current);
	// 		});

	// 		const randomColor = Math.floor(Math.random() * 16777215).toString(16);

	// 		var startID = path.nd[0]._attributes.ref;
	// 		var endID = path.nd[path.nd.length - 1]._attributes.ref;
	// 		EndNodes.push({ id: startID, lngLat: Nodes[startID].lngLat });
	// 		EndNodes.push({ id: endID, lngLat: Nodes[endID].lngLat });
	// 		Paths[path._attributes.id] = { coordinates, color: "#" + randomColor };
	// 		return path;
	// 	}
	// });
	// console.log(_.keys(Nodes));

	// var temp = Object.keys(Nodes).map((key, value) => {
	// 	return Nodes[key].lngLat;
	// });
	// console.log(temp);
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
		getNodes(test.osm[0].node);
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
	var center = [midLon, midLat];
	var multiplier = 0.01;
	Bounds = {
		center,
		bounds: [
			[+minLon, +minLat],
			[+maxLon, +maxLat],
		],
	};
	console.log(center);
}

export function getNearestNode(building, tempPointNodes, tempBuildings, tempNodes) {
	var pathID = 0;
	var nearest = Number.MAX_SAFE_INTEGER;
	for (var i = 0; i < tempPointNodes.length; i++) {
		var dist = distBetween2Points(
			building.lngLat[1],
			building.lngLat[0],
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
