const router = require('express').Router();
const { json } = require('express/lib/response');
const { Post, Comment } = require('../models');

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

    if (!id) {
        res.status(400).json({
            message: 'No id provided!'
        });
    }

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

    if(!title || !content) {
        return res.status(400).json({
            message: 'Title and content are required!'
        });
    } 

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
 * PATCH
 */

router.patch('/:id', (req, res) => {
    const { title, content, editCode } = req.body;

    const { id } = req.params;

    Post.findById(id)
        .select('+editCode')
        .then((post) => {
            console.log(post);
            if(post.locked) return res.status(400).json({
                message: 'Post is locked! Please unlock to edit!'
            });

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

// Send vote
router.patch('/:id/vote/:vote', (req, res) => {
    const { id, vote } = req.params;

    Post.findById(id)
        .then((post) => {
            if(post.locked) return res.status(401).json({
                message: 'Post is locked! Cannot vote!'
            });

            switch (vote) {
                case 'up':
                    post.votes++;
                    break;
                case 'down':
                    post.votes--;
                    break;
                default:
                    res.status(400).json({
                        message: 'Invalid vote!'
                    });
            }

            post.save().then((post) => {
                res.json({
                    message: 'Vote added!',
                    vote,
                    post
                });
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
                        // Delete all comments associated with this post
                        Comment.deleteMany({ post: id }).then(() => {
                            res.json({
                                message: 'Post deleted!',
                                post
                            });
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

router.lock('/:id', (req, res) => {
    const { id } = req.params;

    const { editCode } = req.query;

    Post.findById(id)
        .select('+editCode')
        .then((post) => {
            console.log(post);
            if (post.editCode === editCode) {
                post.locked = true;
                post.save()
                    .then((post) => {
                        res.json({
                            message: 'Post locked!',
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
                    message: 'Error locking post!',
                    error: err
                });
            }
        });
});

router.unlock('/:id', (req, res) => {
    const { id } = req.params;

    const { editCode } = req.query;

    Post.findById(id)
        .select('+editCode')
        .then((post) => {
            console.log(post);
            
            if(!post.locked) return res.status(400).json({
                message: 'Post is not locked!'
            });

            if (post.editCode === editCode) {
                post.locked = false;
                post.save()
                    .then((post) => {
                        res.json({
                            message: 'Post unlocked!',
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
                    message: 'Error unlocking post!',
                    error: err
                });
            }
        });
});

module.exports = router;