const mongoose = require('mongoose')
const socketio = require('socket.io')

const ChatModel = mongoose.model('Chat')
const ChatRoomModel = mongoose.model('chatRoom')
const events = require('events')
const eventEmitter = new events.EventEmitter()

const tokenLib = require('./tokenLib')
const redisLib = require('./redisLib')
const shortid = require('shortid')


//called from app.js
//getting http server from there
let setServer = (server) => {
    let io = socketio.listen(server)
    let myIo = io.of('')  //namespace: global instance of io can be used for cross socket communication.


    //main event handler: everything happens here
    myIo.on('connection', (socket) => {

        //event handling on client side to get verified user with an authToken
        /**
         * @apiGroup Listen
         * @apiVersion 1.0.0     
         * @api {listen} verifyUser Authenticate a user	  
         * @apiDescription <b>("verifyUser")</b> 
         * -> Called: On User's end.     
         */
        socket.emit('verifyUser', '')


        /**
         * @apiGroup Emit 
         * @apiVersion 1.0.0	 
         * @api {emit} setUser Set a user as online
         * @apiDescription <b>("set-user")</b>
         * -> Called: When a user comes online.
         * -> Params: authentication token        
         */

        socket.on('set-user', (authToken) => {

            tokenLib.verifyClaimWithoutSecret(authToken, (err, result) => {
                if (err) {
                	/**
                    * @apiVersion 1.0.0    
                    * @apiGroup Listen                         
                    * @api {listen} authError Failed authentication token authorization                              
                    * @apiDescription <b>("auth-error")</b>
                    * Called: Listened by current/main room when there is a problem with authentication token like incorrect/incomplete
                    * @apiExample Example data
                      {
                        "status": 500,
                        "error": Please provide correct auth token                                   
                       }
                     */
                    socket.emit('authError', { status: 500, error: 'Please provide correct authentication token' })
                } else {
                    let currentUser = result.data
                    socket.userId = currentUser.userId
                    socket.userName = (currentUser.firstName + ' ' + currentUser.lastName).trim()
                    let key = socket.userId
                    let value = socket.userName
                    redisLib.setANewOnlineUserInHash('onlineUsers', key, value, (err, result) => {
                        if (err) {
                            console.log('some error occured while setting in redis')
                        } else {
                            //no console print
                            console.log('user successfully set as online')
                        }
                    })
                }

                /**
                * @apiGroup Listen 
                * @apiVersion 1.0.0                
                * @api {listen} startChatRoom Notifying client of a new room creation                
                * @apiDescription <b>("startChatRoom")</b>
                * -> Called: So that the user can join main room/chat Room
               */
                socket.emit('startChatRoom', '')


                /**
                * @apiGroup Emit 
                * @apiVersion 1.0.0                
                * @api {emit} joinChatRoom Join the current/global/main room of the app OR
                * when a new chat room is joined by the user               
                * @apiDescription <b>("joinChatRoom")<b>                
                * @apiExample Example data
                   {
                       "chatRoomId":string,
                       "userId":string,
                       "userName":string
                   }
               */
                socket.on('joinChatRoom', (data) => {
                    socket.room = data.chatRoomId
                    console.log('joining ' + socket.room)
                    socket.join(data.chatRoomId)
                    redisLib.getAllUsersInAHash('onlineUsers', (err, result) => {
                        if (err) {
                            console.log(err)
                        } else {
                            console.log(socket.userName + ' is online')

                            /**
                            * @apiGroup Listen 
                            * @apiVersion 1.0.0                            
                            * @api {listen} online-user-list Getting all online users list                            
                            * @apiDescription <b>("online-user-list")</b>
                            * -> Called: After joining a chat room to get online users.
                           */
                            io.sockets.emit('online-user-list', result)
                        }
                    })

                    /**
                    * @apiGroup Listen
                    * @apiVersion 1.0.0                    
                    * @api {listen} notification Getting user joined/left notification in main Room                     
                    * @apiDescription <b>("notification")</b>
                    * -> Called: To display if the user joined/left the main Room.                    
                    * @apiExample Example output
                    * {
                        "userName" ' is online'                        
                       }
                   */
                  //let onlineMessage = ''
                    let onlineMessage = socket.userName + ' is online'
                    io.sockets.in(socket.room).emit('notification', onlineMessage)
                    //socket.broadcast.to(socket.room).emit('notification', onlineMessage)


                    /**
                       * @apiGroup Emit
                       * @apiVersion 1.0.0                     
                       * @api {emit} chatMsgGlobal Sending message notification on global/app level                      
                       * @apiDescription <b>("chatMsgGlobal")</b> 
                       * -> Called: When sending/receiving a chat message 
                       * along-with displaying/emitting a notification 
                       * @apiExample Example output
                       *{                            
                                  "senderName": string,
                                  "senderId": string,
                                  "message": string,
                                  "chatRoom" : string                            
                          }
                      */
                    socket.on('chatMsgGlobal', (data) => {
                       let onlineMessage = data.senderName + ': ' + data.message
                        io.sockets.in(socket.room).emit('notification', onlineMessage)
                    })


                    /**
                        * @apiGroup Emit 
                        * @apiVersion 1.0.0  
                        * @api {emit} typing Show which user is typing 
                        * @apiDescription <b>("typing")</b>
                        * Called: By user, to emit which user is typing 
                        * @apiExample Example output
                        * {
                                "userId": string,
                                "userName": string
                                 
                             }
                         */
                    socket.on('typing', data => {

                        /**
                        * @apiGroup Listen 
                        * @apiVersion 1.0.0                         
                        * @api {listen} typing Getting which user is typing                          
                        * @apiDescription <b>("typing")</b> 
                        * Emitted by server, listened by user to get details who is typing.
                        */
                        socket.to(socket.room).broadcast.emit('typing', data)
                    })


                    if (socket.room != 'chatRoomGlobal') {
                        setTimeout(function () {
                            eventEmitter.emit('addChatRoomMember', data)
                        }, 2000)

                        /**
                        * @apiGroup Listen  
                        * @apiVersion 1.0.0                      
                        * @api {listen} addChatRoomMember Adding a new member to chat room                      
                        * @apiDescription <b>("addChatRoomMember")</b>
                        * -> Called: Add a new member to specified chat room(except 'chatRoomGlobal')                      
                        * @apiExample Example output
                           {
                               "userId": string,
                               "chatRoomId" : string                             
                           }
                       */
                        io.sockets.in(socket.room).emit('addChatRoomMember', data)
                    }
                })



                /**
                 * @apiVersion 1.0.0
                 * @apiGroup Emit
                 * @api {emit} createChatRoom Create a new chatroom                  
                 * @apiDescription <b>("createChatRoom")</b>
                 * Emitted by user when creating a new chat room.
                 * @apiExample Example Output
                    {
                            "chatRoomName" : string,                        
                            "ownerId" : string,
                            "ownerName" : string,
                            "chatRoomMembers" : [{"userId":string,"userName":string}]                        
                    }
                */

                socket.on('createChatRoom', (data) => {
                    data['chatRoomId'] = shortid.generate()
                    eventEmitter.emit('saveRoomDb', data)
                })


                /**
                * @apiGroup Emit 
                * @apiVersion 1.0.0              
                * @api {emit} editChatRoom Edit a currently active chat room              
                * @apiDescription <b>("editChatRoom")</b>
                * Emitted when editing a chat room.
                * @apiExample Example Output
                   {
                           "chatRoomId":string,
                           "chatRoomName" : string,                         
                           "ownerId" : string,
                           "ownerName" : string                     
                   }
               */
                socket.on('editChatRoom', (data) => {
                    eventEmitter.emit('editChatRoomDb', data)
                })


                /**
                * @apiGroup Emit
                * @apiVersion 1.0.0                
                * @api {emit} chatRoomStatus To close/activate a chat room                 
                * @apiDescription <b>("chatRoomStatus")</b>
                * Emitted while setting room as active or closed.
                * @apiExample Example output
                   {
                           "chatRoomId":string,
                           "chatRoomStatus" : boolean                       
                   }
               */
                socket.on('chatRoomStatus', (data) => {
                    eventEmitter.emit('chatRoomStatus', data)
                })


                /**
                 * @apiGroup Emit 
                 * @apiVersion 1.0.0                 
                 * @api {emit} leaveChatRoom Leaving the specified chat room                 
                 * @apiDescription <b>("leaveChatRoom")</b>
                 * Emitted by user when leaving a chat room.
                 * @apiExample Example output
                    {
                        "chatRoomId":string,
                        "userId":string,
                        "userName":string
                    }
                */
                socket.on('leaveChatRoom', (data) => {
                    eventEmitter.emit('leaveChatRoom', data)
                    /**
                    * @apiGroup Listen
                    * @apiVersion 1.0.0
                    * @api {listen} chatRoomMemberLeft Removing user from current room                      
                    * @apiDescription <b>("chatRoomMemberLeft")</b>
                    * Listened by client to update/refresh member list in real-time.
                    * @apiExample Example output
                        {                         
                             "userId": string,                         
                             "chatRoomId" : string                             
                         }
                     */
                    io.sockets.in(socket.room).emit('chatRoomMemberLeft', data)
                })


                /**
                * @apiGroup Emit
                * @apiVersion 1.0.0 
                * @api {emit} deleteChatRoom Delete a specified chat room                
                * @apiDescription <b>("deleteChatRoom")</b>
                * Emitted to deleting a chat room. 
                * Params: <b>chatRoomId</b>                  
               */
                socket.on('deleteChatRoom', (chatRoomId) => {
                    eventEmitter.emit('deleteChatRoom', chatRoomId)
                    setTimeout(function () {
                        eventEmitter.emit('deleteChatRoomMsgs', chatRoomId)
                    }, 2000)
                    /**
                      * @apiGroup Listen 
                      * @apiVersion 1.0.0                      
                      * @api {listen} chatRoomDeletedGlobal Notifying/Updating main room of deletion                      
                      * @apiDescription <b>("chatRoomDeletedGlobal")</b>
                      * Listened in main Room ('chatRoomGlobal') to notify that a chat room has been deleted.
                      * Example output <b> chatRoomId </b> 
                     */
                    io.sockets.in('chatRoomGlobal').emit('chatRoomDeletedGlobal', chatRoomId)


                    /**
                    * @apiGroup Listen 
                    * @apiVersion 1.0.0 
                    * @api {listen} redirOnDelete Redirecting to main room after a chat room is delete                    
                    * @apiDescription <b>("redirOnDelete")</b> 
                    * Listened by the current room to redirect all users to main Room.
                    * Example output <b> Chat room deleted. </b> 
                    */
                    io.sockets.in(chatRoomId).emit('redirOnDelete', 'Chat Room deleted.')
                })


                /**                
                * @apiGroup Emit
                * @apiVersion 1.0.0
                * @api {emit} chatRoomMsg Send messages in a chat room                 
                * @apiDescription <b>("chatRoomMsg")</b>
                * Emitted for sending messages.
                * @apiExample Example output                   
                       {
                           "senderName": string,
                           "senderId": string,
                           "message": string,
                           "chatRoomId" : string,
                           "createdOn": date
                       }                   
               */
                socket.on('chatRoomMsg', (data) => {
                    data['chatId'] = shortid.generate()
                    setTimeout(function () {
                        eventEmitter.emit('saveChatRoomMsgs', data)
                    }, 2000)

                    /**
                     * @apiGroup Listen
                     * @apiVersion 1.0.0
                     * @api {listen} messageReceivedInChatRoom - Receiving message by other users in the chatroom                         
                     * @apiDescription <b>("messageReceivedInChatRoom")</b>
                     * Listened by every member of a chat room to receive the broadcasted message
                     * @apiExample Example output
                           {
                               "senderName": string,
                               "senderId": string,
                               "message": string,
                               "chatRoomId" : string,
                               "createdOn":date
                            }
                       */
                    socket.to(data.chatRoomId).broadcast.emit('messageReceivedInChatRoom', data)
                })
            })
        })


        // ---------------------------- Disconnect event ------------------------------------------       
        socket.on('disconnect', () => {
            if (socket.room == 'chatRoomGlobal') {
                let onlineMessage = socket.userName + ' went offline'                
                io.sockets.in(socket.room).emit('notification', onlineMessage)
            }
            if (socket.userId) {
                redisLib.deleteUserFromHash('onlineUsers', socket.userId)
                redisLib.getAllUsersInAHash('onlineUsers', (err, result) => {
                    if (err) {
                        console.log(err)
                    } else {
                        //update online users list after removing offline user from hash
                        io.sockets.emit('online-user-list', result)
                        socket.leave(socket.room)
                    }
                })
            }
        })
    })
    //------------------------------- XXXX ----------------------------------------------------


    //--------------------------- DB events -----------------------------------------
    eventEmitter.on('saveRoomDb', (data) => {
        let newChatRoom = new ChatRoomModel({
            chatRoomId: data.chatRoomId,
            chatRoomName: data.chatRoomName,
            ownerId: data.ownerId,
            ownerName: data.ownerName,
            chatRoomMembers: [{ userId: data.ownerId, userName: data.ownerName }]
        });

        newChatRoom.save((err, result) => {
            if (err) {
                console.log(`Error: ${err}`);
            }
            else if (result == undefined || result == null || result == "") {
                console.log("Error in saving chat room.");
            }
            else {
                console.log("Chat Room Saved.");
                /**
                 * @apiGroup Listen 
                 * @apiVersion 1.0.0                 
                 * @api {listen} ownerId Redirect to chat room created                 
                 * @apiDescription <b>("userId")</b>
                 * Redirect the owner to his room. 
                 * @apiExample Example output
                    {
                            "chatRoomId": string,
                            "chatRoomName" : string,                            
                            "ownerId" : string,
                            "ownerName" : string,
                            "chatRoomMembers" : [{userId:string,userName:string}]                        
                    }
                */
                myIo.emit(result.ownerId, result)


                /**                                  
                 * @apiGroup Listen 
                 * @apiVersion 1.0.0
                 * @api {listen} chatRoomCreatedGlobal Update/notify main Room of new chat room creation                 
                 * @apiDescription <b>("chatRoomCreatedGlobal")</b>                 
                 * @apiExample Example output
                    {
                            "chatRoomName" : string,                            
                            "ownerId" : string,
                            "ownerName" : string,+
                            "chatRoomMembers" : [{userId:string,userName:string}]                        
                    }
                */
                io.sockets.in('chatRoomGlobal').emit('chatRoomCreatedGlobal', result)
            }
        });
    })


    eventEmitter.on('editChatRoomDb', (data) => {
        let findQuery = {
            chatRoomId: data.chatRoomId
        }
        let updateQuery = {
            chatRoomName: data.chatRoomName
        }

        ChatRoomModel.findOneAndUpdate(findQuery, updateQuery, { new: true }, (err, result) => {
            if (err) {
                console.log(`Error: ${err}`);
            }
            else if (result == undefined || result == null || result == "") {
                console.log("Chat room not found.");
            }
            else {
                console.log("Chat room updated.");

                /**
                 * @apiGroup Listen 
                 * @apiVersion 1.0.0                 
                 * @api {listen} chatRoomEdited Notify of chat room updation.                 
                 * @apiDescription <b>("chatRoomEdited")</b>
                 * Notify all the users of the given chat room of the changes in real-time.
                 * @apiExample Example output
                    {
                            "chatRoomId":string,
                            "chatRoomName" : string,                            
                            "ownerId" : string,
                            "ownerName" : string                        
                    }
                */
                io.sockets.in(data.chatRoomId).emit('chatRoomEdited', result)


                /**
                 * @apiGroup Listen 
                 * @apiVersion 1.0.0
                 * @api {listen} chatRoomEditedGlobal Notify of chat room updation in main room.                 
                 * @apiDescription <b>("chatRoomEdited")</b>
                 * Notify all the users of the main room of the changes in real-time.
                 * @apiExample Example output
                    {
                            "chatRoomId":string,
                            "chatRoomName" : string,                            
                            "ownerId" : string,
                            "ownerName" : string                        
                    }
                */
                io.sockets.in('chatRoomGlobal').emit('chatRoomEditedGlobal', result)
            }
        })
    }) //editChatRoomDb end


    //Update chat room status as active or closed
    eventEmitter.on('chatRoomStatus', (data) => {
        let findQuery = {
            chatRoomId: data.chatRoomId
        }
        let updateQuery = {
            chatRoomStatus: data.chatRoomStatus,
        }

        ChatRoomModel.findOneAndUpdate(findQuery, updateQuery, { new: true }, (err, result) => {
            if (err) {
                console.log(`Error: ${err}`);
            }
            else if (result == undefined || result == null || result == "") {
                console.log("chat Room not found.");
            }
            else {
                console.log("chat Room status updated.");
                io.sockets.in('chatRoomGlobal').emit('chatRoomEditedGlobal', result)
            }
        });
    }) //chatRoomStatus end





    eventEmitter.on('addChatRoomMember', (data) => {
        let findQuery = {
            chatRoomId: data.chatRoomId
        }
        let updateQuery = {
            /*      https://docs.mongodb.com/manual/reference/operator/update/addToSet/#up._S_addToSet
                   $addToSet: adds only unique records in array to avoid duplicates ie
                   adds a value to an array unless the value is already present else does nothing
               $addToSet vs $push
                   $addToSet: do not add the item to the given field if it already contains it 
                   $push: add the given object to field whether it exists or not. */
            $addToSet: {
                chatRoomMembers: {
                    userId: data.userId,
                    userName: data.userName
                }
            }
        }

        ChatRoomModel.findOneAndUpdate(findQuery, updateQuery, { new: true }, (err, result) => {
            if (err) {
                console.log(`Error: ${err}`)
            }
            else if (result == undefined || result == null || result == "") {
                console.log("Chat room not found")
            }
            else {
                console.log("Chat room updated.");
                io.sockets.in('chatRoomGlobal').emit('chatRoomEditedGlobal', result)
            }
        })
    }) //addChatRoomMember end


    eventEmitter.on('leaveChatRoom', (data) => {
        let findQuery = {
            chatRoomId: data.chatRoomId
        }
        let updateQuery = {
            $pull: {
                chatRoomMembers: {
                    userId: data.userId,
                    userName: data.userName
                }
            }
        }
        ChatRoomModel.findOneAndUpdate(findQuery, updateQuery, { new: true }, (err, result) => {
            if (err) {
                console.log(`Error: ${err.message}`);
            }
            else if (result == undefined || result == null || result == "") {
                console.log("Chat Room not found!");
            }
            else {
                console.log("A user left chat room.");

                /**                
                * @apiGroup Listen 
                * @apiVersion 1.0.0
                * @api {listen} chatRoomMemberLeftGlobal Updating main Room('chatRoomGlobal') after leaving a chat room
                * @apiDescription <b>("chatRoomMemberLeftGlobal")</b>
                * Listened in the main Room to reflect changes to all the users in main room in real-time.
                * @apiExample Example output
                    {
                           "chatRoomId":string,
                           "userId":string,
                           "userName":string
                   }
               */
                io.sockets.in('chatRoomGlobal').emit('chatRoomMemberLeftGlobal', result)
            }
        })
    }) //leaveChatRoom end


    eventEmitter.on('deleteChatRoom', (chatRoomId) => {
        ChatRoomModel.remove({ chatRoomId: chatRoomId }, (err, result) => {
            if (err) {
                console.log(`Error: ${err}`);
            }
            else if (result == undefined || result == null || result == "") {
                console.log("Chat room not found.");
            }
            else {
                console.log("Chat room deleted.");
            }
        });
    }) //deleteChatRoom end

} //setServer end


eventEmitter.on('saveChatRoomMsgs', (data) => {

    let newChat = new ChatModel({
        chatId: data.chatId,
        senderName: data.senderName,
        senderId: data.senderId,
        message: data.message,
        chatRoomId: data.chatRoomId,
        createdOn: data.createdOn
    });

    newChat.save((err, result) => {
        if (err) {
            console.log(`Error: ${err}`);
        }
        else if (result == undefined || result == null || result == "") {
            console.log("No chat found.");
        }
        else {
            console.log("Chat Saved.");
        }
    });

})


/** 
* @apiGroup Emit 
* @apiVersion 1.0.0
* @api {emit} deleteChatRoomMsgs Delete chat messages
* @apiDescription <b>("deleteChatRoomMsgs")</b>
* Delete chat messages of a chat room after it is deleted.
* Params: <b>chatRoomId</b>
*/
eventEmitter.on('deleteChatRoomMsgs', (chatRoomId) => {
    ChatModel.deleteMany({ chatRoomId: chatRoomId }, (err, result) => {
        if (err) {
            console.log(`Error: ${err}`);
        }
        else if (result == undefined || result == null || result == "") {
            console.log("No chat found.");
        }
        else {
            console.log("Chat messages deleted.");
        }
    });
})


module.exports = {
    setServer: setServer
}