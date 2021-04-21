const express = require('express')
const app = express()
const cookieParser = require("cookie-parser")
const path = require('path')
const routes = require('./routes/routes.js')
app.set('view engine', 'ejs')
app.use(cookieParser())
app.use(express.urlencoded({ extended: false }))
app.use(express.static(__dirname + '/static'))


app.use(routes)

let PORT = process.env.PORT || 8008;
app.listen(8008, console.log(`Listening at port ${PORT}`));