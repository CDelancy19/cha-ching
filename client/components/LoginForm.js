// import React from 'react';

// /**
//  * COMPONENT
//  */

// const LoginForm = (props) => {
// 	const { name, displayName, handleSubmit, error } = props;

// 	return (
// 		<div id='loggin'>
// 			<form onSubmit={handleSubmit} name={name}>
// 				<div id='userInfo'>
// 					<label htmlFor="username">
// 						<small>Username</small>
// 					</label>
// 					<input name="username" type="text" />
// 				</div>
// 				<div>
// 					<label htmlFor="password">
// 						<small>Password</small>
// 					</label>
// 					<input name="password" type="password" />
// 				</div>
// 				<div>
// 					<a href="/">
// 						<button type="submit">{displayName}</button>
// 					</a>
// 				</div>
// 				{error && error.response && <div> {error.response.data} </div>}
// 			</form>
// 		</div>
// 	);
// };

// export default LoginForm;

import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { loginUser } from '../store/auth'
import classnames from 'classnames'
// import blob from '../../img/blob-login.svg'

class LoginForm extends Component {
  constructor() {
    super()
    this.state = {
      email: '',
      password: '',
      errors: {}
    }
  }

  componentDidMount() {
    // If logged in and user navigates to Register page, redirect to dashboard
    if (this.props.auth.isAuthenticated) {
      this.props.history.push('/dashboard');
    }
  }

  componentDidUpdate(nextProps) {
    if (nextProps.auth.isAuthenticated) {
      this.props.history.push('/dashboard') // push user to dashboard when they login
    }
    if (nextProps.errors) {
      this.setState({
        errors: nextProps.errors
      })
    }
  }

  onChange = e => {
    this.setState({ [e.target.id]: e.target.value })
  }

  onSubmit = e => {
    e.preventDefault()
    const userData = {
      email: this.state.email,
      password: this.state.password
    }
    // console.log(userData)

    this.props.loginUser(userData)
    // since we handle the redirect within our component, we don't need to pass in this.props.history as a parameter
  }

  render() {
    const { errors } = this.state
    return (
      <div className='container login-wrapper'>
        {/* <img src={blob} alt='blob' className='blob' /> */}
        <div className='row'>
          <div className='col s8 offset-s2'>

            <Link to='/' className='btn-flat waves-effect'>
              <i className='material-icons left'>keyboard_backspace</i>
              Back to home
            </Link>

            <div className='col s12'>
              <h2>
                Login
              </h2>
              <p className='grey-text text-darken-1'>
                Don't have an account? <Link to='/register' className='link'>Register</Link>
              </p>
            </div>

            <form noValidate onSubmit={this.onSubmit}>
              <div className='input-field col s12'>
                <input
                  onChange={this.onChange}
                  value={this.state.email}
                  error={errors.email}
                  id='email'
                  type='email'
                  className={classnames('', {
                    invalid: errors.email || errors.emailnotfound
                  })}
                />
                <label htmlFor='email'>Email</label>
                <span className='red-text'>
                  {errors.email}
                  {errors.emailnotfound}
                </span>
              </div>

              <div className='input-field col s12'>
                <input
                  onChange={this.onChange}
                  value={this.state.password}
                  error={errors.password}
                  id='password'
                  type='password'
                  className={classnames('', {
                    invalid: errors.password || errors.passwordincorrect
                  })}
                />
                <label htmlFor='password'>Password</label>
                <span className='red-text'>
                  {errors.password}
                  {errors.passwordincorrect}
                </span>
              </div>

              <div className='col s12' style={{ paddingLeft: '11.250px' }}>
                <button
                  type='submit'
                  className='btn btn-large waves-effect waves-light hoverable  accent-3'
                >
                  Login
                </button>
              </div>
            </form>

          </div>
        </div>
      </div>
    )
  }
}

LoginForm.propTypes = {
  loginUser: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
  // errors: PropTypes.object.isRequired
}

const mapStateToProps = state => ({
  auth: state.auth,
  // errors: state.errors
})

const mapDispatch = dispatch => ({
  loginUser: (userData) => dispatch(loginUser(userData))
})

export default connect(mapStateToProps, mapDispatch)(LoginForm)