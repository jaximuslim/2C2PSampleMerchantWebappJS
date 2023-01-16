const { json } = require("express")
const express  = require("express")
const router = express.Router()

const jwt = require ('jsonwebtoken')
const sdk = require('api')('@developers-2c2p-com/v4.0.2#1mld74kq6whmjv')
key = "ECC4E54DBA738857B84A7EBC6B5DC7187B8DA68750E88AB53AAA41F548D6F2D9"
merchantID = "JT01"

router
.route("/")
 .get( (req,res)=>{
    res.render("index")
}).post((req,res)=>{
    const paymentTokenRequest = {}
    //Collect data from populated form and form request with mandatory fields
    paymentTokenRequest.merchantID = merchantID
    paymentTokenRequest.invoiceNo = req.body.invoiceNo
    paymentTokenRequest.description = req.body.myDescription
    paymentTokenRequest.amount = req.body.amount
    paymentTokenRequest.currencyCode = req.body.currencyCode
    paymentTokenRequest.frontendReturnUrl = 'https://e5a0-101-100-185-34.ngrok.io/paymentResult'
    paymentTokenRequest.backendReturnUrl = 'https://e5a0-101-100-185-34.ngrok.io/paymentBackEndResponse'
    // Form JsonWebToken and send to 2C2P to retrieve response token
    paymentTokenRequestSender ={}
    paymentTokenRequestSender.payload = jwt.sign(paymentTokenRequest,key)
    //ask pyisoe to explain? or someone else
    sdk.postPayment41Paymenttoken(JSON.stringify(paymentTokenRequestSender), {accept: 'application/json'})
      .then(({data}) => {
        //check if payment token request sent is valid 
        if ("payload" in data){
            //Decode response token and redirect to 2C2P payment gateway
            paymentTokenResponseObject = jwt.verify(data.payload, key)
            res.redirect(paymentTokenResponseObject.webPaymentUrl)
        }
        else{
            //Send error message as payment token request is malformed
            res.render('errorMessage',{errorCode:data.respCode, errorDesc:data.respDesc})
        }
      })
      .catch(err => {
        console.log(err)
      });
})
router.route("/paymentResult").post((req,res)=>{
    //Get frontendURL response
    const frontEndPaymentResponse = JSON.parse((Buffer.from(req.body["paymentResponse"], 'base64').toString('ascii')));
    paymentInquiryRequest = {}
    //Populate payment inquiry request
    paymentInquiryRequest.merchantID = merchantID
    paymentInquiryRequest.invoiceNo = frontEndPaymentResponse.invoiceNo
    paymentInquiryRequest.locale = "en"
    paymentInquiryRequestPayload = jwt.sign(paymentInquiryRequest,key)
    paymentInquiryRequestSender ={}
    paymentInquiryRequestSender.payload = paymentInquiryRequestPayload
    sdk.postPayment41Paymentinquiry(JSON.stringify(paymentInquiryRequestSender),{accept: 'application/json'})
    .then(({ data }) => {
        if ("payload" in data){
            paymentInquiryResponseObject = jwt.verify(data.payload, key)
            res.send(paymentInquiryResponseObject)
        }
        else{      
            res.render('errorMessage',{errorCode:data.respCode, errorDesc:data.respDesc})
        }
    })
    .catch(err => console.error(err));
})
router.post('/paymentBackEndResponse',(req,res)=>{
    backendPaymentResponse = jwt.verify(req.body.payload,key)
    res.send(backendPaymentResponse)
})

module.exports = router

