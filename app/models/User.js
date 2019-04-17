'use strict'
/**
 * Module Dependencies
 */
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ChatRoomModel = mongoose.model('chatRoom')

let userSchema = new Schema({
  userId: {
    type: String,
    default: '',
    index: true,
    unique: true
  },
  firstName: {
    type: String,
    required : true
  },
  lastName: {
    type: String,
    default: ''
  },
  password: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  mobileNumber: {
    type: String,
    required: true
  },
  createdOn :{
    type:Date,
    default:Date.now()
  }
  // groupChatRooms:[
    
  // ]
})


mongoose.model('User', userSchema);