const nodeMailer = require('nodemailer');
const logger = require('./../libs/loggerLib');
    let transporter = nodeMailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // true for 465, false for other ports
        requireTLS: true,
        auth: {
            user: 'anonyymass@gmail.com', // generated ethereal user
            pass: 'anon@2018' // generated ethereal password
        },

        //to avoid self signed certificate in certificate chain error
        /**
         *  If you know that the host does not have a valid certificate,
         *  you can allow it in the transport settings with tls.rejectUnauthorized option:
         */
        tls: {
            rejectUnauthorized: false
        }
    })


let mailOptions = {
    from: '',
    to: '',
    subject: '',
    text: '', // plain text body
    html: '' // html body
};


let sendEmailFunction = (sender,reciever,subject,plainText, message) => {

    mailOptions.from = sender;
    mailOptions.to = reciever;
    mailOptions.subject = subject;
    mailOptions.text = plainText;
    mailOptions.html = message;
    
    //console.log(mailOptions);

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log("Nodemailer error: ",error);
            logger.error('Failed To send e-mail', 'mailerLib: sendEmail()', 10)                    
            // let apiResponse = response.generate(true, 'Failed To send Email', 500, null)
            return false
        } else{
        console.log('Message sent: %s', info.messageId);
        // Preview only available when sending through an Ethereal account
        console.log('Preview URL: %s', nodeMailer.getTestMessageUrl(info));
        logger.info('Email sent', 'userController: sendEmail()', 10)
            return 'Email sent'
        }
    });

} //end sendEmailFunction


module.exports = {
    sendEmail: sendEmailFunction
}