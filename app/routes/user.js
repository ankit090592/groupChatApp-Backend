const express = require('express');
const router = express.Router();
const userController = require("./../../app/controllers/userController");
const appConfig = require("./../../config/appConfig")
const auth = require('./../middlewares/auth')

module.exports.setRouter = (app) => {

    let baseUrl = `${appConfig.apiVersion}/users`;

    // params: firstName, lastName, email, mobileNumber, password, apiKey.
    app.post(`${baseUrl}/signup`, userController.signUp);
    /**
     * @apiGroup users
     * @apiVersion  1.0.0
     * @api {post} /api/v1/users/signup New User SignUp.
     *     
     * @apiParam {string} firstName firstName of the user. (body params) (required)
     * @apiParam {string} lastName lastName of the user. (body params)
     * * @apiParam {string} mobileNumber mobileNumber of the user. (body params) (required)
     * * @apiParam {string} email email of the user. (body params) (required)
     * @apiParam {string} password password of the user. (body params) (required)
     * 
     * @apiSuccessExample {object} Success-Response:
         {
            "error": false,
            "message": "User Created",
            "status": 200,
            "data": {               
                "userId":string,
                "firstName": string,
                "lastName": string,                
                "email":string,
                "mobileNumber": string,
                "password": string,
                "createdOn":date
            }

        }

        @apiErrorExample {json} Error-Response:
	 *
	 * {
	    "error": true,
	    "message": "Failed to create user",
	    "status": 500,
	    "data": null
	   }
    */

    app.post(`${baseUrl}/forgotPwd`, userController.forgotPassword);
    /**
     * @apiGroup users
     * @apiVersion  1.0.0
     * @api {post} /api/v1/users/forgotPwd User Forgot Password.
     *
     * @apiParam {string} email email of the user. (body params) (required)
     * 
     * @apiSuccessExample {object} Success-Response:
         {
            "error": false,
            "message": "Email sent",
            "status": 200
        }

        @apiErrorExample {json} Error-Response:
	 *
	 * {
	    "error": true,
	    "message": "Failed To send Email",
	    "status": 500,
	    "data": null
	   }
    */


    app.post(`${baseUrl}/signin`, userController.signin);
    /**
     * @apiGroup users
     * @apiVersion  1.0.0
     * @api {post} /api/v1/users/signin api for user signin.
     *
     * @apiParam {string} email E-mail ID of the user. (body params) (required)
     * @apiParam {string} password Password of the user. (body params) (required)
     *
     * @apiSuccess {object} myResponse shows error status, message, http status code, result.
     * 
     * @apiSuccessExample {object} Success-Response:
         {
            "error": false,
            "message": "signin Successful",
            "status": 200,
            "data": {
                "authToken":string,
                "userDetails":{
                "userId":string,
                "firstName": string,
                "lastName": string,                
                "email":string,
                "mobileNumber": string,
                "createdOn":date
                }
            }

        }

        @apiErrorExample {json} Error-Response:
	 *
	 * {
	    "error": true,
	    "message": "Failed to signin",
	    "status": 500,
	    "data": null
	   }
    */


    app.post(`${baseUrl}/logout/:userId`, auth.isAuthorized, userController.logout);
    /**
    * @apiGroup users
    * @apiVersion  1.0.0
    * @api {post} /api/v1/users/logout/:userId  Logout currently logged-in user.
    *
    * @apiParam {String} authToken The token for authentication.(Send authToken as query parameter, body parameter or as a header)
    * @apiParam {string} userId userId of the user. (body Params) (required)
    * 
    * @apiSuccessExample {object} Success-Response:
        {
           "error": false,
           "message": "Logged Out Successfully",
           "status": 200,
           "data": {
               "n": 0,
               "ok": 1
           }

       }
   */


}
