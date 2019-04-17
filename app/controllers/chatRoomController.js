const mongoose = require('mongoose');
const response = require('./../libs/responseLib')
const logger = require('./../libs/loggerLib');
const check = require('../libs/checkLib')
const mailerLib = require('../libs/mailerLib')

const UserModel = mongoose.model('User')
const ChatRoomModel = mongoose.model('chatRoom')



let getAllChatRoomsFunction = (req, res) => {

    ChatRoomModel.find()
        .select(' -__v -_id')
        .lean()
        .exec((err, roomsDetails) => {

            if (err) {
                logger.error('Failed to find Chat rooms', "chatRoomController: getAllChatRoomsFunction()", 10);
                let apiResponse = response.generate(true, "failed to find the Rooms", 500, null);
                res.send(apiResponse);
            }
            else if (check.isEmpty(roomsDetails)) {
                logger.error("No Chat Rooms Found", "chatRoomController: getAllChatRoomsFunction()", 10);
                let apiResponse = response.generate(true, "No Chat Rooms Found", 500, null);
                res.send(apiResponse);
            }
            else {
                logger.info("Chat Rooms found", "chatRoomController: getAllChatRoomsFunction()", 10);
                let apiResponse = response.generate(false, "Chat Rooms found", 200, roomsDetails);
                res.send(apiResponse);
            }
        })
}//end getAllChatRooms function



let getSingleChatRoomFunction = (req, res) => {

    if (check.isEmpty(req.params.chatRoomId)) {
        logger.error("chatRoomId is missing", "chatRoomController: getSingleChatRoomFunction()", 10);
        let apiResponse = response.generate(true, "chatRoomId is missing", 500, null);
        res.send(apiResponse);
    }
    else {
        ChatRoomModel.findOne({ chatRoomId: req.params.chatRoomId }, (err, roomDetails) => {

            if (err) {
                logger.error('Failed to find Chat room', "chatRoomController: getSingleChatRoomFunction()", 10);
                let apiResponse = response.generate(true, "Failed to find Chat Room", 500, null);
                res.send(apiResponse);
            }
            else if (check.isEmpty(roomDetails)) {
                logger.error("No Chat Room Found", "chatRoomController: getSingleChatRoomFunction()", 10);
                let apiResponse = response.generate(true, "No Chat Room Found", 500, null);
                res.send(apiResponse);
            }
            else {
                logger.info("Chat Room found", "chatRoomController: getSingleChatRoomFunction()", 10);
                let apiResponse = response.generate(false, "Chat room found", 200, roomDetails);
                res.send(apiResponse);
            }
        });
    }
}//end getSingleChatRoom function


//to get those chat rooms which the logged-in user is a member of.
let getMyChatRoomsFunction = (req, res) => {
    let validateParams = () => {
        return new Promise((resolve, reject) => {
            if (check.isEmpty(req.params.userId)) {
                logger.info('Params missing: userId', 'getMyChatRoomsFunction()', 9)
                let apiResponse = response.generate(true, 'parameters missing.', 403, null)
                reject(apiResponse)
            } else {
                resolve()
            }
        })
    }


    let getMyChatRooms = () => {
        return new Promise((resolve, reject) => {
            let findQuery = {
                'chatRoomMembers.userId': req.params.userId
            }
            ChatRoomModel.find(findQuery)
                .select('-_id -__v')
                .lean()
                .exec((err, result) => {
                    if (err) {
                        logger.error(err.message, 'chatRoomController: getMyChatRooms', 10)
                        let apiResponse = response.generate(true, 'Error occured in retrieving your own rooms', 500, null)
                        reject(apiResponse)
                    } else if (check.isEmpty(result)) {
                        logger.info('No Chat Room Found', 'chatRoomController: getMyChatRooms', 5)
                        let apiResponse = response.generate(true, 'No Room Found', 404, null)
                        console.log(apiResponse)
                        reject(apiResponse)
                    } else {
                        logger.info('Chat Room Found', 'chatRoomController: getMyChatRooms', 5)
                        resolve(result)
                    }
                })
        })
    }
    validateParams(req, res)
        .then(getMyChatRooms)
        .then((result) => {
            let apiResponse = response.generate(false, 'Rooms Found', 200, result)
            res.send(apiResponse)
        })
        .catch((error) => {
            res.send(error)
        })
}


let sendInviteFunction = (req, res) => {

    if (check.isEmpty(req.body.inviteEmail)) {
        logger.error("email-id is missing", "chatRoomController: sendInviteFunction()", 10);
        let apiResponse = response.generate(true, "email-id is missing", 500, null);
        res.send(apiResponse);
    }
    else {
        mailerLib.sendEmail('"Whatsapp invitation mail" <support@whatsapp.com>', req.body.inviteEmail,
            'You are invited.', '', `Hi, you are invited to join a new chat room :
            <a href='http://localhost:4200/mainChatWindow/${req.params.chatRoomId}> click here to join.</a>`);
        logger.info("Mail sent successfully", "chatRoomController: sendInviteFunction()", 10);
        let apiResponse = response.generate(false, "Mail sent successfully", 200, "Mail sent successfully");
        res.send(apiResponse);
    }

}//end sendInviteFunction function


module.exports = {
    getAllChatRooms: getAllChatRoomsFunction,
    getSingleChatRoom: getSingleChatRoomFunction,
    getMyChatRooms: getMyChatRoomsFunction,
    sendInvite: sendInviteFunction
}
