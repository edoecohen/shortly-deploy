var mongoose = require('mongoose');

// Define the connection (Development & Production)
mongoURI = process.env.MONGOLAB_URI || 'mongodb://localhost/shortlydb';
mongoose.connect(mongoURI);

// Grabs the connection object to interact with the models
var db = mongoose.connection;

// If error on the connection
db.on('error', console.error.bind(console, 'connection error:'));

// Connection estabilished with the database
db.once('open', function () {
  console.log('Mongodb connection open');
});

module.exports = db;
