const express = require('express')
const app = express()
app.use(express.urlencoded({extended:true}))
app.use(express.json())

app.set('view engine','ejs')


const samplePaymentAppRouter = require ('./routes/samplePaymentApp')

app.use('/',samplePaymentAppRouter)

app.listen(3000)

