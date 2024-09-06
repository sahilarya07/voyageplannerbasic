const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/User');

router.get('/', (req, res) => {
    res.render('index');
});

router.get('/login', (req, res) => {
    res.render('login', { error_msg: null, success_msg: null });
});

router.get('/signup', (req, res) => {
    res.render('signup');
});

router.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.render('login', { error_msg: info.message, success_msg: null });
        }
        req.logIn(user, (err) => {
            if (err) {
                return next(err);
            }
            return res.redirect('/createtrip');
        });
    })(req, res, next);
});

router.post('/signup', async (req, res) => {
    const { username, password } = req.body;
    try {
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.render('login', { error_msg: 'User already exists. Please login.', success_msg: null });
        }

        const user = new User({ username, password });
        await user.save();
        res.render('login', { error_msg: null, success_msg: 'User created successfully. Please login.' });
    } catch (err) {
        res.render('signup', { error_msg: 'Error creating user. Please try again.' });
    }
});

router.get('/createtrip', ensureAuthenticated, (req, res) => {
    res.render('createtrip', { user: req.user });
});

// New POST route for generating trip details
router.post('/generate-trip', ensureAuthenticated, (req, res) => {
    const { destination, days, budget, companions } = req.body;

    const tripDetails = {
        destination,
        days,
        budget,
        companions,
    };

    res.render('trip-details', { trip: tripDetails, user: req.user });
});

router.get('/dashboard', ensureAuthenticated, (req, res) => {
    res.render('dashboard', { user: req.user });
});

router.get('/logout', (req, res) => {
    req.logout(() => {
        res.render('login', { success_msg: 'You are logged out', error_msg: null });
    });
});

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.render('login', { error_msg: 'Please log in to view that resource', success_msg: null });
}

module.exports = router;
