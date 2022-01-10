const express = require("express");
const router = express.Router();
const User = require("../models/user");

// Getting All or getting one from authId if
// authId parameter is provided in query string
router.get("/", async (req, res) => {
  try {
    const authId = req.query.authId
    let user
    if( typeof authId == "undefined" ){
      const users = await User.find();
      res.json(users);
    } else {
      user = await User.findOne({ authId: req.query.authId });
      res.json(user)
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Getting One
router.get("/:id", getUser, async (req, res) => {
  res.json(res.user);
});

// Creating One
router.post("/", async (req, res) => {
  try {
    const existingUser = await User.findOne({ authId: req.body.authId });
    if (existingUser) {
      res.status(409).json({ message: "User already exists" });
    } else {
      const user = new User({
        authId             : req.body.authId,
        following       : req.body.following,
      });
      const newUser = await user.save();
      res.status(201).json(newUser);
    }
  } catch (error) {
    res.status(400).json({ messge: error.message });
  }
});

// Updating One
router.put("/:id", getUser, async (req, res) => {
  res.user.authId = req.body.authId;
  res.user.following = req.body.following;
  try {
    const updatedUser = await res.user.save();
    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Updating one with PATCH
router.patch("/:id", getUser, async (req, res) => {
  if (req.body.authId != null) {
    res.user.authId = req.body.authId;
  }
  if (req.body.following != null) {
    res.user.following = req.body.following;
  }
  try {
    const updatedUser = await res.user.save();
    res.json(updatedUser);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Deleting One
router.delete("/:id", getUser, async (req, res) => {
  try {
    await res.user.remove();
    res.json({ message: "Deleted user" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//***********************************************************
//**********************   FOLLOWING   **********************
//***********************************************************



// GET user's followings



router.post("/:id/following", getUser, async (req, res) => {
  try {
    if (res.user.following.indexOf(req.body.followedId) === -1) {
      res.user.following.push(req.body.followedId);
      const user = await res.user.save();
      res.status(201).json({
        message: "followed added to user successfully",
        user: user,
      });
    } else {
      res.status(409).json("followed already exists for this user");
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Deleting one follower
router.delete("/:id/following", getUser, async (req, res) => {
  try {
    if (res.user.following.indexOf(req.body.followedId) !== -1) {
      res.user.following = res.user.following.filter(
        (id) => id !== req.body.followedId
      );
      const user = await res.user.save();
      res.json({ message: "followed deleted from user successfully", user });
    } else {
      res.status(404).json({ message: "followed does not exist in user" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

//***********************************************************
//**********************   MIDDLEWARE   *********************
//***********************************************************

async function getUser(req, res, next) {
  let user;
  try {
    user = await User.findById(req.params.id);
    if (user == null) {
      return res.status(404).json({ message: "Cannot find user" });
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }

  res.user = user;
  next();
}

module.exports = router;