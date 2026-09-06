const express = require('express');
const userRouter = express.Router();
const userAuth = require('../middlewares/userAuth.js');
const ConnectionRequest = require('../models/connectionRequest.js');

userRouter.get('/user/requests/received', userAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    console.log('User ID:', userId); // Log the user ID to verify it's being retrieved correctly
    const connectionRequests = await ConnectionRequest.find({
      toId: userId,
      status: 'interested',
    }).populate('fromId', [
      'firstName',
      'lastName',
      'profilePhoto',
      'bio',
      'interests',
      'city',
      'area',
      'numberOfChildren',
    ]);

    const filteredConnectionRequest = connectionRequests.map((request) => {
      return request.fromId;
    });

    // Populate the fromId field with user details
    if (connectionRequests.length === 0) {
      const error = new Error('No connection requests found');
      error.statusCode = 404;
      throw error;
    }
    res.json({
      message: 'Connection requests retrieved successfully',
      data: filteredConnectionRequest,
    });
  } catch (err) {
    console.error(err);
    res
      .status(err.statusCode || 500)
      .send('Error retrieving user connection requests: ' + err.message);
  }
});

userRouter.get('/user/connections', userAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const connections = await ConnectionRequest.find({
      status: 'accepted',
      $or: [{ fromId: userId }, { toId: userId }],
    }).populate('fromId toId', [
      'firstName',
      'lastName',
      'profilePhoto',
      'bio',
      'interests',
      'city',
      'area',
      'numberOfChildren',
    ]);
    const filteredConnections = connections.map((connection) => {
      if (userId.equals(connection.fromId._id)) {
        return connection.toId;
      } else return connection.fromId;
    });
    res.json({
      message: 'User connections retrieved successfully',
      data: filteredConnections,
    });
  } catch (err) {
    console.error(err);
    res
      .status(err.statusCode || 500)
      .send('Error retrieving user connection requests: ' + err.message);
  }
});
module.exports = { userRouter };
