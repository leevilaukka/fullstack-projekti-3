const router = require('express').Router();

const { Post, Comment } = require('../models');

// Create new comment 
router.post('/', (req, res) => {
    const { content, post } = req.body;
    const editCode = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    const newComment = new Comment({
        content,
        post,
        editCode
    });

    Post.findById(post)
        .then((post) => {
            if (post.locked) return res.status(400).json({
                message: 'Post is locked!'
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
});

// Get all comments
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

// Get comment by id
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

// Edit comment
router.patch("/:id", (req, res) => {
    const { id } = req.params;
    const { content, editCode } = req.body;

    if (!id) {
        res.status(400).json({
            message: 'No id provided!'
        });
    }

    if (!content) {
        res.status(400).json({
            message: 'No content provided!'
        });
    }

    if (!editCode) {
        res.status(400).json({
            message: 'No editCode provided!'
        });
    }

    Comment.findById(id)
        .select('+editCode')
        .then((comment) => {
            if (!comment) {
                res.status(404).json({
                    message: 'Comment not found!'
                });
            }

            if (comment.editCode !== editCode) {
                res.status(401).json({
                    message: 'Wrong editCode!'
                });
            }

            comment.content = content;
            comment.edited = true;

            return comment.save();
        })
});

// Add vote
router.patch('/:id/vote/:vote', async (req, res) => {
    const { id, vote } = req.params;

    const comment = await Comment.findById(id)
    const post = await Post.findById(comment.post)

    console.log(post);

    if (post.locked) return res.status(403).json({ message: 'Post is locked! Cannot vote on locked posts comments' });

    switch (vote) {
        case 'up':
            comment.votes++;
            break;
        case 'down':
            comment.votes--;
            break;
        default:
            res.status(400).json({
                message: 'Invalid vote!'
            });
    }

    try {
        comment.save().then((comment) => {
            res.json({
                message: 'Vote added!',
                vote,
                comment
            });
        });
    } catch (err) {
        res.status(500).json({
            message: 'Error editing comment!',
            error: err
        });
    }
})

// Delete comment
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    const { editCode } = req.query;

    Comment.findById(id).select("+editCode").then((comment) => {
        if (comment.editCode === editCode) {
            Comment.findByIdAndRemove(id)
                .then((comment) => {
                    Post.findByIdAndUpdate(comment.thread, { $pull: { comments: comment._id } })  // remove comment from post
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