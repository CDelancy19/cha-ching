// const Sequelize = require('sequelize')
// const db = require('../db')

// const Account = db.define('account',{
 
//   accessToken: {
//     type: Sequelize.STRING,
//     allowNull: false
//   },
//   itemId: {
//     type: Sequelize.STRING,
//     allowNull: false
//   },
//   institutionId: {
//     type: Sequelize.STRING,
//     allowNull: false
//   },
//   institutionName: {
//     type: Sequelize.STRING
//   },
//   accountName: {
//     type: Sequelize.STRING
//   },
//   accountType: {
//     type: Sequelize.STRING
//   },
//   accountSubtype: {
//     type: Sequelize.STRING
//   }
// })

// module.exports = Account

const mongoose = require('mongoose')
const Schema = mongoose.Schema

const AccountSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'users'
  },
  accessToken: {
    type: String,
    required: true
  },
  itemId: {
    type: String,
    required: true
  },
  institutionId: {
    type: String,
    required: true
  },
  institutionName: {
    type: String
  },
  accountName: {
    type: String
  },
  accountType: {
    type: String
  },
  accountSubtype: {
    type: String
  }
})

let Account = mongoose.model('account', AccountSchema)

module.exports = Account