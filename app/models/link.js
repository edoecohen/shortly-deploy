var mongoose = require('mongoose');
var crypto = require('crypto');

// Define the schema for Links
var linkSchema = mongoose.Schema({
  url: String,
  base_url: String,
  code: String,
  title: String,
  visits: Number
});

// Save into a mongoose model
var Link = mongoose.model('Link', linkSchema);


// create a function that return a hash for the url
var createSha = function(url){
  var shasum = crypto.createHash('sha1');
  shasum.update(url);
  return shasum.digest('hex').slice(0, 5);
}

// Everytime, before save into the database, invoke the createSha function
linkSchema.pre('save', function(next){
  this.code = createSha(this.url);
  next();
});

module.exports = Link;
