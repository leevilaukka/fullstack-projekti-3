const router = require('express').Router();
const Post = require('../models/Post');


/**
 * GET
 */

// Get all posts localhost:3000/posts
router.get("/", (req, res) => {
    Post.find()
        .then((posts) => {
            res.json({
                message: 'All posts',
                length: posts.length,
                posts
            });
        })
        .catch((err) => {
            res.status(500).json({
                message: 'Error getting posts!',
                error: err
            });
        });
});

// Get post by id
router.get("/:id", (req, res) => {
    const { id } = req.params;

    Post.findById(id)
        .populate('comments')
        .then((thread) => {
            res.json({
                message: 'Post found!',
                thread
            });
        })
        .catch((err) => {
            if (err.kind === 'ObjectId') {
                res.status(404).json({
                    message: 'Post not found!',
                    error: err
                });
            } else {
                res.status(500).json({
                    message: 'Error getting Post!',
                    error: err
                });
            }
        });
});

/**
 * POST
 */

router.post('/', (req, res) => {
    const { title, content } = req.body;

    const editCode = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    const newPost = new Post({
        title,
        content,
        editCode
    });

    newPost.save()
        .then((post) => {
            console.log(post);
            res.status(201).json({
                message: 'Post created!',
                post: post
            });
        })
        .catch((err) => {
            res.status(500).json({
                message: 'Error creating Post!',
                error: err
            });
        });
});

/**
 * PUT
 */

router.put('/:id', (req, res) => {
    const { title, content, editCode } = req.body;

    const { id } = req.params;

    Post.findById(id)
        .select('+editCode')
        .then((post) => {
            console.log(post);
            if (post.editCode === editCode) {

                post.title = title;
                post.content = content;

                post.save()
                    .then((thread) => {
                        res.json({
                            message: 'Post edited!',
                            thread
                        });
                    })
                    .catch((err) => {
                        res.status(500).json({
                            message: 'Error editing Post!',
                            error: err
                        });
                    });
            } else {
                res.status(401).json({
                    message: 'Unauthorized!'
                });
            }
        })
        .catch((err) => {
            if (err.kind === 'ObjectId') {
                res.status(404).json({
                    message: 'Post not found!',
                    error: err
                });
            } else {
                res.status(500).json({
                    message: 'Error editing Post!',
                    error: err
                });
            }
        }
        );
});

/**
 * DELETE
 */

router.delete('/:id', (req, res) => {
    const { id } = req.params;

    const { editCode } = req.query;

    Post.findById(id)
        .select('+editCode')
        .then((thread) => {
            console.log(thread);
            if (thread.editCode === editCode) {
                Post.findByIdAndRemove(id)
                    .then((post) => {
                        res.json({
                            message: 'Post deleted!',
                            post
                        });
                    })
            } else {
                res.status(401).json({
                    message: 'Unauthorized!'
                });
            };
        })
        .catch((err) => {
            if (err.kind === 'ObjectId') {
                res.status(404).json({
                    message: 'Post not found!',
                    error: err
                });
            } else {
                res.status(500).json({
                    message: 'Error deleting post!',
                    error: err
                });
            }
        });
});

module.exports = router;