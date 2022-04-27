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
    editCode: {
        type: String,
        required: true,
        select: false
    }
});

module.exports = mongoose.model("Comment", CommentSchema);
