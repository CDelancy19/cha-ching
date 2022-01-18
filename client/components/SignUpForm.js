// import React from 'react';

// /**
//  * COMPONENT
//  */

// const SignUpForm = (props) => {
// 	const { name, displayName, handleSubmit, error } = props;

// 	return (
// 		<div id="signUp">
// 			<form onSubmit={handleSubmit} name={name}>
// 				<div>
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
// 					<label htmlFor="fullName">
// 						<small>Full Name</small>
// 					</label>
// 					<input name="fullName" type="text" />
// 					<label htmlFor="email">
// 						<small>Email</small>
// 					</label>
// 					<input name="email" type="text" />
// 				</div>
// 				<div>
// 					<a href="/home">
// 						<button type="submit">{displayName}</button>
// 					</a>
// 				</div>
// 				{error && error.response && <div> {error.response.data} </div>}
// 			</form>
// 		</div>
// 	);
// };

// export default SignUpForm;

import React, { Component } from 'react'
import { Link, withRouter } from 'react-router-dom'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { registerUser } from '../store/auth'
import classnames from 'classnames'
// import blob from '../../img/blob-register.svg'

class SignUpForm extends Component {
  constructor() {
    super()
    this.state = {
      name: '',
      email: '',
      password: '',
      password2: '',
      errors: {}
    }
  }

  componentDidMount() {
    // If logged in and user navigates to Register page, redirect to dashboard
    if (this.props.auth.isAuthenticated) {
      this.props.history.push('/dashboard');
    }
  }

  componentWillReceiveProps(nextProps) {
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
    const newUser = {
      name: this.state.name,
      email: this.state.email,
      password: this.state.password,
      password2: this.state.password2
    }
    console.log(newUser)
    this.props.registerUser(newUser, this.props.history)
  }



  render() {
    const { errors } = this.state
    return (
      <div className='container register-wrapper'>
        {/* <img src={blob} alt='blob' className='blob' /> */}
        <div className='row'>
          <div className='col s8 offset-s2'>
            <Link to='/' className='btn-flat waves-effect'>Back to home
            </Link>

            <div className='col s12'>
              <h2>
                Sign Up
              </h2>
              <p className='grey-text text-darken-1'>
                Already have an account? <Link to='/login' className='link'>Log in</Link>
              </p>
            </div>

            <form noValidate onSubmit={this.onSubmit}>
              <div className='input-field col s12'>
                <input
                  onChange={this.onChange}
                  value={this.state.name}
                  error={errors.name}
                  id='name'
                  type='text'
                  className={classnames('', {
                    invalid: errors.name
                  })}
                />
                <label htmlFor='name'>Name</label>
                <span className='red-text'>{errors.name}</span>
              </div>

              <div className='input-field col s12'>
                <input
                  onChange={this.onChange}
                  value={this.state.email}
                  error={errors.email}
                  id='email'
                  type='email'
                  className={classnames('', {
                    invalid: errors.email
                  })}
                />
                <label htmlFor='email'>Email</label>
                <span className='red-text'>{errors.email}</span>
              </div>

              <div className='input-field col s12'>
                <input
                  onChange={this.onChange}
                  value={this.state.password}
                  error={errors.password}
                  id='password'
                  type='password'
                  className={classnames('', {
                    invalid: errors.password
                  })}
                />
                <label htmlFor='password'>Password</label>
                <span className='red-text'>{errors.password}</span>
              </div>

              <div className='input-field col s12'>
                <input
                  onChange={this.onChange}
                  value={this.state.password2}
                  error={errors.password2}
                  id='password2'
                  type='password'
                  className={classnames('', {
                    invalid: errors.password2
                  })}
                />
                <label htmlFor='password2'>Confirm Password</label>
                <span className='red-text'>{errors.password2}</span>
              </div>

              <div className='col s12'>
                <button type='submit'
                  className='btn btn-large waves-effect waves-light hoverable accent-3'>
                  Let's Go
                </button>
              </div>
            </form>

          </div>
        </div>
      </div>
    )
  }
}

SignUpForm.propTypes = {
  registerUser: PropTypes.func.isRequired,
  auth: PropTypes.object.isRequired,
  // errors: PropTypes.object.isRequired
}

const mapStateToProps = state => ({
  auth: state.auth,
  // errors: state.errors
})

const mapDispatch = dispatch => ({
  registerUser: (userData, history) => dispatch(registerUser(userData, history))
})

export default connect(mapStateToProps, mapDispatch)(withRouter(SignUpForm))