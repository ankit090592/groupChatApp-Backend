const mongoose = require('mongoose');
const response = require('./../libs/responseLib')
const logger = require('./../libs/loggerLib');
const check = require('../libs/checkLib')
const ChatModel = mongoose.model('Chat')


/**
 * function to retrieve chat messages of a chat room.
 * params: chatRoomId, skip.
 */
let getChatRoomMessagesFunction = (req, res) => {
  
  let validateParams = () => {
    return new Promise((resolve, reject) => {
      if (check.isEmpty(req.params.chatRoomId)) {
        logger.info('Params missing:chatRoomId ', 'getChatRoomMessagesFunction()', 11)
        let apiResponse = response.generate(true, 'parameters missing.', 401, null)
        reject(apiResponse)
      } else {
        resolve()
      }
    })
  } // end of the validateParams function.

  // function to get chats.
  let findChats = () => {
    return new Promise((resolve, reject) => {
      
      let findQuery = {
        chatRoomId: req.params.chatRoomId
      }

      ChatModel.find(findQuery)
        .select('-_id -__v ')
        .sort('-createdOn')
        .skip(parseInt(req.query.skip) || 0)
        .lean()
        .limit(10)
        .exec((err, result) => {
          if (err) {
            console.log(err)
            logger.error(err.message, 'Chat Controller: findChats', 10)
            let apiResponse = response.generate(true, `error occurred: ${err.message}`, 500, null)
            reject(apiResponse)
          } else if (check.isEmpty(result)) {
            logger.info('No Chat Found', 'Chat Controller: findChats')
            let apiResponse = response.generate(true, 'No Chat messages Found', 404, null)
            reject(apiResponse)
          } else {
            console.log('chat messages found and listed.')
            resolve(result)
          }
        })
    })
  } // end of the findChats function.

  
  validateParams()
    .then(findChats)
    .then((result) => {
      let apiResponse = response.generate(false, 'All Chat messages Listed', 200, result)
      res.send(apiResponse)
    })
    .catch((error) => {
      res.send(error)
    })
} // end of getChatRoomMessagesFunction




module.exports = {  
  getChatRoomMessages: getChatRoomMessagesFunction
  
}
