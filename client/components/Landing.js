import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'
// import happy from '../../img/happy.gif'

class Landing extends Component {
  componentDidMount() {
    // If logged in, should redirect them to dashboard
    if (this.props.auth.isAuthenticated) {
      this.props.history.push('/dashboard')
    }
  }

  render() {
    return (
      <div className='container valign-wrapper landing-wrapper'>

        <div className='col s6'>
          <h1 className=''>
            <span>Stay on top of your finances </span> like a boss.
          </h1>

          <Link to='/signup' className='btn btn-large waves-effect waves-light btn-get-started'>
            Get Started
          </Link>

          <Link to='/login' className='btn btn-large btn-flat waves-effect white black-text'>
            Log In
          </Link>
        </div>

        {/* <div className='col s6 center-align'>
          <img src={happy} className='happy-man' alt='happy floating man' />
        </div> */}

      </div >
    )
  }
}

Landing.propTypes = {
  auth: PropTypes.object.isRequired
}

const mapStateToProps = state => ({
  auth: state.auth
})

export default connect(mapStateToProps)(Landing)