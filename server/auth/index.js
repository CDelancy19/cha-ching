const router = require('express').Router();
const { User } = require('../db');
module.exports = router;
const chalk = require('chalk');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const { auth } = require('./middleware/auth');
const jwt = require('jsonwebtoken');
const keys = require('../config/keys');

router.post('/login', async (req, res) => {
	try {
		// var user = await User.findOne({ username: req.body.username });
		// if (!user) {
		// 	return res.status(400).send({ message: 'The username does not exist' });
		// }
		// user.comparePassword(req.body.password, (error, match) => {
		// 	if (!match) {
		// 		return res.status(400).send({ message: 'The password is invalid' });
		// 	}
		// });
		// console.log(
		// 	chalk.bold.green('The username and password combination is correct!')
		// );
		// user.generateToken((err, user) => {
		// 	if (err) return res.status(400).send(err);
		// 	res
		// 		.cookie('ths_auth', user.token)
		// 		.status(200)
		// 		.json({ 'Login Success': 'True' });
		// });
		const username = req.body.username;
		const password = req.body.password;

		// If valid, use MongoDB's User.findOne() to see if user exists
		User.findOne({ username }).then((user) => {
			// If does not exist
			if (!user) {
				return res.status(404).json({ usernamenotfound: 'Username not found' });
			}

			// If does exist, use bcryptjs to compare submitted password with hashed password in DB
			bcrypt.compare(password, user.password).then((isMatch) => {
				if (isMatch) {
					// If passwords match, create JWT Payload
					const payload = {
						id: user.id,
						name: user.name,
					};

					// Sign our jwt, including payload, keys.secretOrKey from keys.js and set an expiresIn time(in seconds)
					jwt.sign(
						payload,
						keys.SECRET,
						{
							expiresIn: 31556926, // 1 year in seconds
						},

						// If successful, append the token to a Bearer string(ex: in passport.js opts.jwtFromRequest = ExtractJwt.dromAuthHeaderAsBearerToken())
						(err, token) => {
							res.json({
								success: true,
								token: token,
							});
						}
					);
				}
			});
		});
	} catch (error) {
		console.log(error);
		res.status(500).json(error);
	}
});

router.post('/signup', async (req, res, next) => {
	try {
		const user = await User.create(req.body);
		user.save((err, doc) => {
			if (err) throw err;
			res.json({ status: true, userdata: doc });
		});
	} catch (err) {
		if (err.name === 'SequelizeUniqueConstraintError') {
			res.status(401).send('User already exists');
		} else {
			next(err);
		}
	}
});

router.get('/me', auth, (req, res) => {
	res.json({
		user: req.user,
	});
});

// router.get('/me', async (req, res, next) => {
// 	try {
// 		var result = await User.find().exec();
// 		res.send(result);
// 	} catch (error) {
// 		res.status(500).send(error);
// 	}
// });

module.exports = router;
