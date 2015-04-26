var request = require('request');
var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');
var util = require('../lib/utility');

var db = require('../app/config');
var User = require('../app/models/user');
var Link = require('../app/models/link');

exports.renderIndex = function(req, res) {
  res.render('index');
};

exports.signupUserForm = function(req, res) {
  res.render('signup');
};

exports.loginUserForm = function(req, res) {
  res.render('login');
};

exports.logoutUser = function(req, res) {
  req.session.destroy(function(){
    res.redirect('/login');
  });
};

// fetch all the links
exports.fetchLinks = function(req, res) {
  Link.find({}).exec(function(err,links) {
    res.send(200, links);
  })
};


// =================  REFACTOR ==============================
// Fetchs the database and checks if this url is already stored, if it is
// send the result, otherwise save it

exports.saveLink = function(req, res) {
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.send(404);
  }

  Link.findOne({ url: uri }).exec(function(err, found) {
    if (found) {
      res.send(200, found);
    } else {
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.send(404);
        }

        var newLink = new Link({
          url: uri,
          title: title,
          base_url: req.headers.origin,
          visits: 0
        });

        newLink.save(function(err, newEntry) {
          if (err) { res.send(500, err) }
          res.send(200, newEntry);
        });
      });
    }
  });
};
// =================  END  ==============================


// =================  REFACTOR ==============================
// Fetchs the database and checks if this user exists. if the user doesn't
// exists, redirect to login. If the user exist, check the password and
// and create a new session

exports.loginUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  User.findOne({ username: username }).exec(function(err, user) {
      if (err) { res.send(500, 'Failed to fetch the server') }
      if (!user) {
        res.redirect('/login');
      } else {
        user.comparePassword(password, function(match) {
          if (match) {
            util.createSession(req, res, user);
          } else {
            res.redirect('/login');
          }
        })
      }
  });
};
// =================  END  ==============================

// =================  REFACTOR ==============================
// Fetchs the database and checks if this user exists. if the user doesn't
// exists, create a new user. If the user exist, return a message "User already exist"
exports.signupUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  User.findOne({ username: username }).exec(function(err, user) {

    if (err) { res.send(500, 'Failed to fetch the database') }
    if (!user) {
      var newUser = new User({
        username: username,
        password: password
      });
      console.log(newUser);
      newUser.save(function(err, newUser) {

        if (err) { res.send(500, err) }
        util.createSession(req, res, newUser);
      });

    } else {
      console.log('Account already exists');
      res.redirect('/signup');
    }
  });
};
// =================  END  ==============================

// =================  REFACTOR ==============================
// Fetchs the database and checks if the link exist, if it doesn't,
// redirect to the home, otherwise increment visits counter of link
// and retrieve the original URL
exports.navToLink = function(req, res) {
  Link.findOne({ code: req.params[0] }).exec(function(err, link) {
    if (!link) {
      res.redirect('/');
    } else {
      link.visits++;
      link.save(function(err, link) {
        res.redirect(link.url);
        return;
      });
    }
  });
};
// =================  END  ==============================
