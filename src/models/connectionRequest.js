const mongoose = require('mongoose');
const { Schema } = mongoose;
const User = require('./User.js');

const connectionRequestSchema = new Schema({
  fromId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  toId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'accepted', 'ignored', 'interested'],
      message: 'Invalid status value',
    },
  },
});

// Pre function of schema.Runs with every save() operation.
connectionRequestSchema.pre('save', function () {
  const connectionRequest = this;
  const selfConnectionRequest = connectionRequest.fromId.equals(
    connectionRequest.toId
  );
  if (selfConnectionRequest) {
    const error = new Error('Cannot send connection request to self');
    error.statusCode = 400;
    throw error;
  }
});

const ConnectionRequest = mongoose.model(
  'ConnectionRequest',
  connectionRequestSchema
);

module.exports = ConnectionRequest;
