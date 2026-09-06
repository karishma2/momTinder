const express = require('express');
const profileRouter = express.Router();
const userAuth = require('../middlewares/userAuth.js');
const User = require('../models/User.js');
const { validateUpdateProfileData } = require('../utils/validation.js');

profileRouter.get('/user/profile', userAuth, async (req, res) => {
  try {
    res.send('user profile: ' + req.user);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error retrieving profile');
  }
});

profileRouter.patch('/user/updateProfile', userAuth, async (req, res) => {
  try {
    if (validateUpdateProfileData(req)) {
      const loggedInUser = req.user;
      const updatedProfile = await User.findByIdAndUpdate(
        loggedInUser._id,
        req.body,
        {
          new: true,
        }
      );
      res
        .json({
          message: 'Profile update successfully',
          data: updatedProfile,
        })
        .send('Profile updated successfully');
    } else {
      const error = new Error('Invalid edit request');
      error.statusCode = 400;
      throw error;
    }
  } catch (err) {
    console.error(err);
    res.status(400).send('Error updating profile :-  ' + err.message);
  }
});

module.exports = { profileRouter };
