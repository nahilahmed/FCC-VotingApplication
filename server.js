//Database
var db="mongodb://localhost:27017/votingapp";
//port
var port = 8000 || process.env.Port;

//Loading Modules
var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var dotenv = require('dotenv');

var app = express();

//Load in env variables
dotenv.config({ verbose:true });

//connect to mongodb
mongoose.connect(db,function(err){
    if(err){
      console.log(err)
    }
       console.log("Successfully Connected to :"+db);
});

//listen to mongoose events
mongoose.connection.on('conncted',function(){
    console.log("Successfuly Connected To"+db);
});
mongoose.connection.on('disconncted',function(){
    console.log("Successfuly Disconnected To"+db);
});
mongoose.connection.on('error',function(){
    console.log("Error Connecting To"+db);
});

//configure middleware

app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended:false }));
app.use('/node_modules',express.static( __dirname + '/node_modules'));
app.use(express.static( __dirname + '/public'));
app.get('*',function(req,res){
  res.sendFile(__dirname + '/public/index.html');
});

app.listen(port,function(){
      console.log('Listening On Port:'+port);
});
console.log(process.env.secret);
