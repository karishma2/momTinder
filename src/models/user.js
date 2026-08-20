const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema(
  {
    // -------------------------
    // BASIC INFORMATION
    // -------------------------

    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
      minlength: [2, 'First name must contain at least 2 characters'],
      maxlength: [50, 'First name cannot exceed 50 characters'],
      validate: {
        validator: function (value) {
          return /^[a-zA-ZÀ-ÿ\s'-]+$/.test(value);
        },
        message: 'First name contains invalid characters',
      },
    },

    lastName: {
      type: String,
      trim: true,
      maxlength: [50, 'Last name cannot exceed 50 characters'],
      validate: {
        validator: function (value) {
          return !value || /^[a-zA-ZÀ-ÿ\s'-]+$/.test(value);
        },
        message: 'Last name contains invalid characters',
      },
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
      validate: {
        validator: validator.isEmail,
        message: 'Please provide a valid email address',
      },
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must contain at least 8 characters'],
      maxlength: [128, 'Password cannot exceed 128 characters'],
      select: true,
      validate: {
        validator: function (value) {
          return validator.isStrongPassword(value, {
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
          });
        },
        message: 'Password is not strong enough',
      },
    },

    phone: {
      type: String,
      trim: true,
      validate: {
        validator: function (value) {
          return !value || /^\+?[1-9]\d{7,14}$/.test(value);
        },
        message: 'Please provide a valid phone number',
      },
    },

    // -------------------------
    // PROFILE
    // -------------------------

    bio: {
      type: String,
      trim: true,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
    },

    profilePhoto: {
      type: String,
      trim: true,
      validate: {
        validator: function (value) {
          return (
            !value ||
            validator.isURL(value, {
              protocols: ['http', 'https'],
              require_protocol: true,
            })
          );
        },
        message: 'Profile photo must be a valid URL',
      },
    },

    interests: {
      type: [String],
      default: [],
      validate: {
        validator: function (arr) {
          return arr.length <= 20;
        },
        message: 'You cannot have more than 20 interests',
      },
    },

    languages: {
      type: [String],
      default: [],
      validate: {
        validator: function (arr) {
          return arr.length <= 10;
        },
        message: 'You cannot have more than 10 languages',
      },
    },

    // -------------------------
    // LOCATION
    // -------------------------

    city: {
      type: String,
      trim: true,
      maxlength: 100,
    },

    area: {
      type: String,
      trim: true,
      maxlength: 100,
    },

    // -------------------------
    // CHILDREN
    // -------------------------

    numberOfChildren: {
      type: Number,
      min: [0, 'Number of children cannot be negative'],
      max: [10, 'Invalid number of children'],
      default: 0,
    },

    childrenAgeGroups: {
      type: [String],
      enum: {
        values: ['0-1', '2-3', '4-5', '6-8', '9-12', '13+'],
        message: 'Invalid child age group',
      },
      default: [],
    },

    // -------------------------
    // MATCHING PREFERENCES
    // -------------------------

    preferredDistance: {
      type: Number,
      min: [1, 'Distance must be at least 1 km'],
      max: [100, 'Distance cannot exceed 100 km'],
      default: 10,
    },

    preferredInterests: {
      type: [String],
      default: [],
      validate: {
        validator: function (arr) {
          return arr.length <= 20;
        },
        message: 'Too many preferred interests',
      },
    },

    // -------------------------
    // ACCOUNT STATUS
    // -------------------------

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    isPhoneVerified: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    strict: 'throw',
  }
);

module.exports = mongoose.model('User', userSchema);
