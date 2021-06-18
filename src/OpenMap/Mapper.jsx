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
import _ from "lodash";

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
}));

const Mapper = () => {
	const classes = useStyles();
	const [From, setFrom] = useState();
	const [lng, setLng] = useState(-87.647374);
	const [lat, setLat] = useState(41.865794);
	const [center, setCenter] = useState([lng, lat]);
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
	const [PathNodes, setPathNodes] = useState();
	// useEffect(() => {
	// 	if (AdjList) {
	// 		setNodesGraph(new Graph(AdjList));
	// 	}
	// }, [AdjList]);

	useEffect(() => {
		if (Nodes) {
			console.log(Object.keys(Nodes).length);
			var building = _.filter(Nodes, (node) => {
				if (node.building) {
					return node;
				}
			});
			setBuildings(building);
			var paths = _.filter(Nodes, (node) => {
				if (node.highway) {
					return node;
				}
			});
			console.log(building, paths);
			console.log(Object.keys(Nodes).length);
		}
		// 		var id1 = getNearestNode(To, PointNodes, Buildings, Nodes);
		// 		var id2 = getNearestNode(From, PointNodes, Buildings, Nodes);
		// 		var coordinates = [];
		// 		var path = NodesGraph.path(id1, id2, { cost: true });
		// 		console.log(path)
		// 		if (!path.path || !path) {
		// 			alert("No Path Found");
		// 		} else {
		// 			for (var i = 0; i < path.path.length; i++) {
		// 				coordinates.push(Nodes[path.path[i]].lngLat);
		// 			}
		// 			console.log(coordinates);
		// 			setCoordinates(coordinates);
		// 		}
		// 	}
	}, [Nodes]);

	useEffect(() => {
		if (Buildings) {
			var building = _.filter(Nodes, (node) => {
				if (node.building) {
					return node;
				}
			});
		}
	}, [Buildings]);

	const handleToClick = (event, index) => {
		console.log(index, event);
		setTo(index);
	};
	const handleFromClick = (event, index) => {
		console.log(index, event);
		setFrom(index);
	};

	const handleLoad = (e) => {
		load(e);
	};

	const getNodesList = async () => {
		const [Nodes, EndPoints, Buildings, AdjList, Center, Paths] = await returnValues();
		console.log(Nodes, EndPoints, Buildings, AdjList, Center, Paths);
		setNodes(Nodes);
		setCenter(Center);
		console.log(AdjList);
		// setBuildings(Buildings);
		setAdjList(AdjList);
		// setPointNodes(EndPoints);

		// setPaths(Paths);
	};

	const handleSliderChange = (event, newValue) => {
		setZoom(newValue);
		console.log(zoom);
	};
	const handleDragEnd = (map, e) => {
		var center = map.getCenter();
		setLat(center.lat);
		setLng(center.lng);
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
		return Object.keys(Buildings).map((key, value) => {
			return (
				<ListItem key={key} button selected={From === key} onClick={(event) => handleFromClick(event, key)}>
					<ListItemText primary={key} />
				</ListItem>
			);
		});
	};

	const renderTo = () => {
		if (!Buildings) {
			return;
		}
		return Object.keys(Buildings).map((key, value) => {
			return (
				<ListItem key={key} button selected={To === key} onClick={(event) => handleToClick(event, key)}>
					<ListItemText primary={key} />
				</ListItem>
			);
		});
	};

	const handleNodeHover = (e, coordinate) => {
		if (coordinate) {
			console.log(coordinate)
			var temp = Array.from(AdjList.get(coordinate).keys());
			var temp2 = temp.map((nodeId) => {
				return Nodes[nodeId].lngLat;
			});
			temp2 = [...temp2, Nodes[coordinate].lngLat];
			setNearestCoordinates(temp2);
			setPopupCoordinates(Nodes[coordinate].lngLat);
		}
	};
	const handleNodeHoverLeave = (e, coordinate) => {
		setPopupCoordinates([0, 0]);
		setNearestCoordinates([0, 0]);
	};

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
				onDragEnd={(map, e) => handleDragEnd(map, e)}>
				<Source id='route' geoJsonSource={list} />

				{/* {Nodes && (
					<Layer
						id='hello'
						type='circle'
						paint={{
							"circle-radius": 7,
							"circle-color": "black",
						}}>
						{Object.keys(Nodes).map((key) => {
							return (
								<Feature
									key={Nodes[key].lngLat}
									onMouseEnter={(e) => handleNodeHover(e, key)}
									onMouseLeave={(e) => handleNodeHoverLeave(e, key)}
									coordinates={Nodes[key].lngLat}
								/>
							);
						})}
					</Layer>
				)} */}

				{Nodes && (
					<Layer
						id='hello'
						type='circle'
						paint={{
							"circle-radius": 7,
							"circle-color": "black",
						}}>
						{Object.keys(Nodes).map((key) => {
							if (Nodes[key].building) {
								return (
									<Feature
										key={Nodes[key].lngLat}
										onMouseEnter={(e) => handleNodeHover(e, key)}
										onMouseLeave={(e) => handleNodeHoverLeave(e, key)}
										coordinates={Nodes[key].lngLat}
									/>
								);
							
							}
							return <Feature coordinates={[0,0]}/>
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
						"circle-color": "red",
						"circle-radius": 10,
					}}>
					{Coordinates.map((coordinate1, index) => (
						<Feature key={"K" + index} coordinates={coordinate1} />
					))}
				</Layer>
				<Popup
					coordinates={popupCoordinates}
					offset={{
						"bottom-left": [12, -38],
						bottom: [0, -38],
						"bottom-right": [-12, -38],
					}}>
					<h1>{"[ " + popupCoordinates[0] + " , " + popupCoordinates[1] + "]"}</h1>
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
					}}></Layer>
			</Map>

			<form>
				<label>
					Name:
					<input onChange={(e) => handleLoad(e)} type='file' name='name' />
				</label>
			</form>
			<Button onClick={() => getNodesList()}>Click Here</Button>

			<Typography id='discrete-slider' gutterBottom>
				Zoom Level
			</Typography>
			<Slider
				value={zoom}
				onChangeCommitted={handleSliderChange}
				aria-labelledby='discrete-slider'
				valueLabelDisplay='auto'
				step={1}
				defaultValue={zoom}
				marks
				min={1}
				max={22}
			/>
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
