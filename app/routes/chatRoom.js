const express = require('express');
const router = express.Router();

const chatRoomController = require("./../controllers/chatRoomController");
const appConfig = require("./../../config/appConfig");
const auth = require('../middlewares/auth')

module.exports.setRouter = (app) => {

    let baseUrl = `${appConfig.apiVersion}/chatRoom`;


    app.get(`${baseUrl}/getAllChatRooms`, auth.isAuthorized, chatRoomController.getAllChatRooms);
    /**
          * @apiGroup Read
          * @apiVersion  1.0.0
          * @api {get} /api/v1/chatRoom/getAllChatRooms to get all the chat rooms of the Group chat application.
          *  @apiParam {String} authToken Unique token for user authentication.(Send authToken as query parameter, body parameter or as a header)
          * @apiSuccess {object} myResponse shows error status, message, http status code, result.
          * @apiSuccessExample {object} Success-Response:
             {
                 "error": false,
                 "message": "All Chat Rooms found",
                 "status": 200,
                 "data": [
                     {
                "chatRoomId": string,
                "chatRoomName" : string,
                "ownerId": string,
                "ownerName": string
                "chatRoomStatus": boolean,
                "chatRoomMembers": [ {
                     "userId" : string,
                     "userName" : string
                    }],
                    "createdOn": "2018-08-22T07:06:57.000Z",
                     }
                 ]
             }
           *  @apiErrorExample {json} Error-Response:
           * {
                 "error": true,
                 "message": string,
                 "status": number,
                 "data": any
             }
         */


    app.get(`${baseUrl}/getSingleChatRoom/:chatRoomId`, auth.isAuthorized, chatRoomController.getSingleChatRoom);
    /**
         * @apiGroup Read
         * @apiVersion  1.0.0
         * @api {get} /api/v1/users/getSingleChatRoom/:chatRoomId To get only 1 specified chat room.
         *
         * @apiParam {String} authToken Unique token for user authentication.(Send authToken as query parameter, body parameter or as a header)
         * @apiParam {string} chatRoomId Unique ID of the group whose details will be returned. (route params) (required)
         * @apiSuccess {object} myResponse shows error status, message, http status code, result.
         * 
         * @apiSuccessExample {object} Success-Response:
            {
                 "error": false,
                 "message": "Chat Room found",
                 "status": 200,
                 "data": [
                     {
                "chatRoomId": string,
                "chatRoomName" : string,
                "ownerId": string,
                "ownerName": string
                "chatRoomStatus": boolean,
                "chatRoomMembers": [ {
                     "userId" : string,
                     "userName" : string
                    }],
                    "createdOn": "2018-08-22T07:06:57.000Z",
                     }
                 ]
             }
           *  @apiErrorExample {json} Error-Response:
           * {
                 "error": true,
                 "message": string,
                 "status": number,
                 "data": any
             }
        */


    app.get(baseUrl + '/getMyChatRooms/:userId', auth.isAuthorized, chatRoomController.getMyChatRooms)
    /**
      * @apiGroup Read
      * @apiVersion  1.0.0
      * @api {get} /api/v1/users/getMyChatRooms/:userId To get the chat rooms which the logged-in user is a member of.
      *
      * @apiParam {String} authToken Unique token for user authentication.(Send authToken as query parameter, body parameter or as a header)
      * @apiParam {string} userId Unique ID of the user whose details will be returned. (route params) (required)
      * @apiSuccess {object} myResponse shows error status, message, http status code, result.
      * 
      * @apiSuccessExample {object} Success-Response:
         {
              "error": false,
              "message": "Chat Rooms found",
              "status": 200,
              "data": [
                  {
             "chatRoomId": string,
             "chatRoomName" : string,
             "ownerId": string,
             "ownerName": string
             "chatRoomStatus": boolean,
             "chatRoomMembers": [ {
                  "userId" : string,
                  "userName" : string
                 }],
                 "createdOn": "2018-08-22T07:06:57.000Z",
                  }
              ]
          }
        *  @apiErrorExample {json} Error-Response:
        * {
              "error": true,
              "message": string,
              "status": number,
              "data": any
          }
     */


    app.post(`${baseUrl}/sendInvite/:chatRoomId`, chatRoomController.sendInvite);
    /**
        * @apiGroup Create
        * @apiVersion  1.0.0
        * @api {post} /api/v1/groupChat/sendInvite/:chatRoomId to send an invite to a user to join Chat room.
        *
        *
        * @apiParam {string} chatRoomId Unique ID of the host chat room (URL params) (required)
        * @apiParam {string}  email EmailID of the user to whom invite is to be sent. (body params) (required)
        * @apiSuccess {object} myResponse shows error status, message, http status code, result.
        * 
        * @apiSuccessExample {object} Success-Response:
            {
               "error": false,
               "message": "Invite sent Successfully",
               "status": 200,
               "data": null
   
           }
         *  @apiErrorExample {json} Error-Response:
         *
         * {
               "error": true,
               "message": string,
               "status": number,
               "data": any
           }    
       */

}