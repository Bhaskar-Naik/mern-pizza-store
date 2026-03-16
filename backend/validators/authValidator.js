// backend/validators/authValidator.js

const { body } = require('express-validator');

exports.registerValidation = [
  body('name')
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2 })
    .withMessage('Name must be at least 2 characters'),

  body('email')
    .isEmail()
    .withMessage('Please provide a valid email'),

  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),

  body('phone')
    .notEmpty()
    .withMessage('Phone number is required')
];

exports.loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email'),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

exports.forgotPasswordValidation = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
];

exports.resetPasswordValidation = [
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
];
