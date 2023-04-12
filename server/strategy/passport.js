const fs = require('fs');
const User = require('../models/user-model.js');
const JWTStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

const PUB_KEY = fs.readFileSync('./keypair/id_rsa_pub.pem', 'utf8');
// TODO
const options = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: PUB_KEY,
  algorithms: ['RS256'],
};

const strategy = new JWTStrategy(options, (payload, done) =>{
  User.findOne({_id: payload.sub})
      .then((user)=>{
        if (user) {
          return done(null, user);
        } else {
          return done(null, false);
        }
      })
      .catch((err) =>(err, null));
});

module.exports = (passport) => {
  passport.use(strategy);
};