// const Sequelize = require('sequelize')
// const db = require('../db')
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const axios = require('axios');

const SALT_ROUNDS = 5;

// const User = db.define('user', {
//   username: {
//     type: Sequelize.STRING,
//     unique: true,
//     allowNull: false
//   },
//   password: {
//     type: Sequelize.STRING,
//   },
//   fullName: {
// 		type: Sequelize.STRING,
// 	},
// 	email: {
// 		type: Sequelize.STRING,
// 		validate: {
// 			isEmail: true
// 		},
// 		unique: {
// 			args: true,
// 			msg: 'Email address already in use!',
// 		},
// 	},
// 	isAdmin: {
// 		type: Sequelize.BOOLEAN,
// 		defaultValue: false
// 	}
// })

// module.exports = User

// /**
//  * instanceMethods
//  */
// User.prototype.correctPassword = function(candidatePwd) {
//   //we need to compare the plain version to an encrypted version of the password
//   return bcrypt.compare(candidatePwd, this.password);
// }

// User.prototype.generateToken = function() {
//   return jwt.sign({id: this.id}, process.env.JWT)
// }

// /**
//  * classMethods
//  */
// User.authenticate = async function({ username, password }){
//     const user = await this.findOne({where: { username }})
//     if (!user || !(await user.correctPassword(password))) {
//       const error = Error('Incorrect username/password');
//       error.status = 401;
//       throw error;
//     }
//     return user.generateToken();
// };

// User.findByToken = async function(token) {
//   try {
//     const {id} = await jwt.verify(token, process.env.JWT)
//     const user = User.findByPk(id)
//     if (!user) {
//       throw 'nooo'
//     }
//     return user
//   } catch (ex) {
//     const error = Error('bad token')
//     error.status = 401
//     throw error
//   }
// }

// /**
//  * hooks
//  */
// const hashPassword = async(user) => {
//   //in case the password has been changed, we want to encrypt it with bcrypt
//   if (user.changed('password')) {
//     user.password = await bcrypt.hash(user.password, SALT_ROUNDS);
//   }
// }

// User.beforeCreate(hashPassword)
// User.beforeUpdate(hashPassword)
// User.beforeBulkCreate(users => Promise.all(users.map(hashPassword)))

const mongoose = require('mongoose');
const keys = require('../../config/keys');
const Schema = mongoose.Schema;

// Create schema to represent a user, defining fields & types as objects of the schema
const UserSchema = new Schema({
	name: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		required: true,
		unique: 1,
	},
	password: {
		type: String,
		required: true,
		minlength: 5,
	},
	date: {
		type: Date,
		default: Date.now,
	},
  token : {
      type : String
  }
});

// /**
//  * instanceMethods
//  */

UserSchema.methods.correctPassword = function (candidatePwd) {
	//we need to compare the plain version to an encrypted version of the password
	return bcrypt.compare(candidatePwd, this.password);
};

// UserSchema.methods.generateToken = function () {
// 	return jwt.sign({ _id: this.id }, process.env.JWT);
// };

UserSchema.methods.generateToken = function(cb){
  var user = this;
  var token = jwt.sign(user._id.toHexString(),keys.SECRET)
  user.token = token;
  user.save(function(err,user){
      if(err) return cb(err);
      cb(null,user);
  })
};

UserSchema.methods.comparePassword = function(plaintext, callback) {
  return callback(null, bcrypt.compareSync(plaintext, this.password));
};

/**
 * classMethods
 */

UserSchema.statics.authenticate = async function ({ username, password }) {
	const user = await this.findOne({ username: username });
	if (!user || !(await user.correctPassword(password))) {
		const error = Error('Incorrect username/password');
		error.status = 401;
		throw error;
	}
	return user.generateToken();
};

UserSchema.statics.findByToken = function(token,cb){
  var user = this;
  jwt.verify(token,process.env.SECRET,function(err,decode){
      user.findOne({"_id":decode, "token":token},function(err,user){
          if(err) return cb(err)
          cb(null,user)
      })
  })
};

// UserSchema.statics.findByToken = async function (token) {
// 	try {
// 		const { id } = await jwt.verify(token, process.env.JWT);
// 		const user = UserSchema.findById(id);
// 		if (!user) {
// 			throw 'nooo';
// 		}
// 		return user;
// 	} catch (ex) {
// 		const error = Error('bad token');
// 		error.status = 401;
// 		throw error;
// 	}
// };

/**
 * hooks
 */
const hashPassword = async (user) => {
	//in case the password has been changed, we want to encrypt it with bcrypt
	if (user.changed('password')) {
		user.password = await bcrypt.hash(user.password, SALT_ROUNDS);
	}
};


UserSchema.pre("save",function(next){
  var user = this;
  
  if(user.isModified("password")){
      bcrypt.genSalt(SALT_ROUNDS, function(err,salt){
          if(err){
              return next(err)
          }
          bcrypt.hash(user.password, salt,function(err,hash){
              if(err){
                  return next(err)
              }
              user.password = hash;
              next();
          })
      })
  }else{
      next();
  }
});

UserSchema.methods.comparePassword = function(candidatePassword,cb){
  bcrypt.compare(candidatePassword,this.password, function(err,isMatch){
      if(err) return cb(err);
      cb(null,isMatch);
  })
}

// UserSchema.pre("save", function(next) {
//   if(!this.isModified("password")) {
//       return next();
//   }
//   this.password = bcrypt.hashSync(this.password, 10);
//   next();
// });
// UserSchema.pre("update", function(next) {
//   if(!this.isModified("password")) {
//       return next();
//   }
//   this.password = bcrypt.hashSync(this.password, 10);
//   next();
// });
// UserSchema.beforeBulkCreate(users => Promise.all(users.map(hashPassword)))

// Export the model so we can access outside of this file
const User = mongoose.model('users', UserSchema);
module.exports = User;
