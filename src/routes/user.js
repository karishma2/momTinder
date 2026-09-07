const express = require('express');
const userRouter = express.Router();
const userAuth = require('../middlewares/userAuth.js');
const ConnectionRequest = require('../models/connectionRequest.js');
const User = require('../models/User.js');

const USER_SAFE_DATA = [
  'firstName',
  'lastName',
  'profilePhoto',
  'bio',
  'interests',
  'city',
  'area',
  'numberOfChildren',
];

userRouter.get('/user/requests/received', userAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    console.log('User ID:', userId); // Log the user ID to verify it's being retrieved correctly
    const connectionRequests = await ConnectionRequest.find({
      toId: userId,
      status: 'interested',
    }).populate('fromId', USER_SAFE_DATA);

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
    }).populate('fromId toId', USER_SAFE_DATA);
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

userRouter.get('/feed', userAuth, async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10 } = req.query;
    const skipCount = Number((page - 1) * limit);
    const limitCount = Number(limit);
    let limitValue = limitCount > 50 ? (limitCount = 50) : limitCount;

    // const users = await User.find({
    //   _id: { $ne: userId },
    // });
    // console.log(skipCount, limit);

    const connections = await ConnectionRequest.find({
      $or: [{ fromId: userId }, { toId: userId }],
    }).select('fromId toId');

    const connectedUserIds = new Set();
    connections.forEach((connection) => {
      connectedUserIds.add(connection.fromId.toString());
      connectedUserIds.add(connection.toId.toString());
    });
    console.log('Connected User IDs:', Array.from(connectedUserIds)); // Log the connected user IDs to verify they are being retrieved correctly

    const users = await User.find({
      _id: { $ne: userId, $nin: Array.from(connectedUserIds) },
    })
      .select(USER_SAFE_DATA)
      .skip(skipCount)
      .limit(limitValue);

    res.json({
      message: 'Feed retrieved successfully',
      data: users,
    });
  } catch (err) {
    console.error(err);
    res
      .status(err.statusCode || 500)
      .send('Error retrieving feed: ' + err.message);
  }
});
module.exports = { userRouter };
