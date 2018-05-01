var express = require('express');
var router = express.Router({ caseSensitive : true });
var bcrypt = require('bcrypt-nodejs');
var jwt = require('jsonwebtoken');
var User = require('../models/user.js');

//Token-Verification

router.post('/verify-token', function(request, response) {
    if(!request.body.token){
      return response.status(400).send("No Token Provided");
    }
    jwt.verify(request.body.token, process.env.secret , function(err, decoded) {
        if (err) {
            return response.status(400).send("Invalid Token");
        }else {
            return response.status(200).send(decoded);
        }
    })
});

//login

router.post('/login',function(req,res){
  console.log(req.body);
    if(req.body.name && req.body.password){
        console.log("/api/login");
        User.findOne({ name:req.body.name },function(err,user){
          if(err){
            console.log("Error")
            return res.status(400).send("Some Error Occured.Please Try Again");
          }
          if(!user){
            console.log("NO");
            return res.status(404).send("No User Found");
          }
          if(bcrypt.compareSync(req.body.password,user.password)){
            console.log("Pw Match");
            var token = jwt.sign({
                  data: user
            },process.env.secret,{ expiresIn: 3600 });
            return res.status(200).send(token);
          }
          console.log("Inv Pw");
          return res.status(400).send("Incorrect Password");
        })
    }
    else{
      return res.status(400).send("Invalid Credentials");
    }
})

//Register

router.post('/register',function(req,res) {
     if(req.body.name && req.body.password){
          var user = new User();
          user.name = req.body.name;
          console.time('bcryptHashing');
          user.password = bcrypt.hashSync(req.body.password,bcrypt.genSaltSync(10));
          console.timeEnd('bcryptHashing');
          console.log(user);
          user.save(function(err,document){
            if(err){
                return res.status(400).send(err);
            }
            else{
                var token = jwt.sign({
                    data: document
                  }, process.env.secret, { expiresIn: 3600 })
                  return res.status(201).send(token)
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
