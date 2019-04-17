const express = require('express');
const router = express.Router();
const chatController = require("./../../app/controllers/chatController");
const appConfig = require("./../../config/appConfig")
const auth = require('./../middlewares/auth')

module.exports.setRouter = (app) => {

  let baseUrl = `${appConfig.apiVersion}/chatMessages`;

  // params: chatRoom, skip.
  app.get(`${baseUrl}/:chatRoomId`, auth.isAuthorized, chatController.getChatRoomMessages);
  /**
   * @apiGroup chat
   * @apiVersion  1.0.0
   * @api {get} /api/v1/chatMessages/:chatRoomId to get paginated chat messages of a chatRoom.
   *    
   * @apiParam {String} authToken The token for authentication.(Send authToken as query parameter, body parameter or as a header)
   * @apiParam {String} chatRoomId chatRoomId of the room passed as a route parameter
   * @apiParam {number} skip skip value for pagination. (query params) (optional)
   *
   * @apiSuccessExample {object} Success-Response:
       {
        "error": false,
        "message": "All Chat messages Listed",
        "status": 200,
        "data": [
          {
            "chatId": "IELO6EVjx",
            "chatRoomId": string,
            "createdOn": "2018-03-05T15:36:31.025Z",
            "message": "hello abcd",            
            "senderId": "-cA7DiYj5",
            "senderName": "XYZ"
          },
          {
            "chatId": "UILO6QWas",
            "chatRoomId": string,
            "createdOn": "2018-03-05T15:38:31.025Z",
            "message": "hello xyz",            
            "senderId": "-cA7DiZb7",
            "senderName": "ABC"
          },
          .........................
        ]

      }

   @apiErrorExample {json} Error-Response:
	 *
	 * {
	    "error": true,
	    "message": "Error in getting the Chat messagess",
	    "status": 500,
	    "data": null
	   }
 */ 
    
}
