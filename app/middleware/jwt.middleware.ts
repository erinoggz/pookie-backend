import passportJwt from 'passport-jwt';
import configuration from '../config/config';
import ResponseMessages from '../lib/response/response-messages';
import User from '../model/user.model';

/**
 * passport-jwt - A Passport strategy for authenticating with a JSON Web Token.
 * This module lets you authenticate endpoints using a JSON web token.
 * It is intended to be used to secure RESTful endpoints without sessions.
 */

const JwtStrategy = passportJwt.Strategy,
  ExtractJwt = passportJwt.ExtractJwt;

const opts = {
  jwtFromRequest: ExtractJwt.fromHeader(configuration.web.header_name),
  secretOrKey: configuration.web.jwt_secret,
};

export default (passport: any) => {
  passport.use(
    new JwtStrategy(opts, async (jwt_payload, done) => {
      await User.findById(jwt_payload.id)
        .then((user) => {
          if (user) return done(null, user);
          return done(null, false);
        })
        .catch((err) => {
          return done(err, false, { message: ResponseMessages.SERVER_ERROR });
        });
    })
  );
};
