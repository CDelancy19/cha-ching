import React, { useEffect, Component } from 'react';
import { PlaidLink } from 'react-plaid-link';
import axios from 'axios';
import { connect } from 'react-redux';
import TransactionsContainer from './TransactionsContainer';

class Link extends Component {
	constructor(props) {
		super(props);
		this.state = {
			token: null,
			access_token: null,
		};
		this.createLinkToken = this.createLinkToken.bind(this);
		this.getAccessToken = this.getAccessToken.bind(this);
		this.onExit = this.onExit.bind(this);
		this.onEvent = this.onEvent.bind(this);
		this.onSuccess = this.onSuccess.bind(this);
	}
	onExit(error, metadata) {
		return console.log('onExit', error, metadata);
	}

	onEvent(eventName, metadata) {
		console.log('onEvent', eventName, metadata);
		if (eventName === 'HANDOFF') {
			return <TransactionsContainer />;
		}
	}

	onSuccess(token, metadata) {
		console.log('onSuccess', token, metadata);
		this.getAccessToken(token, metadata);
	}

	createLinkToken = async () => {
		console.log('CREATING LINK TOKEN');
		const res = await axios.post(
			`http://localhost:8080/api/plaid/create_link_token/${this.props.currentUser.user.id}`
		);
		const data = res.data.link_token;
		console.log('GOT SOME DATA', res);
		this.setState({ token: data.link_token });
		console.log('CREATED LINK TOKEN', this.state.token);
	};

	componentDidMount() {
		this.createLinkToken();
		console.log('current user id: ', this.props.currentUser.user.id);
	}

	getAccessToken = async (publicToken, metadata) => {
		console.log('client side public token', publicToken);
		//sends the public token to the app server
		const res = await axios.post(
			`http://localhost:8080/api/plaid/accounts/add/${this.props.currentUser.user.id}`,
			{
				publicToken: publicToken,
				metadata: metadata,
			}
		);
		const data = res.data.access_token;
		//updates state with permanent access token
		this.setState({ access_token: data });
	};

	render() {
		const { id } = this.props.currentUser;
		return (
			<div>
				<PlaidLink
					className="CustomButton"
					style={{ padding: '20px', fontSize: '16px', cursor: 'pointer' }}
					token={this.state.token ? this.state.token : ''}
					onExit={this.onExit}
					onSuccess={this.onSuccess}
					onEvent={this.onEvent}
				>
					Open Link and connect your bank!
				</PlaidLink>
			</div>
		);
	}
}

const mapState = (state) => {
	return {
		currentUser: state.currentUser,
		orders: state.orders,
	};
};

export default connect(mapState)(Link);
