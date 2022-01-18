import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { withRouter, Route, Switch, Redirect } from 'react-router-dom';
import { Login, Signup } from './components/AuthForm';
import Home from './components/Home';
import { me } from './store';
import Link from './components/Link';
import TransactionsContainer from './components/TransactionsContainer';
import axios from 'axios';

import PropTypes from 'prop-types';
import auth from '../../SeniorPhase/Graceshopper/client/store/auth';
import Landing from './components/Landing';
import store from './store';
import jwt_decode from 'jwt-decode';
import { setCurrentUser, logout, setAuthToken } from './store/auth';

// if (localStorage.token) {

//   // Set auth token header auth
//   const token = localStorage.TOKEN
//   setAuthToken(token)
//   // Decode token and get user info and exp
//   const decoded = jwt_decode(token)
//   // Set user and isAuthenticated
//   store.dispatch(setCurrentUser(decoded))
//   // Check for expired token
//   const currentTime = Date.now() / 1000 // to get in milliseconds

//   if (decoded.exp < currentTime) {
//     // Logout user
//     store.dispatch(logout())
//     // Redirect to login
//     window.location.href = './login'
//   }
// }

/**
 * COMPONENT
 */
class Routes extends Component {
	constructor() {
		super();
		this.state = {
			token: null,
			access_token: null,
		};
	}

	// componentDidMount() {
	// 	// this.props.loadInitialData();
	// 	if (localStorage.token) {
	// 		// Set auth token header auth
	// 		const token = localStorage.TOKEN;
	// 		setAuthToken(token);
	// 		// Decode token and get user info and exp
	// 		const decoded = jwt_decode(token);
	// 		// Set user and isAuthenticated
	// 		store.dispatch(setCurrentUser(decoded));
	// 		// Check for expired token
	// 		const currentTime = Date.now() / 1000; // to get in milliseconds

	// 		if (decoded.exp < currentTime) {
	// 			// Logout user
	// 			store.dispatch(logout());
	// 			// Redirect to login
	// 			window.location.href = './login';
	// 		}
	// 	}
	// }

	render() {
		const { auth } = this.props;

		return (
			<div>
				{auth.isAuthenticated ? (
					<Switch>
						<Route path="/home" component={Home} />
						{this.state.access_token === null ? (
							<Link />
						) : (
							<Route
								path="/user/:userId"
								render={(routerprops) => (
									<TransactionsContainer
										accessToken={this.state.access_token}
									/>
								)}
							/>
						)}
					</Switch>
				) : (
					<Switch>
						<Route path="/" exact component={Landing} />
						<Route path="/login" component={Login} />
						<Route path="/signup" component={Signup} />
					</Switch>
				)}
			</div>
		);
	}
}

/**
 * CONTAINER
 */

Routes.propTypes = {
	auth: PropTypes.object.isRequired,
};

const mapState = (state) => {
	return {
		// Being 'logged in' for our purposes will be defined has having a state.auth that has a truthy id.
		// Otherwise, state.auth will be an empty object, and state.auth.id will be falsey
		isLoggedIn: !!state.auth.id,
		auth: state.auth,
	};
};

const mapDispatch = (dispatch) => {
	return {
		loadInitialData() {
			dispatch(me());
		},
	};
};

// The `withRouter` wrapper makes sure that updates are not blocked
// when the url changes
export default withRouter(connect(mapState, mapDispatch)(Routes));
