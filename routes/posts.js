const router = require("express").Router();
const verifyToken = require("../middleware/verifyToken");
const multer = require("multer");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

const Post = require("../models/Post");

// Create new post
// router.post("/", verifyToken, async (req, res) => {
//   try {
//     // Extract the username from the token
//     const { username } = req.user;
//     console.log("Username from token:", username);

//     // Merge the request body with the username
//     const postDataWithUsername = { ...req.body, username };
//     console.log("Post data with username:", postDataWithUsername);

//     // Create a new post instance
//     const newPost = new Post(postDataWithUsername);

//     // Save the new post to the database
//     const savedPost = await newPost.save();

//     // Respond with the saved post
//     res.status(200).json(savedPost);
//   } catch (err) {
//     res.status(500).json(err);
//   }
// });

// Updated route for creating a post with an image
router.post("/", verifyToken, upload.single("photo"), async (req, res) => {
  try {
    // Process other form data
    const title = req.body.title;
    const desc = req.body.desc;

    // Process uploaded image
    const photo = req.file.path; // File path where the image is stored

    // Create a new post including the image path
    const newPost = new Post({
      title,
      desc,
      photo,
      username: req.user.username, // Assign the username from the token
    });

    // Save the post to the database
    const post = await newPost.save();

    // Respond with success message
    res.status(200).json({ message: "Post created successfully", post });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update post
router.put("/:id", verifyToken, async (req, res) => {
  try {
    // Find the post by ID
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Ensure that the authenticated user is the author of the post
    if (post.username !== req.user.username) {
      return res.status(401).json({ error: "You can only update your posts!" });
    }

    // Update the post with the data from req.body
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    // Check if the updated post is null (could not be found or updated)
    if (!updatedPost) {
      return res
        .status(404)
        .json({ error: "Post not found or could not be updated" });
    }

    // Respond with the updated post
    res.status(200).json(updatedPost);
  } catch (err) {
    // Handle any errors that occur during the update process
    console.error("Error updating post:", err);
    res.status(500).json({ error: "Failed to update post" });
  }
});

// Delete post
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Ensure that the authenticated user is the author of the post
    if (post.username !== req.user.username) {
      return res.status(401).json({ error: "You can only delete your posts!" });
    }

    // Delete the post
    await post.delete();
    // create it

    // Respond with a success message
    res.status(200).json({ message: "Post has been deleted" });
  } catch (err) {
    // If an error occurs during deletion, respond with a 500 status code and the error message
    console.error("Error deleting post:", err);
    res.status(500).json({ error: "Failed to delete post" });
  }
});

// Get one post
router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Get all posts
router.get("/", async (req, res) => {
  const { user: username, cat: catName } = req.query;
  try {
    let posts;
    if (username) {
      posts = await Post.find({ username });
    } else if (catName) {
      posts = await Post.find({ categories: { $in: [catName] } });
    } else {
      posts = await Post.find();
    }
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
