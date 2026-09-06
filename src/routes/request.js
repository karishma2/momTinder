const ConnectionRequest = require('../models/connectionRequest.js');
const express = require('express');
const requestRouter = express.Router();
const userAuth = require('../middlewares/userAuth.js');
const User = require('../models/User.js');

requestRouter.post(
  '/request/send/:status/:toUserId',
  userAuth,
  async (req, res) => {
    try {
      const AllowedStatuses = ['ignored', 'interested'];
      const { status } = req.params;

      // validation for status
      if (!AllowedStatuses.includes(status)) {
        const error = new Error('Invalid status value');
        error.statusCode = 400;
        throw error;
      }
      const toId = req.params.toUserId;
      // validation for toUserId
      const validToUserId = await User.findById(toId);
      if (!validToUserId) {
        const error = new Error('Invalid user id to send connection request');
        error.statusCode = 400;
        throw error;
      }
      const fromId = req.user._id;
      // validation if there is duplicate connection request between the to and from user

      const existingRequest = await ConnectionRequest.findOne({
        $or: [
          { fromId, toId },
          { fromId: toId, toId: fromId },
        ],
      });
      if (existingRequest) {
        const error = new Error(
          'A connection request already exists between these users'
        );
        error.statusCode = 400;
        throw error;
      }

      const connectionRequest = new ConnectionRequest({
        fromId,
        toId,
        status,
      });
      await connectionRequest.save();
      res.status(201).json({
        message: 'Connection request sent successfully',
        data: connectionRequest,
      });
    } catch (err) {
      console.error(err);
      res
        .status(400)
        .send('Error sending connection request :-  ' + err.message);
    }
  }
);

requestRouter.post(
  '/request/review/:status/:requestId',
  userAuth,
  async (req, res) => {
    try {
      const { status, requestId } = req.params;
      const AllowedStatuses = ['accepted', 'rejected'];
      if (!AllowedStatuses.includes(status)) {
        const error = new Error('Invalid status value');
        error.statusCode = 400;
        throw error;
      }

      // check if connection request exists
      const connectionRequest = await ConnectionRequest.findOne({
        _id: requestId,
        status: 'interested',
        toId: req.user._id,
      });
      if (!connectionRequest) {
        const error = new Error('Connection request not found');
        error.statusCode = 404;
        throw error;
      } else {
        connectionRequest.status = status;
        await connectionRequest.save();
        res.status(200).json({
          message: {
            connectionRequest: 'Connection request successfully ' + status,
          },
          data: connectionRequest,
        });
      }
    } catch (err) {
      console.error(err);
      res
        .status(400)
        .send('Error reviewing connection request :-  ' + err.message);
    }
  }
);

module.exports = { requestRouter };
