const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
    content: {
        type: String,
        required: true
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
    },
    edited : {
        type: Boolean,
        default: false
    },
}, {timestamps: true});

module.exports = mongoose.model("Comment", CommentSchema);
