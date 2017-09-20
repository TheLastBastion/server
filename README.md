Okay, here's how you get this running...

- clone this repo down
- cd into it
- `npm install` or `yarn`
- make a `/private` folder with the following files...
- make a `secret.js` file for your express server secret. export a secret string.
- make a `steamAPIKey.js` file. export your steam api key. You can get one here... https://steamcommunity.com/dev/apikey
- next you need to make a cert and key file. We can use a self-signed cert until we get something serious up and running. You can run `openssl req -x509 -newkey rsa:4096 -keyout private/key.pem -out private/cert.pem -days 365` and follow the instructions. Make sure you remember the passphrase you use. You'll need it for the next step. For now, when it says `Common Name (e.g. server FQDN or YOUR name) []:`, put `localhost` until we get this thing running somewhere else. Here is a tutorial for this step if my instructions are confusing https://aghassi.github.io/ssl-using-express-4/
- the last file you need in the `private` folder is `passphrase.js` that exports the passphrase you used in the previous step.
- once you made all of those files, run the server using `node server/index.js`

The server will start running locally. For the next few steps, use Chrome until I have more cross-browser compatibility in place.
- Go to `https://thelastbastion.github.io/www/#/auth` to see the frontend auth example. It's wired up to read from your localhost server.
- Since we are using a self-signed cert right now, you'll have to tell the browser to let you use the 'unsecure' stuff. The easiest way to do this is to open up `https://localhost:8443` in another tab, click advanced, and accept the cert.
- go back to the tlb site tab. You might want to open your dev tools network monitor up to see watch what is going on.
- click the 'login' button. This should open another window and immediately redirect to steam login.
- login to steam. This should redirect and immediately close the window that was just opened.
- At this point, you now have a session cookie saved in your browser. Click 'Get Account' on the TLB website and you should be able to get a bunch of JSON data from your steam profile.
- click the 'logout' button. This will remove the data locally and kill the session via the server. The server will tell the browser to clear the session cookie in the response.
- If you click 'Get Account' again, the network call will return a 401 because you are unauthorized and the local state will tell you that you are not logged in.
