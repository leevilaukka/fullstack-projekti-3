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
    },
    edited: {
        type: Boolean,
        default: false
    }
}, {timestamps: true})

module.exports = mongoose.model("Post", PostSchema);
