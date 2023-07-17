import passport from 'passport';
import {Strategy as GoogleStrategy, StrategyOptions } from 'passport-google-oauth20';
import User from '../../models/user'
import PassportUser from '../../interfaces/PassportUser';
require('dotenv').config();


let getHost = () => {
    switch(process.env.NODE_ENV){
        case 'local':
            return 'http://localhost:8080'
        case 'prod':
            return 'not exist'
    }
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
        refreshToken: refreshToken,
        expiresAt: new Date((new Date()).valueOf() + tokens.expires_in)
    }
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
    currentUser.lastVisited = new Date();
    await currentUser.save()
    return done(null, {...currentUser._doc, accessToken});
}))

passport.serializeUser((user, done) => {
    //@ts-ignore
    done(null, {id: user._id, accessToken: user.accessToken});
});

passport.deserializeUser(async (user: any, done) => {
    const currentUser = await User.findOne({
        _id: user.id,
    });
    //@ts-ignore
    done(null, {...currentUser._doc, accessToken: user.accessToken});
});
  

export default passport;