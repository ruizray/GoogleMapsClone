import React, { useState} from "react";
import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";

import Link from "@material-ui/core/Link";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import Joi from "joi-browser";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import { NavLink } from "react-router-dom";

function Copyright() {
	return (
		<Typography variant='body2' color='textSecondary' align='center'>
			{"Copyright © "}
			<Link color='inherit' href='https://material-ui.com/'>
				Your Website
			</Link>{" "}
			{new Date().getFullYear()}
			{"."}
		</Typography>
	);
}

const useStyles = makeStyles((theme) => ({
	paper: {
		marginTop: theme.spacing(8),
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
	},
	avatar: {
		margin: theme.spacing(1),
		backgroundColor: theme.palette.secondary.main,
	},
	form: {
		width: "100%", // Fix IE 11 issue.
		marginTop: theme.spacing(1),
	},
	submit: {
		margin: theme.spacing(3, 0, 2),
	},
}));

const Login = props => {
	const schema = {
		email: Joi.string().required().label("Email"),
		password: Joi.string().min(6).required().label("Password"),
	};

	const [data, setData] = useState({});
	const [formErrors, setFormErrors] = useState({});

	const validate = () => {
		const options = { abortEarly: false, allowUnknown: true };
		const { error } = Joi.validate(data, schema, options);
		if (!error) return null;
		const errors = {};
		for (let item of error.details) errors[item.path[0]] = item.message;

		console.log(errors);
		
		return errors;
	};
	const validateProperty = ({ name, value }) => {
		const obj = { [name]: value };
		const tempschema = { [name]: schema[name] };
		const { error } = Joi.validate(obj, tempschema);
		return error ? error.details[0].message : null;
	};

	// const handleSubmit = (e) => {
	// 	e.preventDefault();
	// 	console.log(e);
	// 	const errors = validate();
	// 	console.log(errors);
	// 	console.log(formErrors);
	// 	setFormErrors(errors || {});

	// 	if (errors) return;
	// 	console.log("Here");
	// };

	const handleChange = ({ currentTarget: input }) => {
		const errors = { ...formErrors };
		const errorMessage = validateProperty(input);
		if (errorMessage) {
			errors[input.name] = errorMessage;
		} else {
			delete errors[input.name];
		}

		const tempdata = { ...data };
		tempdata[input.name] = input.value;
		setData(tempdata);
		setFormErrors(errors);
	};

	const classes = useStyles();
	var disabled = validate()
	if(disabled === null){
		disabled = false;
	}else{
		disabled =true
	}
	console.log(disabled)
	return (
		<Container component='main' maxWidth='xs'>
			<CssBaseline />
			<div className={classes.paper}>
				<Avatar className={classes.avatar}></Avatar>
				<Typography component='h1' variant='h5'>
					Sign in
				</Typography>
				<form className={classes.form}>
					<TextField
						variant='outlined'
						margin='normal'
						required
						fullWidth
						onChange={handleChange}
						id='email'
						label='Email Address'
						name='email'
						autoComplete='email'
						error={formErrors["email"]}
						helperText={formErrors["email"]}
						autoFocus
					/>
					<TextField
						variant='outlined'
						margin='normal'
						required
						fullWidth
						onChange={handleChange}
						name='password'
						label='Password'
						type='password'
						id='password'
						autoComplete='current-password'
						error={formErrors["password"]}
						helperText={formErrors["password"]}
					/>

					<Button type='submit' fullWidth variant='contained' color='primary' className={classes.submit} disabled={disabled}>
						Sign In
					</Button>
					<Grid container>
						<Grid item xs>
							<Link href='#' variant='body2'>
								Forgot password?
							</Link>
						</Grid>
						<Grid item>
						
						<NavLink className='nav-link' to='/register'>
								Don't have an account? Sign Up
						</NavLink>
						</Grid>
					</Grid>
				</form>
			</div>
			<Box mt={8}>
				<Copyright />
			</Box>
		</Container>
	);
}
export default Login;