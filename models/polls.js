var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var PollSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    options: [
        {
            name: {
                type: String,
                required: true
            },
            votes: {
                default: 0,
                type: Number
            }
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now()
    },
    owner: {
        type: String,
        required: true
    }
});

var Model = mongoose.model('Polls', PollSchema);

module.exports = Model;
