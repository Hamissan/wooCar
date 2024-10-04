const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');

const app = express();
const carRoutes = require('./routes/carRoutes.js');

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));

// Configure express-session
app.use(session({
    secret: 'yourSecretKey', // Replace with a strong secret key
    resave: false,
    saveUninitialized: false
}));
// Initialize Passport and use session
app.use(passport.initialize());
app.use(passport.session());
// Initialize flash messages
app.use(flash());

app.use(function(req, res, next) {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  next();
});


app.set('view engine', 'ejs');

// Static files
app.use(express.static('public'));

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/woo-car-registration', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log(err));

// Routes
app.use(carRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
