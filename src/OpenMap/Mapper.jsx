import React, { useEffect, useState } from "react";
import ReactMapboxGl, { Source, Layer, Feature, Popup } from "react-mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import Graph from "node-dijkstra";
import { Button } from "@material-ui/core";
import { load } from "../scripts/mapper";
import { makeStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import FormLabel from "@material-ui/core/FormLabel";
import FormControl from "@material-ui/core/FormControl";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";

import Checkbox from "@material-ui/core/Checkbox";
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
		// overflow: "scroll",
		// maxHeight: "300px",
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
	const [highwayFilter, setHighwayFilter] = useState({});
	const [loaded, setLoaded] = useState(false);
	const [Miles, setMiles] = useState(0.0);

	useEffect(() => {
		if (AdjList) {
			setNodesGraph(new Graph(AdjList));
		}
	}, [AdjList]);

	useEffect(() => {
		if (Paths) {
			var map = {};
			var temp = _.filter(Paths, (path) => {
				map[path.attributes.highway] = "yes";

				if (highwayFilter[path.attributes.highway]) {
					return path;
				}
			});
			console.log(temp, map);
			setHighwayNodes(temp);
		}
	}, [Paths, highwayFilter]);

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

				setMiles(path.cost);
				setCoordinates(coordinates);
			}
		}
	}, [Buildings, To, PointNodes, From, NodesGraph, Nodes]);

	const handleToClick = (event, index) => {
		console.log(index, event);
		setTo(index);
	};
	const handleFromClick = (event, index) => {
		console.log(index, event);
		setPopupCoordinates([0, 0]);
		setFrom(index);
	};

	const handleLoad = async (e) => {
		load(e);
		setLoaded(true);
	};

	const getNodesList = async () => {
		const [Nodes, EndPoints, Buildings, AdjList, Bounds, Paths] = await returnValues();
		console.log(Nodes, EndPoints, Buildings, AdjList, Bounds, Paths);
		setNodes(Nodes);
		setCenter(Bounds.center);
		setBuildings(Buildings);
		setPaths(Paths);
		var temp = {};
		_.forEach(Paths, (path) => {
			temp[path.attributes.highway] = true;
		});
		setHighwayFilter({ ...temp });
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
	const handleHighwayFilterChange = (event) => {
		setHighwayFilter({ ...highwayFilter, [event.target.name]: event.target.checked });
	};
	const handleNodeHoverLeave = (e, coordinate) => {
		setPopupCoordinates([0, 0]);
		setNearestCoordinates([0, 0]);
	};
	console.log("map redraw");

	return (
		<>
			<div className='row'>
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
					onClick={(map, e) => handleNodeHoverLeave(map, e)}>
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
			</div>
			<div>
				<div className='row'>
					<div className='col-md-12'>
						<form>
							<label>
								Name:
								<input onChange={(e) => handleLoad(e)} type='file' name='name' />
							</label>
						</form>
						{loaded && <Button onClick={() => getNodesList()}>Click Here</Button>}
					</div>
					{To && From && (
						<div className='col-md-12  d-flex justify-content-center'>
							<h1 className='display-6'>
								From: {From.name} To: {To.name} is {Miles.toFixed(4)} Miles
							</h1>
						</div>
					)}

					<div className='col-md-6'>
						<div className={classes.root}>
							<FormControl component='fieldset' className={classes.formControl}>
								<FormLabel component='legend'>Highway Filter</FormLabel>
								<FormGroup>
									{Object.keys(highwayFilter).map((key) => {
										return (
											<FormControlLabel
												control={<Checkbox checked={highwayFilter[key]} onChange={handleHighwayFilterChange} name={key} />}
												label={_.capitalize(key)}
											/>
										);
									})}
								</FormGroup>
							</FormControl>
						</div>
					</div>
					<div className='col-md-6'></div>
				</div>
			</div>
		</>
	);
};

export default Mapper;
