const express = require('express'),
  https = require('https'),
  fs = require('fs'),
  cors = require('cors');
  passport = require('passport'),
  util = require('util'),
  session = require('express-session'),
  SteamStrategy = require('passport-steam').Strategy;

const secret = require('../private/secret');
const steamAPIKey = require('../private/steamAPIKey');

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

passport.use(new SteamStrategy({
    returnURL: 'https://localhost:8443/auth/steam/return',
    realm: 'https://localhost:8443/',
    apiKey: steamAPIKey,
  }, (identifier, profile, done) => {
    process.nextTick(() => {
      profile.identifier = identifier;
      return done(null, profile);
    });
  }
));

const app = express();

app.options('https://thelastbastion.github.io', cors());

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(session({
    secret,
    name: 'testSteamSession',
    resave: true,
    saveUninitialized: true,
  })
);
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://thelastbastion.github.io');
  res.header('Access-Control-Allow-Headers', "Origin, X-Requested-With, Content-Type, Accept");
  res.header('Access-Control-Allow-Credentials', true);
  next();
});
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + '/../../public'));


function ensureAuthenticated (req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.sendStatus(401);
}

app.get('/', (req, res) => {
  res.render('index', { user: req.user });
});

app.get('/account', ensureAuthenticated, (req, res) => {
  res.send({
    user: req.user,
  });
});

app.get('/auth/steam',
  passport.authenticate('steam', { failureRedirect: '/'}),
  (req, res) => {
    res.redirect('/');
  }
);

app.get('/auth/steam/return',
  passport.authenticate('steam', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/');
  }
);

app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      res.send(err);
      return;
    }
    req.logout();
    res.clearCookie('testSteamSession');
    res.status(200).send('Cookie deleted');
  });
});

const sslOptions = {
  key: fs.readFileSync('private/key.pem'),
  cert: fs.readFileSync('private/cert.pem'),
  passphrase: require('../private/passphrase.js'),
};

https.createServer(sslOptions, app).listen(8443)
