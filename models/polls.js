var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var pollsSchema = new Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    name:{
        type:String,
        required:true,
        unique:true
    },
    options:[{
        name:{
          type:String,
          required:true,
          unique:true
        },
        votes:{
          type:Number,
          required:true,
          default:0
        }
    }]
})

var Model = mongoose.model('Polls',pollsSchema);
module.exports = Model;
