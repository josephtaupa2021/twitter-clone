const sequelize = require('../db.js')
const { Router } = require('express')
const router = Router()
const { v4: uuidv4 } = require('uuid');
const { User, Tweet } = require('../models/User')
const jwt = require('jsonwebtoken');
if (typeof localStorage === "undefined" || localStorage === null) {
    var LocalStorage = require('node-localstorage').LocalStorage;
    localStorage = new LocalStorage('./scratch');
}

// Page routes
router.get('/', function (req, res) { res.render('pages/index.ejs') })
router.get('/createUserPage', function (req, res) { res.render('partials/createUser.ejs') })
router.get('/loginpage', function (req, res) { res.render('pages/login.ejs') })
router.get('/main/profile/:user', middleware, async function (req, res) {

    let tweets = await Tweet.findAll({ include: User })     // data source 1
    let data = { tweets }

    const getToken = localStorage.getItem('ACCESS_TOKEN');  // data source 2
    let DECODED_TOKEN = jwt.decode(getToken)
    let user = { user: DECODED_TOKEN.user.username }

    let allData = Object.assign(data, user)                 // merge using Object.assign
    res.render('pages/main.ejs', allData)
})

// Action routes
router.post('/createUser', async function (req, res) {
    let { username, password } = req.body;

    try {
        let user = await User.create({
            username, password
        })
        console.log(user.toJSON())
        res.status(201).redirect('/loginpage')

    } catch (error) {
        console.log(error.message)
        let data = {
            error: error.message
        };
        res.render('pages/error_signup-page.ejs', data)
    }
})

function middleware(req, res, next) {

    const getToken = localStorage.getItem('ACCESS_TOKEN');
    try {
        jwt.verify(getToken, 'secretkey');
    } catch (error) {
        return res.status(403).redirect('/loginpage')
    }
    next()
}

router.post('/login', async function (req, res) {
    let { username, password } = req.body

    try {
        let user = await User.findOne({ where: { username, password } })
        if (user !== undefined && password === user.password) {

            let ACCESS_TOKEN = jwt.sign({ user }, 'secretkey');
            localStorage.setItem('ACCESS_TOKEN', ACCESS_TOKEN);
            console.log('ACCESS TOKEN', ACCESS_TOKEN)
            let DECODED_TOKEN = jwt.decode(ACCESS_TOKEN)
            console.log('DECODED TOKEN', DECODED_TOKEN)

            res.redirect(`/main/profile/${DECODED_TOKEN.user.username}`)

        } else {
            res.render('pages/error_login-page.ejs')
        }
    } catch (error) {
        console.log(error)
        let data = { error: error };
        res.render('pages/error_login-page.ejs', data)
    }
})

router.post('/createTweet', middleware, async function (req, res) {
    let { content } = req.body;
    const getToken = localStorage.getItem('ACCESS_TOKEN');
    let DECODED_TOKEN = jwt.decode(getToken)
    let UserId = DECODED_TOKEN.user.id;
    let creator = DECODED_TOKEN.user.username;

    let tweet = await Tweet.create({
        content,
        timeCreated: new Date(),
        creator: creator,
        UserId: UserId
    });
    console.log(tweet.toJSON());
    res.redirect(`/main/profile/${creator}`)
})

router.get('/logout', (req, res) => {
    localStorage.removeItem('ACCESS_TOKEN')
    return res.redirect('/loginpage');
})

module.exports = router