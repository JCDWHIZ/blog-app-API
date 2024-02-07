const router = require("express").Router();
const User = require("../models/User");
const Post = require("../models/Post");

// Update user
router.put("/:id", async (req, res) => {
  try {
    // Validate request data here (e.g., req.body.userId === req.params.id)
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.status(200).json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete user
router.delete("/:id", async (req, res) => {
  try {
    // Validate request data here (e.g., req.body.userId === req.params.id)
    await Post.deleteMany({ username: req.body.username });
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "User has been deleted" });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get one user
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const { password, ...info } = user._doc;
    res.status(200).json(info);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
