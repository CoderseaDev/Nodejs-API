const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const {ExtractJwt} = require('passport-jwt');

const User = require('./api/models/user');

passport.use(new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromHeader('authorization'),
    secretOrKey: process.env.JWT_KEY
}, async (payload, done) => {
    try {
        console.log("tttttt");
        // Find the user specified in token
        const user = await User.findById(payload.sub);

        // If user doesn't exists, handle it
        if (!user) {
              console.log("yuyuy");
            return done({
                message: "Auth failed"
            });
        }
 console.log("acces");
        // Otherwise, return the user
        return  done(null, user);
    } catch (error) {
        console.log('catch');
        done("gggggggggggggggggggggggg", false);
    }
}));