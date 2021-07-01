import React, { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Slider from "@material-ui/core/Slider";
import { PerspectiveCamera } from "three";


function ThreeTest() {


	return (
		<>
		<scene></scene>
		<Canvas>
			<PerspectiveCamera/>
		</Canvas>
		
			
		</>
	);
}

export default ThreeTest;















// const useStyles = makeStyles({
// 	root: {
// 		width: 300,
// 	},
// });

// function Box(props) {
// 	// This reference will give us direct access to the THREE.Mesh object
// 	const mesh = useRef();
// 	// Set up state for the hovered and active state
// 	const [hovered, setHover] = useState(false);
// 	const [active, setActive] = useState(false);
// 	// Subscribe this component to the render-loop, rotate the mesh every frame
// 	useFrame((state, delta) => (mesh.current.rotation.x += 0.01));
// 	// Return the view, these are regular Threejs elements expressed in JSX
// 	return (
// 		<mesh
// 			{...props}
// 			ref={mesh}
// 			scale={active ? 1.5 : 1}
// 			onClick={(event) => setActive(!active)}
// 			onPointerOver={(event) => setHover(true)}
// 			onPointerOut={(event) => setHover(false)}>
// 			<boxGeometry args={[1, 1, 1]} />
// 			<meshStandardMaterial color={hovered ? "hotpink" : "orange"} />
// 		</mesh>
// 	);
// }
// function Torus(props) {
// 	// This reference will give us direct access to the THREE.Mesh object
// 	const mesh = useRef();
// 	// Set up state for the hovered and active state
// 	const [hovered, setHover] = useState(false);
// 	const [active, setActive] = useState(false);
// 	// Subscribe this component to the render-loop, rotate the mesh every frame
// 	useFrame((state, delta) => (mesh.current.rotation.x += 0.01));
// 	useFrame((state, delta) => (mesh.current.rotation.y += 0.01));
// 	// Return the view, these are regular Threejs elements expressed in JSX
// 	return (
// 		<>
// 			<mesh
// 				position={props.position}
// 				ref={mesh}
// 				scale={active ? 1.5 : 1}
// 				onClick={(event) => setActive(!active)}
// 				onPointerOver={(event) => setHover(true)}
// 				onPointerOut={(event) => setHover(false)}>
// 				{props.shape}
// 				<meshStandardMaterial wireframe={true} color={hovered ? "hotpink" : "orange"} />
// 			</mesh>
// 		</>
// 	);
// }
// function ThreeTest() {
// 	const classes = useStyles();
// 	const [ShapeArgs, setShapeArgs] = useState({ radius: 5, tube: 3, radialSegments: 16 });
// 	const [coordinates, setCoordinates] = useState({ xAxis: 0, yAxis: 0, zAxis: -10 });

// 	const handleArgsChange = (e, slider, next) => {
// 		console.log(e, slider, next);
// 		const temp = { ...ShapeArgs };
// 		temp[e] = next;
// 		setShapeArgs(temp);
// 	};

// 	const handleCoordinatesChange = (e, slider, next) => {
// 		console.log(e, slider, next);
// 		const temp = { ...coordinates };
// 		temp[e] = next;
// 		setCoordinates(temp);
// 	};

// 	function valuetext(value) {
// 		return `${value}°C`;
// 	}

// 	return (
// 		<>
		
// 			<div style={{ maxHeight: "1000px", height: 600 }}>
// 				<Canvas>
// 					<ambientLight />
// 					<pointLight position={[5, 10, 10]} />

// 					<Torus
// 						shape={<torusGeometry args={[ShapeArgs.radius, ShapeArgs.tube, ShapeArgs.radialSegments, 50]} />}
// 						position={[coordinates.xAxis, coordinates.yAxis, coordinates.zAxis]}></Torus>
// 				</Canvas>
// 			</div>
// 			<div className='container-fluid'>
// 				<div className='row'>
// 					<div className='col-md-3'>
// 						<div className={classes.root}>
// 							<Typography id='discrete-slider' gutterBottom>
// 								Radius
// 							</Typography>
// 							<Slider
// 								defaultValue={5}
// 								getAriaValueText={valuetext}
// 								aria-labelledby='discrete-slider'
// 								valueLabelDisplay='auto'
// 								step={1}
// 								marks
// 								min={0}
// 								onChangeCommitted={(slider, next) => handleArgsChange("radius", slider, next)}
// 								max={10}
// 							/>
// 							<Typography id='discrete-slider' gutterBottom>
// 								Tube
// 							</Typography>
// 							<Slider
// 								defaultValue={1}
// 								getAriaValueText={valuetext}
// 								aria-labelledby='discrete-slider'
// 								valueLabelDisplay='auto'
// 								step={0.05}
// 								marks
// 								min={1}
// 								onChangeCommitted={(slider, next) => handleArgsChange("tube", slider, next)}
// 								max={10}
// 							/>
// 							<Typography id='discrete-slider' gutterBottom>
// 								Radial Segments
// 							</Typography>
// 							<Slider
// 								defaultValue={30}
// 								getAriaValueText={valuetext}
// 								aria-labelledby='discrete-slider'
// 								valueLabelDisplay='auto'
// 								step={1}
// 								marks
// 								min={2}
// 								onChangeCommitted={(slider, next) => handleArgsChange("radialSegments", slider, next)}
// 								max={30}
// 							/>
// 						</div>
// 					</div>
// 					<div className='col-md-3'>
// 						<div className={classes.root}>
// 							<Typography id='discrete-slider' gutterBottom>
// 								X-Axis
// 							</Typography>
// 							<Slider
// 								defaultValue={5}
// 								getAriaValueText={valuetext}
// 								aria-labelledby='discrete-slider'
// 								valueLabelDisplay='auto'
// 								step={1}
// 								marks
// 								min={-10}
// 								onChangeCommitted={(slider, next) => handleCoordinatesChange("xAxis", slider, next)}
// 								max={10}
// 							/>
// 							<Typography id='discrete-slider' gutterBottom>
// 								Y-Axis
// 							</Typography>
// 							<Slider
// 								defaultValue={1}
// 								getAriaValueText={valuetext}
// 								aria-labelledby='discrete-slider'
// 								valueLabelDisplay='auto'
// 								step={0.05}
// 								marks
// 								min={-10}
// 								onChangeCommitted={(slider, next) => handleCoordinatesChange("yAxis", slider, next)}
// 								max={10}
// 							/>
// 							<Typography id='discrete-slider' gutterBottom>
// 								Z-Axis
// 							</Typography>
// 							<Slider
// 								defaultValue={30}
// 								getAriaValueText={valuetext}
// 								aria-labelledby='discrete-slider'
// 								valueLabelDisplay='auto'
// 								step={1}
// 								marks
// 								min={-30}
// 								onChangeCommitted={(slider, next) => handleCoordinatesChange("zAxis", slider, next)}
// 								max={30}
// 							/>
// 						</div>
// 					</div>
// 				</div>
// 			</div>
// 		</>
// 	);
// }

// export default ThreeTest;
