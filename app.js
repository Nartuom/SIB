"use strict";
const express = require("express"),
  ejs = require("ejs"),
  fs = require("fs"),
  https = require("https"),
  app = express();
const CookieParser = require("cookie-parser");
const bodyParser = require("body-parser");

let snoowrap = require("snoowrap");
const { Submission } = require("snoowrap");

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(CookieParser());

let postObj = function (post) {
  return {
    title: post["title"],
    author: post["author"],
    url: post["url"],
    id: post["id"],
  };
};

let selectTheTheme = function (selectTheme) {
  if (selectTheme == undefined) {
    return "spaceporn";
  }
  return selectTheme;
};
//App Routes
app.get("/", function (req, res) {
  const data = [];
  let count = 1;
  let selectTheme = req.cookies.selectTheme;
  let theme = selectTheTheme(selectTheme);
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
        .getSubreddit(theme)
        .getTop({ time: "all", limit: 9 })
        .then((posts) => {
          // do something with posts from the front page
          posts.forEach(function (post) {
            data.push(postObj(post));
          });
          res.cookie("theme", theme);
          res.cookie("first", data[0].id);
          res.cookie("last", data[8].id);

          res.render("index", {
            topPosts: data,
            pageNumber: count,
            pageTheme: theme,
          });
        });
    });
});

app.get("/next-page", function (req, res) {
  const data = [];
  let theme = req.cookies.theme;
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
        .getSubreddit(theme)
        .getTop({ time: "all", after: `t3_${req.cookies.last}`, limit: 9 })
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
          res.render("index", {
            topPosts: data,
            pageNumber: count,
            pageTheme: theme,
          });
        });
    });
});

app.get("/prev-page", function (req, res) {
  const data = [];
  let theme = req.cookies.theme;

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
        .getSubreddit(theme)
        .getTop({ time: "all", before: `t3_${req.cookies.first}`, limit: 9 })
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
          res.render("index", {
            topPosts: data,
            pageNumber: count,
            pageTheme: theme,
          });
        });
    });
});

app.post("/", function (req, res) {
  res.cookie("selectTheme", req.body.selectTheme);
  res.redirect("/");
});

const url = process.env;
if (url.USERDOMAIN == "MARVIN" || url.USERDOMAIN == "EGONSPENGLER") {
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
