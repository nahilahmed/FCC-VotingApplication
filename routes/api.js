var express = require('express');
var router = express.Router({ caseSensitive : true });
var bcrypt = require('bcrypt-nodejs');
var jwt = require('jsonwebtoken');
var User = require('../models/user.js');

//Register

router.post('/register',function(req,res) {
     if(req.body.name && req.body.password){
          var user = new User();
          user.name = req.body.name;
          console.time('bcryptHashing');
          user.pasword = bcrypt.hashSync(req.body.password,bcrypt.genSaltSync(10));
          console.timeEnd('bcryptHashing');
          user.save(function(err,document){
            if(err){
                return res.status(400).send(err);
            }
            else{
                return res.status(201).send(document);
            }
          })
     }
     else{
            return res.status(400).send({
              message:"Invalid Credentials!"
            })
     }
});




module.exports = router;
