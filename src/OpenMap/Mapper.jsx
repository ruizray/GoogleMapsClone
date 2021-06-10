import React, { useRef, useEffect, useState } from "react";
import ReactMapboxGl from "react-mapbox-gl";

import { Button, Slider, Typography } from "@material-ui/core";
import { load, returnNodesList } from "../scripts/mapper";

const Map = ReactMapboxGl({
	accessToken: "pk.eyJ1IjoicnVpenJheSIsImEiOiJja29naXN5ZTEwcmpyMm9ucnBoaW90bzBiIn0._TowTB5Zp7nGWcPPnGMoUQ",
});

const Mapper = () => {
	const mapContainer = useRef(null);
	const map = useRef(null);
	const [lng, setLng] = useState(-70.9);
	const [lat, setLat] = useState(42.35);
	const [zoom, setZoom] = useState(9);
	const [Nodes, setNodes] = useState({});
	const [Buildings, setBuildings] = useState({});
	const [Footways, setFootways] = useState({});
	const [AdjList, setAdjList] = useState({});
	const [PointNodes, setPointNodes] = useState({});

	const getNodesList = () => {
		const Nodes = returnNodesList();
		setBuildings(Nodes.Buildings);
		setFootways(Nodes.Footways);
		setAdjList(Nodes.adjList);
		setPointNodes(Nodes.PointNodes);
		setNodes(Nodes.Nodes);
	};
	const handleSliderChange = (event, newValue) => {
		setZoom(newValue);
		console.log(zoom)
	  };
	  const handleMove = (e) => {
		console.log(e)
		console.log(e.getZoom())
		var center  = e.getCenter();

		console.log(center)

	  }
	const handleZoom = (e) => {
		console.log(e);
	};

	return (
		<div>
			<Map
				style='mapbox://styles/mapbox/streets-v11'
				containerStyle={{
					height: "400px",
					width: "100%",
				}}
				zoom = {[zoom]}
				center={[lng,lat]}
				onMoveEnd={(e) => handleMove(e)}></Map>
			<form>
				<label>
					Name:
					<input onChange={(e) => load(e)} type='file' name='name' />
				</label>
			</form>
			<Button onClick={() => getNodesList()}>Click Here</Button>
			<Typography id='discrete-slider' gutterBottom>
				Zoom Level
			</Typography>
			<Slider value={zoom} onChangeCommitted={handleSliderChange} aria-labelledby='discrete-slider' valueLabelDisplay='auto' step={1} defaultValue={zoom} marks min={1} max={15} />
		</div>
	);
};

export default Mapper;
