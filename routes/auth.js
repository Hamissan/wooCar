// routes/auth.js
const express = require('express');
const passport = require('passport');
const User = require('../models/User');
const router = express.Router();

// Register user
router.post('/register', async (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  
  try {
    const user = new User({ firstName, lastName, email, password });
    await user.save();
    req.flash('success_msg', 'You are now registered and can log in');
    res.redirect('/login');
  } catch (error) {
    req.flash('error_msg', 'Error occurred');
    res.redirect('/register');
  }
});

// Login user
router.post('/login', passport.authenticate('local', {
  successRedirect: '/add-car',
  failureRedirect: '/login',
  failureFlash: true
}));

// Logout
router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success_msg', 'You are logged out');
  res.redirect('/login');
});

module.exports = router;
