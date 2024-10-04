module.exports = {
  ensureAuthenticated: (req, res, next) => {
    if (req.session.user) {
      return next(); // Continue if authenticated
    }
    req.flash('error_msg', 'Please log in to view that resource');
    res.redirect('/login'); // Redirect to login if not authenticated
  }
};
