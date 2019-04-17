const mongoose = require('mongoose')
const Schema = mongoose.Schema;


let chatRoomSchema = new Schema({
    chatRoomId: {
        type: String,
        unique: true,
        required: true
    },
    chatRoomName: {
        type: String,
        require: true
    },
    // admin: {},
    ownerId : {
        type : String,
        required : true
    },
    ownerName : {
        type : String,
        required : true
    },
    createdOn: {
        type: Date,
        default: Date.now()
    },
    modifiedOn: {
        type: Date,
        default: Date.now
    },
    chatRoomMembers: [
        {
            _id: false,
            userId: {
                type: String,
                required: true
            },
            userName: {
                type: String,
                required: true
            }
        }

    ],
    chatRoomStatus: {
        type: Boolean,
        default: true
    }

})

mongoose.model('chatRoom', chatRoomSchema)
