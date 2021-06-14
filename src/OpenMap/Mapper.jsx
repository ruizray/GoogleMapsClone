import React, { useEffect, useState } from "react";
import ReactMapboxGl, { Source, Layer } from "react-mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import Graph from "node-dijkstra";
import { Button, Slider, Typography } from "@material-ui/core";
import { load, returnBounds, getBuildingCoordinates } from "../scripts/mapper";
import { makeStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import { getNearestNode, returnValues } from "./../scripts/mapper";

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
	const [Footways, setFootways] = useState();
	const [AdjList, setAdjList] = useState();
	const [PointNodes, setPointNodes] = useState();
	const [Coordinates, setCoordinates] = useState([]);
	const [footwaysCoordinates, setFootwaysCoordinates] = useState([]);
	const [Enabled, setEnabled] = useState(true);

	const [To, setTo] = useState("");

	useEffect(() => {
		if (Buildings && AdjList && PointNodes && Footways && Nodes && To && From && footwaysCoordinates) {
			console.log("Do something after counter has changed", Buildings, AdjList, PointNodes, Footways, Nodes);
			setEnabled(false);
			var rout22 = new Graph(AdjList);
			console.log(rout22);
			var id1 = getNearestNode(To, PointNodes, Buildings, Nodes);
			var id2 = getNearestNode(From, PointNodes, Buildings, Nodes);
			console.log(AdjList.get(id1), AdjList.get(id2));
			var path = rout22.path(id1, id2, { cost: true });
			var coordinates = [];
			console.log(path);
			if (!path.path  || !path) {
				alert("No Path Found");
			} else {
				for (var i = 0; i < path.path.length; i++) {
					coordinates.push(getBuildingCoordinates(Nodes, path.path[i]));
				}
				console.log(coordinates);
				setCoordinates(coordinates);
			}
		}
	}, [Buildings, AdjList, PointNodes, Footways, Nodes, From, To, footwaysCoordinates]);

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
	const handleClick = () => {};

	const getNodesList = async () => {
		const [tempNodes, tempPointNodes, tempBuildings, tempFootways, tempAdjList, footwaysCoordinates] = await returnValues();
		console.log(tempFootways);
		console.log(footwaysCoordinates);
		setFootwaysCoordinates(footwaysCoordinates);
		setNodes(tempNodes);
		const center = returnBounds().center;
		setBuildings(tempBuildings);
		setAdjList(tempAdjList);
		setPointNodes(tempPointNodes);
		setFootways(tempFootways);
		setCenter(center);
	};

	const handleSliderChange = (event, newValue) => {
		setZoom(newValue);
		console.log(zoom);
	};
	const handleDragEnd = (map, e) => {
		console.log(map, e);
		console.log(map.getZoom());
		var center = map.getCenter();
		setLat(center.lat);
		setLng(center.lng);
		setZoom([map.getZoom()]);
		console.log(center);
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
	const footways = {
		type: "geojson",
		data: {
			type: "FeatureCollection",
			features: [...footwaysCoordinates],
		},

		// 	type: "Feature",
		// 	properties: {},
		// 	geometry: {
		// 		type: "LineString",
		// 		coordinates: [...footwaysCoordinates],
		// 	},
		// },
	};
	console.log(footways);
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
				<Source id='footways' geoJsonSource={footways} />
				<Layer
					id='route4'
					type='line'
					sourceId='footways'
					layout={{
						"line-cap": "round",
					}}
					paint={{
						"line-width": 3,

						"line-color": ["get", "color"],
					}}
				/>
				<Layer
					id='route2'
					type='circle'
					sourceId='route'
					paint={{
						"circle-color": "red",
						"circle-radius": 5,
					}}
				/>
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
					}}
				/>
			</Map>

			<form>
				<label>
					Name:
					<input onChange={(e) => handleLoad(e)} type='file' name='name' />
				</label>
			</form>
			<Button onClick={() => getNodesList()}>Click Here</Button>
			<Button disabled={Enabled} onClick={() => handleClick()}>
				Click Here
			</Button>
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
