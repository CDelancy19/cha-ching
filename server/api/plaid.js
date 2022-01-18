require('dotenv').config();
const router = require('express').Router();
const bodyParser = require('body-parser');
const keys = require('../config/keys');
const cors = require('cors');
const { Configuration, PlaidApi, PlaidEnvironments } = require('plaid');
// const plaid =require('plaid');
const moment = require('moment');
router.use(cors());
router.use(bodyParser.json());
const mongoose = require('mongoose')

const Account = require('../db/models/Account');
const User = require('../db/models/User');
// const { PlaidApi } = require('plaid');

const PLAID_CLIENT_ID = keys.PLAID_CLIENT_ID;
const PLAID_SECRET = keys.PLAID_SECRET;
const PLAID_ENV = process.env.PLAID_ENV || 'sandbox';
const PLAID_PRODUCTS = (process.env.PLAID_PRODUCTS || 'transactions').split(
	','
);
const PLAID_COUNTRY_CODES = (process.env.PLAID_COUNTRY_CODES || 'US').split(
	','
);
const PLAID_REDIRECT_URI = process.env.PLAID_REDIRECT_URI || '';
const PLAID_ANDROID_PACKAGE_NAME = process.env.PLAID_ANDROID_PACKAGE_NAME || '';
let ACCESS_TOKEN = null;
let PUBLIC_TOKEN = null;
let ITEM_ID = null;
let PAYMENT_ID = null;
let TRANSFER_ID = null;

const configuration = new Configuration({
	basePath: PlaidEnvironments[PLAID_ENV],
	baseOptions: {
		headers: {
			'PLAID-CLIENT-ID': PLAID_CLIENT_ID,
			'PLAID-SECRET': PLAID_SECRET,
			env: PLAID_ENV,
			'Plaid-Version': '2020-09-14',
		},
	},
});

const client = new PlaidApi(configuration);

router.post('/create_link_token/:id', async (req, res, next) => {
	Promise.resolve()
		.then(async function () {
			const user = await User.findById(req.params.id);
			const clientUserId = user.id;
			const configs = {
				user: {
					// This should correspond to a unique id for the current user.
					client_user_id: String(clientUserId),
				},
				client_name: 'cha-ching',
				products: PLAID_PRODUCTS,
				country_codes: PLAID_COUNTRY_CODES,
				language: 'en',
			};

			// if (PLAID_REDIRECT_URI !== '') {
			// 	configs.redirect_uri = PLAID_REDIRECT_URI;
			// }

			if (PLAID_ANDROID_PACKAGE_NAME !== '') {
				configs.android_package_name = PLAID_ANDROID_PACKAGE_NAME;
			}
			const createTokenResponse = await client.linkTokenCreate(configs);
			// prettyPrintResponse(createTokenResponse);
			console.log('THIS IS THE RESONSE LINK TOKEN', createTokenResponse.data);
			return res.json({ link_token: createTokenResponse.data });
		})
		.catch(next);
});

router.post('/get_link_token', async (req, res) => {
	const response = await client.linkTokenGet(linkToken).catch((err) => {
		if (!linkToken) {
			return 'no link token';
		}
	});
});

router.post('/accounts/add/:id', async (req, res) => {
	// console.log('req.body first', req.body);
	const { publicToken } = req.body;
	const userId = req.params.id;
	const institution = req.body.metadata.institution;
	const { name, institution_id } = institution;
	// console.log("server req", req.body)
	// console.log("public token server side", publicToken)
	if (publicToken) {
		const response = await client
			.itemPublicTokenExchange({ public_token: publicToken, })
			.then((exchangeResponse) => {
        console.log('======exchangeResponse.data=======', exchangeResponse.data)

				ACCESS_TOKEN = exchangeResponse.data.access_token;
				ITEM_ID = exchangeResponse.data.item_id;
        console.log('======AccessToken=======', ACCESS_TOKEN)

				// Check if account already exists for that specific user using the userId and institutionId
				Account.findOne({
          userId: req.params.id,
					institutionId: institution_id,
				})
					.then((account) => {
						if (account) {
							console.log('Account already exists');
						} else {
							// If account does not exist, save it to DB
							const newAccount = new Account({
								userId: userId,
								accessToken: ACCESS_TOKEN,
								itemId: ITEM_ID,
								institutionId: institution_id,
								institutionName: name,
							});
							newAccount.save().then((account) => res.json(account));
						}
					})
					.catch((err) => console.log('===Mongo Error===',err)); // Mongo Error
			})
			.catch((err) => console.log('===Plaid Error===',err)); // Plaid Error
	}
});

router.delete('/accounts/:id', (req, res) => {
	Account.findById(req.params.id).then((account) => {
		// Delete account
		account.remove().then(() => res.json({ success: true }));
	});
});

router.get('/accounts', (req, res) => {
	Account.find({ userId: req.user.id })
		.then((accounts) => res.json(accounts))
		.catch((err) => console.log(err));
});

router.post('/transactions', async (req, res) => {
	const now = moment();
	const today = now.format('YYYY-MM-DD');
	const thirtyDaysAgo = now.subtract(30, 'days').format('YYYY-MM-DD');

	let transactions = [];
	const accounts = req.body;

	if (accounts) {
		accounts.forEach(function (account) {
			accessToken = account.accessToken;
			const institutionName = account.institutionName;
			client
				.getTransactions(accessToken, thirtyDaysAgo, today)
				.then((response) => {
					// Push object onto an array containing the institutionName and all transactions
					transactions.push({
						accountName: institutionName,
						transactions: response.transactions,
					});
					// Don't send back response till all transactions have been added
					if (transactions.length === accounts.length) {
						res.json(transactions);
					}
				})
				.catch((err) => console.log(err));
		});
	}
});

router.get('/transactions', (req, res) => {
	res.send('hello world');
});

module.exports = router;
