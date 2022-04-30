const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PostSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    comments: [
        {
            type: Schema.Types.ObjectId,
            ref: "Comment"
        }
    ],
    editCode: {
        type: String,
        required: true,
        select: false
    },
    votes: {
        type: Number,
        default: 0
    },
    locked: {
        type: Boolean,
        default: false
    }
})

module.exports = mongoose.model("Post", PostSchema);
