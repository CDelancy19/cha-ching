import React from 'react';
import { connect } from 'react-redux';
import { authenticate } from '../store';
import SignUpForm from './SignUpForm';
import LoginForm from './LoginForm';

/**
 * COMPONENT
 */
const AuthForm = (props) => {
	if (props.name === 'login') {
		return <LoginForm {...props} />;
	} else {
		return <SignUpForm {...props} />;
	}
};

/**
 * CONTAINER
 *   Note that we have two different sets of 'mapStateToProps' functions -
 *   one for Login, and one for Signup. However, they share the same 'mapDispatchToProps'
 *   function, and share the same Component. This is a good example of how we
 *   can stay DRY with interfaces that are very similar to each other!
 */
const mapLogin = (state) => {
	return {
		name: 'login',
		displayName: 'Login',
		error: state.currentUser.error,
	};
};

const mapSignup = (state) => {
	return {
		name: 'signup',
		displayName: 'Sign Up',
		error: state.currentUser.error,
	};
};

const mapDispatch = (dispatch) => {
	return {
		handleSubmit(evt) {
			evt.preventDefault();
			const formName = evt.target.name;
			const username = evt.target.username.value;
			const password = evt.target.password.value;
			if (formName === 'signup') {
				const formName = evt.target.name;
				const username = evt.target.username.value;
				const password = evt.target.password.value;
				const fullName = evt.target.fullName.value;
				const email = evt.target.email.value;
				dispatch(authenticate(username, password, fullName, email, formName));
			} else {
				dispatch(authenticate(username, password, null, null, formName));
			}
		},
	};
};

export const Login = connect(mapLogin, mapDispatch)(AuthForm);
export const Signup = connect(mapSignup, mapDispatch)(AuthForm);
