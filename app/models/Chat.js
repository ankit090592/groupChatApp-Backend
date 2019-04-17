const mongoose = require('mongoose')

const Schema = mongoose.Schema

let chatSchema = new Schema({

  chatId: {
    type: String,
    unique: true,
    required: true
  },
  senderId: {
    type: String,
    required: true
  },
  senderName: {
    type: String,
    required: true
  },
  
  // receiverName: { 
  //   type: String, 
  //   default: '' 
  // },
  // receiverId: { 
  //   type: String, 
  //   default: '' 
  // },
  message: {
    type: String,
    required: true
  },
  chatRoomId: {
    type: String,
    required: true
  },
  // seen: { 
  //   type: Boolean, 
  //   default: false 
  // },
  createdOn: {
    type: Date,
    default: Date.now
  },
  // modifiedOn: { 
  //   type: Date, 
  //   default: Date.now 
  // }

})

mongoose.model('Chat', chatSchema)
