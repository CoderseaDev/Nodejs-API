const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const {ExtractJwt} = require('passport-jwt');

const User = require('./api/models/user');

passport.use(new JwtStrategy({

    jwtFromRequest: ExtractJwt.fromHeader('authorization'),
    secretOrKey: process.env.JWT_KEY
}, async (payload, done) => {
    try {

        // Find the user specified in token
        const user = await User.findById(payload.sub);

        // If user doesn't exists, handle it
        if (!user) {
            //  console.log(done);
            return done({
                message: "Auth failedyyyy"
            });
        }

        // Otherwise, return the user
        done(null, user);
    } catch (error) {
        console.log('catch');
        done(error, false);
    }
}));