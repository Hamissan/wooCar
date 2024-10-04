const express = require('express');
const router = express.Router();
const Car = require('../models/Car');
const User = require('../models/User');
const bcrypt = require('bcrypt');
const { ensureAuthenticated } = require('../middleware/auth');

// GET: Home Page
router.get('/', (req, res) => {
    res.render('index');
});

// GET: Add a new car (form)
router.get('/add-car', ensureAuthenticated, (req, res) => {
    res.render('addCar', { user: req.session.user });  // Pass the user info to the view
});

// POST: Add a new car
router.post('/add-car', ensureAuthenticated, async (req, res) => {
    try {
        const registrationNumber = req.body.registrationNumber.trim().toUpperCase();
        const car = new Car({
            make: req.body.make,
            model: req.body.model,
            year: req.body.year,
            owner: req.session.user.firstName + ' ' + req.session.user.lastName, // Auto-fill owner from session
            registrationNumber: registrationNumber
        });

        // Check for existing registration number
        const existingCar = await Car.findOne({ registrationNumber });
        if (existingCar) {
            req.flash('error_msg', 'Registration number already exists');
            return res.redirect('/add-car');
        }

        // Save new car if no duplicates
        await car.save();
        req.flash('success_msg', 'Car registered successfully');
        res.redirect('/list-cars');
    } catch (error) {
        console.error(error);
        req.flash('error_msg', 'Internal Server Error');
        res.status(500).redirect('/add-car');
    }
});

router.get('/list-cars', async (req, res) => {
  try {
    const cars = await Car.find({});
    res.render('listCars', { cars: cars });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching cars.');
  }
});



// Serve the registration form
router.get('/register', (req, res) => {
    res.render('register');
});

// Registration Route
router.post('/register', async (req, res) => {
  const { firstName, secondName, lastName, email, password, username } = req.body;
  try {
    // Check if the username already exists
    const existingUser = await User.findOne({ username: username });
    if (existingUser) {
      req.flash('error_msg', 'Username already exists. Please choose a different one.');
      return res.redirect('/register');
    }

    // Check if the email already exists
    const existingEmail = await User.findOne({ email: email });
    if (existingEmail) {
      req.flash('error_msg', 'Email already exists. Please use a different one.');
      return res.redirect('/register');
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create a new user
    const newUser = new User({
      firstName,
      secondName,
      lastName,
      email,
      password: hashedPassword,
      username
    });
    
    await newUser.save();
    req.flash('success_msg', 'You are now registered and can log in');
    
    // Redirect to the dashboard
    res.redirect('/dashboard');
  } catch (error) {
    req.flash('error_msg', 'Error registering user');
    res.redirect('/register');
  }
});


// Route to display the login page
router.get('/login', (req, res) => {
    res.render('login');
});

// Login Route
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user) {
        req.flash('error_msg', 'Invalid email or password');
        return res.redirect('/login');
      }
  
      // Compare passwords
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        req.flash('error_msg', 'Invalid email or password');
        return res.redirect('/login');
      }
  
      // Set session data
      req.session.user = user; // Store user info in session
      req.flash('success_msg', 'You are logged in');
      
      // Redirect to the dashboard after successful login
      res.redirect('/dashboard'); // Change this line to redirect to your dashboard
    } catch (error) {
      req.flash('error_msg', 'Login error');
      res.redirect('/login');
    }
  });
  
// Route to display the dashboard
router.get('/dashboard', ensureAuthenticated, (req, res) => {
    res.render('dashboard', { user: req.session.user, messages: req.flash() });
});

// Handle logout
router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.log(err);
            return res.redirect('/dashboard');
        }
        res.redirect('/');
    });
});

module.exports = router;
