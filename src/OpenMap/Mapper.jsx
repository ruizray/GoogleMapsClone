import React, { useEffect, useState } from "react";
import ReactMapboxGl, { Source, Layer, Feature, Popup } from "react-mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import Graph from "node-dijkstra";
import { Button, Slider, Typography } from "@material-ui/core";
import { load } from "../scripts/mapper";
import { makeStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import { getNearestNode, returnValues } from "./../scripts/mapper";
import _, { partialRight } from "lodash";

const Map = ReactMapboxGl({
	accessToken: "pk.eyJ1IjoicnVpenJheSIsImEiOiJja29naXN5ZTEwcmpyMm9ucnBoaW90bzBiIn0._TowTB5Zp7nGWcPPnGMoUQ",
});

const useStyles = makeStyles((theme) => ({
	root: {
		width: "100%",
		maxWidth: 360,
		backgroundColor: theme.palette.background.paper,
		overflow: "scroll",
		maxHeight: "300px",
	},
	formControl: {
		margin: theme.spacing(3),
	},
}));

const Mapper = () => {
	const classes = useStyles();
	const [From, setFrom] = useState();
	const [Bounds, setBounds] = useState();
	const [center, setCenter] = useState([-87.647374, 41.865794]);
	const [zoom, setZoom] = useState(15);
	const [Nodes, setNodes] = useState();
	const [Buildings, setBuildings] = useState();
	const [AdjList, setAdjList] = useState();
	const [PointNodes, setPointNodes] = useState();
	const [Coordinates, setCoordinates] = useState([]);
	const [NodesGraph, setNodesGraph] = useState();
	const [To, setTo] = useState("");
	const [popupCoordinates, setPopupCoordinates] = useState([0, 0]);
	const [nearestCoordinates, setNearestCoordinates] = useState([[0, 0]]);
	const [Paths, setPaths] = useState();
	const [highWayNodes, setHighwayNodes] = useState();
	const [popupBody, setPopupBody] = useState();

	useEffect(() => {
		if (AdjList) {
			setNodesGraph(new Graph(AdjList));
		}
	}, [AdjList]);

	useEffect(() => {
		if (Paths) {
			var temp = _.filter(Paths, (path) => {
				if (path.attributes.highway) {
					return path;
				}
			});
			console.log(temp);
			setHighwayNodes(temp);
		}
	}, [Paths]);

	useEffect(() => {
		if (Buildings && To && PointNodes && From && NodesGraph) {
			var id1 = getNearestNode(To, PointNodes, Buildings);
			var id2 = getNearestNode(From, PointNodes, Buildings);
			var coordinates = [];
			var path = NodesGraph.path(id1, id2, { cost: true });

			if (!path.path || !path) {
				alert("No Path Found");
			} else {
				for (var i = 0; i < path.path.length; i++) {
					coordinates.push(Nodes[path.path[i]].lngLat);
				}

				setCoordinates(coordinates);
			}
		}
	}, [Buildings, To, PointNodes, From, NodesGraph]);

	const handleToClick = (event, index) => {
		console.log(index, event);
		setTo(index);
	};
	const handleFromClick = (event, index) => {
		console.log(index, event);
		setPopupCoordinates([0, 0]);
		setFrom(index);
	};

	const handleLoad = (e) => {
		load(e);
	};

	const getNodesList = async () => {
		const [Nodes, EndPoints, Buildings, AdjList, Bounds, Paths] = await returnValues();
		console.log(Nodes, EndPoints, Buildings, AdjList, Bounds, Paths);
		setNodes(Nodes);
		setCenter(Bounds.center);
		setBuildings(Buildings);
		setPaths(Paths);
		setBounds(Bounds.bounds);
		setAdjList(AdjList);
		setPointNodes(EndPoints);
	};

	const handleDragEnd = (map, e) => {
		var center = map.getCenter();
		setCenter(center);
		setZoom([map.getZoom()]);
	};

	const list = {
		type: "geojson",
		data: {
			type: "Feature",
			properties: {},
			geometry: {
				type: "LineString",
				coordinates: [...Coordinates],
			},
		},
	};

	const renderFrom = () => {
		if (!Buildings) {
			return;
		}
		return Buildings.map((building, index) => {
			var buildingName = building.name || building.building;

			return (
				<ListItem key={"buildingFrom" + index} button selected={From === buildingName} onClick={(event) => handleFromClick(event, building)}>
					<ListItemText primary={buildingName} />
				</ListItem>
			);
		});
	};

	const renderTo = () => {
		if (!Buildings) {
			return;
		}
		return Buildings.map((building, index) => {
			var buildingName = building.name || building.building;

			return (
				<ListItem key={"buildingTo" + index} button selected={From === buildingName} onClick={(event) => handleToClick(event, building)}>
					<ListItemText primary={buildingName} />
				</ListItem>
			);
		});
	};

	const handleBuildingHover = (e, building) => {
		if (building) {
			setPopupCoordinates(building.lngLat);
			setPopupBody(
				<List component='nav' aria-label='main mailbox folders'>
					<ListItem style={{ cursor: "pointer" }} onClick={(event) => handleFromClick(event, building)}>
						<ListItemText primary='From' />
					</ListItem>
					<ListItem style={{ cursor: "pointer" }} onClick={(event) => handleToClick(event, building)}>
						<ListItemText primary='To' />
					</ListItem>
				</List>
			);
		}
	};
	const handleBuildingHoverLeave = (e, coordinate) => {
		setNearestCoordinates([0, 0]);
	};
	const handleNodeHover = (e, coordinate) => {
		if (coordinate) {
			console.log(coordinate);
			var temp = Array.from(AdjList.get(coordinate).keys());
			var temp2 = temp.map((nodeId) => {
				return Nodes[nodeId].lngLat;
			});
			temp2 = [...temp2, Nodes[coordinate].lngLat];
			setNearestCoordinates(temp2);
		}
	};
	const handleNodeHoverLeave = (e, coordinate) => {
		setPopupCoordinates([0, 0]);
		setNearestCoordinates([0, 0]);
	};
	console.log("map redraw");
	return (
		<div>
			<Map
				style='mapbox://styles/mapbox/streets-v11'
				containerStyle={{
					height: "600px",
					width: "100%",
				}}
				zoom={[zoom]}
				center={center}
				fitBounds={Bounds}
				onDragEnd={(map, e) => handleDragEnd(map, e)}
				onClick={(map,e) => handleNodeHoverLeave(map,e)}>
				
				<Source id='route' geoJsonSource={list} />
				<Layer
					id='Highways'
					type='line'
					paint={{
						"line-width": 1,
						"line-color": "black",
					}}>
					{highWayNodes &&
						highWayNodes.map((highway, index) => {
							return (
								<Feature
									key={"highway" + index}
									coordinates={highway.coordinates.map((coordinate, index) => {
										return coordinate.lngLat;
									})}
								/>
							);
						})}
				</Layer>
				{Buildings && (
					<Layer
						id='hello'
						type='circle'
						paint={{
							"circle-radius": 7,
							"circle-color": "red",
						}}>
						{Buildings.map((building, index) => {
							return (
								<Feature
									key={"building" + index}
									onMouseEnter={(e) => handleBuildingHover(e, building)}
									onMouseLeave={(e) => handleBuildingHoverLeave(e, building)}
									onClick={(event) => handleFromClick(event, building)}
									coordinates={building.lngLat}
								/>
							);
						})}
					</Layer>
				)}
				{nearestCoordinates && (
					<Layer
						id='hello2'
						type='circle'
						paint={{
							"circle-radius": 10,
							"circle-color": "blue",
						}}>
						{nearestCoordinates.map((key, index) => {
							return <Feature key={index} coordinates={key} />;
						})}
					</Layer>
				)}

				<Layer
					id='route2'
					type='circle'
					paint={{
						"circle-color": "green",
						"circle-radius": 10,
					}}>
					{Coordinates.map((coordinate1, index) => (
						<Feature key={"K" + index} coordinates={coordinate1} />
					))}
				</Layer>

				<Layer
					id='route3'
					type='line'
					sourceId='route'
					layout={{
						"line-cap": "round",
					}}
					paint={{
						"line-width": 3,
						"line-dasharray": [0, 2],
					}}></Layer>
				<Popup
					coordinates={popupCoordinates}
					offset={{
						"bottom-left": [12, -38],
						bottom: [0, -38],
						"bottom-right": [-12, -38],
					}}>
					{popupBody}
				</Popup>
				<Layer
					id='route3'
					type='line'
					sourceId='route'
					layout={{
						"line-cap": "round",
					}}
					paint={{
						"line-width": 3,
						"line-dasharray": [0, 2],
						"line-color": "blue",
					}}></Layer>
			</Map>

			<form>
				<label>
					Name:
					<input onChange={(e) => handleLoad(e)} type='file' name='name' />
				</label>
			</form>
			<Button onClick={() => getNodesList()}>Click Here</Button>

			<div className='row'>
				<div className='col-md-6'>
					<div className={classes.root}>
						<List component='nav' aria-label='main mailbox folders'>
							{renderFrom()}
						</List>
					</div>
				</div>
				<div className='col-md-6'>
					<div className={classes.root}>
						<List component='nav' aria-label='main mailbox folders'>
							{renderTo()}
						</List>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Mapper;
