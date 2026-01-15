import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { storage } from './storage';
import { type User } from '@shared/schema';

// Configure Passport Local Strategy
export function setupAuthentication() {
  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.verifyPassword(username, password);

        if (!user) {
          return done(null, false, { message: 'Invalid username or password' });
        }

        return done(null, user);
      } catch (error) {
        return done(error);
      }
    })
  );

  // Serialize user to session
  passport.serializeUser((user: Express.User, done) => {
    done(null, (user as User).id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });
}

// Export passport instance
export { passport };
