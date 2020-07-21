'use strict';
const   express = require('express'),
        ejs     = require('ejs'),
        fs      = require('fs'),
        https   = require('https'),
        app     = express();

let snoowrap = require('snoowrap');
const { Submission } = require('snoowrap');

app.set('view engine', 'ejs');
app.use(express.static('public'));
app.get('/', function(req, res){

    const data = [];
    snoowrap.fromApplicationOnlyAuth({
        userAgent: 'tomblScrape',
        clientId: process.env.CLIENT_ID,
        deviceId: process.env.DEVICE_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
        accessToken: process.env.ACCESS_TOKEN
    }).then(r => {
        // Now we have a requester that can access reddit through a "user-less" Auth token
        return r.getSubreddit('spaceporn').getTop({ time: 'week', limit: 100}).then(posts => {
            // do something with posts from the front page
            posts.forEach(function(post){
                data.push({
                    title: post["title"],
                    author: post["author"],
                    url: post["url"]
                });
            });
            res.render('index', {topPosts: data});
            
        });
    });
    

});



const url = process.env;

if(url.USERDOMAIN == 'MARVIN'){
    require('dotenv').config();
    https.createServer({
        key: fs.readFileSync('../private-key.key'),
        cert: fs.readFileSync('../rootSSL.pem')
    }, app)
    .listen(3000, function() {
        console.log('App listening on port 3000! Go to https://localhost:3000/')
        });
    } else {
        app.listen(url.PORT||3000,
            url.IP, function() {
                console.log('Server Live at ' + url.IP);
        });
}

module.exports = app;



