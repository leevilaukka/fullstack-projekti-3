const router = require('express').Router();

const Post = require('../models/Post');
const Comment = require('../models/Comment');

router.get("/", (req, res) => {
    Comment.find()
        .then((comments) => {
            res.json({
                message: 'All comments',
                comments
            });
        })
        .catch((err) => {
            res.status(500).json({
                message: 'Error getting comments!',
                error: err
            });
        });
});

router.get("/:id", (req, res) => {
    const { id } = req.params;

    Comment.findById(id)
        .populate('post')
        .then((comment) => {
            res.json({
                message: 'Comment found!',
                comment
            });
        })
        .catch((err) => {
            res.status(500).json({
                message: 'Error getting comment!',
                error: err
            });
        });
});


router.post('/', (req, res) => {
    const { content, post } = req.body;
    const editCode = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    const newComment = new Comment({
        content,
        post,
        editCode
    });

    newComment.save()
        .then((comment) => {
            Post.findByIdAndUpdate(post, { $push: { comments: comment._id } })
                .then((post) => {
                    res.status(201).json({
                        message: 'Comment created!',
                        comment,
                        post
                    });
                })
                .catch((err) => {
                    res.status(500).json({
                        message: 'Error creating comment!',
                        error: err
                    });
                });
        })
});



router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const { editCode } = req.query;

    Comment.findById(id).select("+editCode").then((comment) => {
        if (comment.editCode === editCode) {
            Comment.findByIdAndRemove(id)
                .then((comment) => {
                    Post.findByIdAndUpdate(comment.thread, { $pull: { comments: comment._id } })  // remove comment from thread
                        .then((thread) => {
                            res.json({
                                message: 'Comment deleted!',
                                comment,
                                thread
                            });
                        })
                });
        } else if (comment.editCode !== editCode) {
            res.status(401).json({
                message: 'Unauthorized!',
            });
        }
    }).catch((err) => {
        res.status(500).json({
            message: 'Error deleting comment!',
            error: err
        });
    });
});

module.exports = router;