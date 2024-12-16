require("dotenv").config();
const express = require("express");
const passport = require("passport");
const session = require("express-session");
const { connectDB } = require("./db");
const userModel = require("./userModel");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const path = require("path");
const app = express();

// EJS setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static("public"));

app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
        console.log(profile)
      try {
        const newUser = {
          googleId: profile.id,
          displayName: profile.displayName,
          firstName: profile.name.givenName,
          lastName: profile.name.familyName,
          email: profile.emails[0].value,
          verified: profile.emails[0].verified,
          profilePicture: profile.photos[0].value,
        };
        let user = await userModel.findOne({ googleId: profile.id });
        if (user) {
          user = await userModel.findOneAndUpdate(
            { googleId: profile.id },
            newUser,
            { new: true }
          );
        }else{
            user = await userModel.create(newUser);
        }
        return done(null, profile);
      } catch (error) {
        console.log("Error in saving user Info",error)
        return done(null, profile)
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((user, done) => done(null, user));

app.get("/", (req, res) => {
  res.render("index", { user: req.user });
});

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("/profile");
  }
);

app.get("/profile", (req, res) => {
    if (!req.isAuthenticated()) return res.redirect("/");
    res.render("profile", { user: req.user });;
});

app.get("/logout", (req, res) => {
  req.logout(() => {
    req.session.destroy((err) => {
        if (err) {
          console.error("Error destroying session:", err);
          return res.status(500).send("Error destroying session.");
        }
  
        res.clearCookie("connect.sid", {
          path: "/",
          httpOnly: true, 
        });
  
        console.log("All cookies cleared and session destroyed.");
        res.redirect("/");
      });
  });
});

const PORT = process.env.PORT || 3001;

connectDB();
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
