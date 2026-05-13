const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const User = require('../models/user');

exports.getLogin = (req, res, next) => {
    res.render('auth/login', {
        pageTitle: 'Login',
        currentPage: 'Login',
        isLoggedIn: false,
        user: {},
        oldInput: { email: '' },
        validationErrors: []
    });
};

exports.postLogin = async (req, res, next) => {
    const { email, password } = req.body;
    
    console.log('Login attempt for:', email); // Debug log

    try {
        const user = await User.findOne({ email });

        // 1. Check if user exists
        if (!user) {
            console.log('User not found');
            return res.status(422).render('auth/login', {
                pageTitle: 'Login',
                currentPage: 'Login',
                isLoggedIn: false,
                errorMessages: ['User does not exist.'],
                oldInput: { email },
                user: {}
            });
        }

        // 2. Compare Passwords
        console.log('Comparing password...');
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            console.log('Password incorrect');
            return res.status(422).render('auth/login', {
                pageTitle: 'Login',
                currentPage: 'Login',
                isLoggedIn: false,
                errorMessages: ['Invalid password.'],
                oldInput: { email },
                user: {}
            });
        }

        // 3. Success - Set session
        console.log('Login successful! Setting session...');
        req.session.isLoggedIn = true;
        req.session.user = {
            _id: user._id.toString(), // Convert to string
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
           
        };

        // 4. SAVE SESSION BEFORE REDIRECTING
        req.session.save((err) => {
            if (err) {
                console.error('Session save error:', err);
                return next(err);
            }
            console.log('Session saved. Redirecting to /');
            console.log('Session after save:', req.session); // Debug
            res.redirect("/");
        });
        
    } catch (err) {
        console.error('Login error:', err);
        next(err);
    }
};
 exports.postLogout = (req, res, next) => {
    req.session.destroy(() => {
        res.clearCookie('connect.sid');
        res.redirect("/");
    });
 };

exports.getSignup = (req, res, next) => {
    res.render('auth/signup', {
        pageTitle: 'Signup',
        currentPage: 'Signup',
        isLoggedIn: false,
        user: {},
        validationErrors: [],
        oldInput: {
            firstName: '',
            lastName: '',
            email: ''
        
        },
    });
};

exports.postSignup = [
    check('firstName')
        .notEmpty()
        .withMessage('First name is required')
        .trim()
        .isLength({ min: 2 })
        .withMessage('First name must be at least 2 characters long')
        .matches(/^[a-zA-Z]+$/)
        .withMessage('First name must contain only letters'),

    check('lastName')
        .matches(/^[a-zA-Z]*$/)
        .withMessage('Last name must contain only letters'),

    check('email')
        .isEmail()
        .withMessage('Email is not valid')
        .normalizeEmail(),

    check('password')
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long')
        .matches(/[A-Z]/)
        .withMessage('Password must contain at least one uppercase letter')
        .matches(/[a-z]/)
        .withMessage('Password must contain at least one lowercase letter')
        .matches(/[!@#$%^&*?_-]/)
        .withMessage('Password must contain at least one special character (!@#$%^&*?)')
        .trim(),

    check('confirmPassword')
        .notEmpty()
        .withMessage('Confirm Password is required')
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Passwords do not match');
            }
            return true;
        }),

   

    check('terms')
        .custom((value, { req }) => {
            if (!req.body.terms) {
                throw new Error('You must accept the terms and conditions');
            }
            return true;
        }),

    (req, res, next) => {
        const { firstName, lastName, email, password } = req.body;
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).render('auth/signup', {
                pageTitle: 'Signup',
                currentPage: 'Signup',
                isLoggedIn: false,
                user: {},
                errorMessages: errors.array().map(err => err.msg),
                oldInput: { firstName, lastName, email, password }
            });
        }
        bcrypt.hash(password, 12)
            .then(hashedPassword => {
                const user = new User({
                    firstName,
                    lastName,
                    email,
                    password: hashedPassword
                });
                return user.save();
            })
            .then(result => {
                res.redirect("/login");
            })
            .catch(err => {
                return res.status(422).render('auth/signup', {
                    pageTitle: 'Signup',
                    currentPage: 'Signup',
                    isLoggedIn: false,
                    user: {},
                    errorMessages: [err.message],
                    oldInput: { firstName, lastName, email }
                });
            });
    }
];