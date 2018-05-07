var express = require('express');
var router = express.Router({ caseSensitive : true });
var bcrypt = require('bcrypt-nodejs');
var jwt = require('jsonwebtoken');
var User = require('../models/user.js');
var Polls = require('../models/polls.js')

//Deleting Polls

router.delete('/polls/:id', function(request, response) {
    Polls.findById(request.params.id, function(err, poll) {
        if (err) {
            return response.status(400).send({
                message: 'No poll with specified id'
            })
        }
        if (poll) {
            var token = request.headers.authorization.split(' ')[1];
            jwt.verify(token , process.env.secret , function(err, decoded) {
                if (err) {
                    return response.status(401).json('Unauthorized request: invalid token')
                } else {
                    console.log(poll)
                    if (decoded.data.name === poll.owner) {
                        poll.remove(function(err) {
                            if (err) {
                                return response.status(400).send(err)
                            } else {
                                return response.status(200).send({
                                    message: 'Deleted poll'
                                })
                            }
                        })
                    } else {
                        return response.status(403).send({
                            message: 'Can only delete own polls'
                        })
                    }
                }
            })
        }
    });
});

//Get Posts By User

router.get('/user-polls/:name', function(request, response) {
    if (!request.params.name) {
        return response.status(400).send({
            message: 'No user name supplied'
        })
    } else {
        Polls.find({ owner: request.params.name }, function(err, documents) {
            if (err) {
                console.log("Here screwed");
                console.log(err);
                return response.status(400).send(err)
            } else {
                //console.log(documents);
                return response.status(200).send(documents)
            }
        })
    }
})

router.get('/polls', function(request, response) {
    Polls.find({}, function(err, polls) {
        if (err) {
            return response.status(404).send({})
        } else {
            return response.status(200).json(polls)
        }
    })
});

//POST polls

router.post('/polls',authenticate,function(req,resp){
    console.log(req.body);
    if(!req.body){
      return res.status(400).send("Invalid Data");
    }

    var poll = new Polls();
    poll.owner = req.body.owner;
    poll.name = req.body.name;
    poll.options = req.body.options;
    console.log(poll);
      poll.save(function(err, document) {
      if (err) {
          if (err.code === 11000) {
              return resp.status(400).send('No dupes!');
          }
          console.log(err);
          return resp.status(400).send(err)
      } else {
          return resp.status(201).send({
              message: 'Successfully created a poll',
              data: document
          })
      }
    })
  });

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

//Authentication middleware

function authenticate(request, response, next) {
    var header = request.headers.authorization;
    //console.log(header);
    if (header) {
        var token = header.split(' ')[1];
        //console.log(token);
        jwt.verify(token, process.env.secret, function(err, decoded) {
            if (err) {
                console.log("Invalid Token");
                return response.status(401).json('Unauthorized request: invalid token')
            }
            else {
                console.log("Continue with middleware chain");
                next();
            }
        })
    }
    else {
        return response.status(400).json('No token provided')
    }
}


module.exports = router;
