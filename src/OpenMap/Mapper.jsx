import React, { useRef, useEffect, useState } from "react";
import ReactMapboxGl, { Source, GeoJSONLayer, Layer } from "react-mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import Graph from "node-dijkstra";
import { Button, Slider, Typography } from "@material-ui/core";
import { load, returnBounds, getBuildingCoordinates } from "../scripts/mapper";
import { makeStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import Divider from "@material-ui/core/Divider";
import InboxIcon from "@material-ui/icons/Inbox";
import DraftsIcon from "@material-ui/icons/Drafts";
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
	const [Enabled, setEnabled] = useState(true);

	const [To, setTo] = useState("");

	useEffect(() => {
		if (Buildings && AdjList && PointNodes && Footways && Nodes) {
			console.log("Do something after counter has changed", Buildings, AdjList, PointNodes, Footways, Nodes);
			setEnabled(false);
		}
	}, [Buildings, AdjList, PointNodes, Footways, Nodes, From]);

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
	const handleClick = () => {
		console.log(AdjList);
		var rout22 = new Graph(AdjList);
		console.log(rout22);
		var id1 = getNearestNode("Thomas Beckham Hall (TBH)", PointNodes, Buildings, Nodes);
		var id2 = getNearestNode("Science Engineering South (SES)", PointNodes, Buildings, Nodes);
		var path = rout22.path(id1, id2, { cost: true });
		console.log(AdjList.get(id1));
		console.log(path, rout22, id1, id2);
		var coordinates = [];

		for (var i = 0; i < path.path.length; i++) {
			coordinates.push(getBuildingCoordinates(Nodes, path.path[i]));
		}
		console.log(coordinates);
		setCoordinates(coordinates);
	};

	const getNodesList = async () => {
		const [tempNodes, tempPointNodes, tempBuildings, tempFootways, tempAdjList] = await returnValues();
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

	const renderFrom = () => {
		console.log(Buildings);
		var count = -1;
		if (!Buildings) {
			return;
		}
		return Object.keys(Buildings).map((key, value) => {
			count++;
			console.log(count);
			return (
				<ListItem key={key} button selected={From === key} onClick={(event) => handleFromClick(event, key)}>
					<ListItemText primary={key} />
				</ListItem>
			);
		});
	};

	const renderTo = () => {
		console.log(Buildings);
		var count = -1;
		if (!Buildings) {
			return;
		}
		return Object.keys(Buildings).map((key, value) => {
			count++;
			console.log(count);
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
					height: "400px",
					width: "100%",
				}}
				zoom={[zoom]}
				center={center}
				onDragEnd={(map, e) => handleDragEnd(map, e)}>
				<Source id='route' geoJsonSource={list} />
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
			<div class='row'>
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
