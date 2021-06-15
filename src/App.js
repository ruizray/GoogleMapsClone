import Login from "./Authentication/Login";

import { useState } from "react";
import Register from "./Authentication/Register";
import { Route, NavLink, Router, Switch, Redirect } from "react-router-dom";
import Dashboard from './Dashboard/Dashboard';
function App() {
	return (
		<>

		<Dashboard></Dashboard>
			{/* <Route exact path='/'>
				<Redirect to='/dashboard' />
			</Route>
			<Route exact path='/dashboard' component={Dashboard} />
			<Route exact path='/login' component={Login} />
			<Route exact path='/register' component={Register} /> */}
		</>
	);
	// if (register === true) {
	// 	return <Register setRegister={setRegister}></Register>;
	// } else {
	// 	return <Login setRegister={setRegister}></Login>;
	// }
}

export default App;
