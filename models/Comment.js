const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
    content: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    post: {
        type: Schema.Types.ObjectId,
        ref: "Post"
    },
    votes: {
        type: Number,
        default: 0
    },
    editCode: {
        type: String,
        required: true,
        select: false
    }
});

module.exports = mongoose.model("Comment", CommentSchema);
