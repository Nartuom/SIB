"use strict";
const express = require("express"),
  ejs = require("ejs"),
  fs = require("fs"),
  https = require("https"),
  app = express();
const CookieParser = require('cookie-parser')
  

let snoowrap = require("snoowrap");
const { Submission } = require("snoowrap");

app.set("view engine", "ejs"); 
app.use(express.static("public"));
app.use(CookieParser());

let postObj = function (post) {
  return {
    title: post["title"],
    author: post["author"],
    url: post["url"],
    id: post["id"],
  };
};
//App Routes
app.get("/", function (req, res) {
  const data = [];
  let count = 1;
  res.cookie("pageNumber", count);
  snoowrap
    .fromApplicationOnlyAuth({
      userAgent: "tomblScrape",
      clientId: process.env.CLIENT_ID,
      deviceId: process.env.DEVICE_ID,
      clientSecret: process.env.CLIENT_SECRET,
      refreshToken: process.env.REFRESH_TOKEN,
      accessToken: process.env.ACCESS_TOKEN,
    })
    .then((r) => {
              
        return r
        .getSubreddit("spaceporn")
        .getTop({ time: "week", limit: 9 })
        .then((posts) => {
          // do something with posts from the front page
          posts.forEach(function (post) {
            data.push(postObj(post));
          });
          res.cookie("first", data[0].id);
          res.cookie("last", data[8].id);
          console.log("Cookies: ", req.cookies)
          res.render("index", {topPosts: data, pageNumber: count});
        })
    })
});

app.get("/next-page", function (req, res) {
  const data = [];
  snoowrap
    .fromApplicationOnlyAuth({
      userAgent: "tomblScrape",
      clientId: process.env.CLIENT_ID,
      deviceId: process.env.DEVICE_ID,
      clientSecret: process.env.CLIENT_SECRET,
      refreshToken: process.env.REFRESH_TOKEN,
      accessToken: process.env.ACCESS_TOKEN,
    })
    .then((r) => {
      // Now we have a requester that can access reddit through a "user-less" Auth token
      return r
        .getSubreddit("spaceporn")
        .getTop({ time: "week", after: `t3_${req.cookies.last}`, limit: 9 })
        .then((posts) => {
          // do something with posts from the front page
          posts.forEach(function (post) {
            data.push(postObj(post));
          });
          let count = req.cookies.pageNumber;
          count++;
          res.cookie("pageNumber", count);
          res.cookie("first", data[0].id);
          res.cookie("last", data[8].id);
          console.log("Cookies: ", req.cookies)
          res.render("index", { topPosts: data, pageNumber: count});
        });
    })
});

app.get("/prev-page", function(req, res){
  const data = [];

  snoowrap
    .fromApplicationOnlyAuth({
      userAgent: "tomblScrape",
      clientId: process.env.CLIENT_ID,
      deviceId: process.env.DEVICE_ID,
      clientSecret: process.env.CLIENT_SECRET,
      refreshToken: process.env.REFRESH_TOKEN,
      accessToken: process.env.ACCESS_TOKEN,
    })
    .then((r) => {
      return r
          .getSubreddit("spaceporn")
          .getTop({ time: "week", before: `t3_${req.cookies.first}`,  limit: 9 })
          .then((posts) => {
            // do something with posts from the front page
            posts.forEach(function (post) {
              data.push(postObj(post));
            });
            let count = req.cookies.pageNumber;
            count--;
            res.cookie("pageNumber", count);
            res.cookie("first", data[0].id);
            res.cookie("last", data[8].id);
            console.log("Cookies: ", req.cookies)
            res.render("index", {topPosts: data, pageNumber: count});
          })
    })
});

const url = process.env;
if (url.USERDOMAIN == "MARVIN"  || url.USERDOMAIN == "EGONSPENGLER") {
  require("dotenv").config();
  https
    .createServer(
      {
        key: fs.readFileSync("../domain.key"),
        cert: fs.readFileSync("../rootSSL.pem"),
      },
      app
    )
    .listen(3000, function () {
      console.log("App listening on port 3000! Go to https://localhost:3000/");
    });
} else {
  app.listen(url.PORT || 3000, url.IP, function () {
    console.log("Server Live at " + process.env);
  });
}
