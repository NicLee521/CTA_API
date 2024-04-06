import passport from 'passport';
import {Strategy as GoogleStrategy, StrategyOptions } from 'passport-google-oauth20';
import User from '../../models/user'
import PassportUser from '../../interfaces/PassportUser';
require('dotenv').config();


let getHost = () => {
    return process.env.ORIGIN;
}

//@ts-ignore
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: `${getHost()}/oauth2/redirect/google`,
    scope: [ 'profile', 'email' ],
    passReqToCallback: true || false
} as StrategyOptions, async (req: any, accessToken: any, refreshToken: any, tokens:any, profile: any, done: Function) => {
    let passportUser : PassportUser = {
        gId: profile.id,
        email: profile.emails[0].value,
        profilePhoto: profile.photos[0].value,
    }
    console.log(req.session)
    let currentUser = await User.getUserByEmail(passportUser);
    if(!currentUser) {
        const newUser = await User.createUser(passportUser);
        return done(null, newUser)
    }
    if (currentUser.source != "google") {
        return done(null, false, {
            message: `You have previously signed up with a different signin method`,
        });
    }
    req.logger.info({typeOfLogin:'OAuth2'});
    currentUser.lastVisited = new Date();
    await currentUser.save()
    return done(null, currentUser);
}))

passport.serializeUser((user , done) => {
    //@ts-ignore
    done(null, String(user._id));
});

passport.deserializeUser(async (id: any, done) => {
    const currentUser = await User.findById(id);
    done(null, currentUser);
});
  

export default passport;