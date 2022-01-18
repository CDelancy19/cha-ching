import axios from 'axios'
import history from '../history'
import jwt_decode from 'jwt-decode'
const isEmpty = require('is-empty')

const TOKEN = 'token'

/**
 * ACTION TYPES
 */
const SET_AUTH = 'SET_AUTH'
export const GET_ERRORS = "GET_ERRORS"
export const USER_LOADING = "USER_LOADING"
export const SET_CURRENT_USER = "SET_CURRENT_USER"

/**
 * ACTION CREATORS
 */
const setAuth = auth => ({type: SET_AUTH, auth})

/**
 * THUNK CREATORS
 */
export const me = () => async dispatch => {
  const token = window.localStorage.getItem(TOKEN)
  if (token) {
    const res = await axios.get('/auth/me', {
      headers: {
        authorization: token
      }
    })
    return dispatch(setAuth(res.data))
  }
}

export const setAuthToken = token => {
  if (token) {
    // Apply authorization token to every request if logged in
    axios.defaults.headers.common['Authorization'] = token
  } else {
    // Delete auth header
    delete axios.defaults.headers.common['Authorization']
  }
}

export const registerUser = (userData, history) => dispatch => {
  axios
    .post('/auth/signup', userData)
    .then(res => history.push('/login')) // re-direct to login on successful register
    .catch(err =>
      dispatch({
        type: GET_ERRORS,
        payload: err.response.data
      })
    )
}

export const loginUser = userData => dispatch => {
  axios
    .post('/auth/login', userData)
    .then(res => {
      // Save to localStorage
      // Set token to localStorage
			console.log(res.data)
      const { token } = res.data
      localStorage.setItem('token', token)
      // Set token to Auth header
      setAuthToken(token)
      // Decode token to get user data
      const decoded = jwt_decode(token)
      // Set current user
      dispatch(setCurrentUser(decoded))
			history.push('/dashboard');
    })
    .catch(err =>
			
      dispatch({
        type: GET_ERRORS,
        payload: err
      }),
			// console.log(res.data)
    )
}

// Set logged in user
export const setCurrentUser = decoded => {
  return {
    type: SET_CURRENT_USER,
    payload: decoded
  }
}

// User loading
export const setUserLoading = () => {
  return {
    type: USER_LOADING
  }
}

export const authenticate =
(
	username,
	password,
	name = null,
	email = null,
	method
) =>
async (dispatch) => {
	let res;
	try {
		if (method === 'signup') {
			res = await axios.post(`/auth/${method}`, {
				username,
				password,
				name,
				email,
			});
			history.push('/login');
		} else {
			res = await axios.post(`/auth/${method}`, { username, password });
			window.localStorage.setItem(TOKEN, res.data.token);
			dispatch(me());
			history.push('/user/:id');
		}
	} catch (authError) {
		return dispatch(setAuth({ error: authError }));
	}
};

export const logout = () => {
  window.localStorage.removeItem(TOKEN)
  history.push('/login')
  return {
    type: SET_AUTH,
    auth: {}
  }
}

/**
 * REDUCER
 */
export default function(state = {}, action) {
  switch (action.type) {
    case SET_CURRENT_USER:
      return {
        ...state,
        isAuthenticated: !isEmpty(action.payload),
        user: action.payload
      }
    case USER_LOADING:
      return {
        ...state,
        loading: true
      }
    default:
      return state
  }
}
