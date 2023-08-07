# passport-wwpass

[Passport](https://www.passportjs.org/) strategy for authenticating with [WWPass](https://wwpass.com) using WWPass native authentication protocol.

This module lets you authenticate in [Express](https://expressjs.com/)-based applications using a WWPass key. When using it with a different package supporting [Connect](https://github.com/senchalabs/connect#readme)-style middleware, some assembly will be required.

[![npm](https://img.shields.io/npm/v/passport-wwpass.svg)](https://www.npmjs.com/package/passport-wwpass)

## Installation

```bash
npm install passport-wwpass
```

## Usage

### Configure Strategy

You need to obtain the PEM-encoded client certificate and private key pair from <https://manage.wwpass.com/> and supply it to the strategy. You also need to route two views -- one to supply the frontend javscript with a token it uses to perform the authentication, and one to receive the result.

```javascript
var WWPassStrategy = require("passport-wwpass");

var myStrategy = new WWPassStrategy({
    key: fs.readFileSync("./certificate.key"),
    crt: fs.readFileSync("./certificate.crt"),
    requirePin: true,
});

passport.use(myStrategy);

...

router.get("/login/wwpass-ticket", myStrategy.getTicketExpress);

router.get(
    "/login/wwpass",
    passport.authenticate("wwpass", {
        successRedirect: "/somewhere",
        failureRedirect: "/login",
    })
);

```

This strategy requires you to supply your client certificate and key when initializing, and since the same certificate/key pair will be required to obtain a token from WWPass, it's recommended to instantiate it through a variable, rather than with `passport.use(new ...)`. Available configuration options are:

- `crt`: String containing your PEM-encoded client certificate.
- `key`: String containing your PEM-encoded certificate key.
- `requirePin`: True if you wish to require the app to request the second authentication factor from the user, whether it's a PIN or biometrics. Defaults to false.
- `ppx`: Defaults to `wwp_`. You will not need to change this, unless you changed the `ppx` parameter passed to `wwpass-frontend`. See the documentation for `wwpass-frontend`.
- `spfeAddress`: Address of the SPFE server, can be useful for testing.
- `ca`: Root certificate used to verify the identity of the SPFE server, can be useful for testing.
- `userAgent`: User agent string when accessing the server. Defaults to `passport-wwpass` and there's generally little point in changing it.

Should you wish to embed a certificate or private key into the source code as a string literal, which is a very bad idea in most cases, be aware that `https.Agent` will not properly decode PEM-encoded certificates and keys if they contain lines that start with spaces.

Like most other Passport strategies, `passport-wwpass` supports a `verify` callback which gets the job of associating a user object with the PUID that you obtain from WWPass:

```javascript
var myStrategy = new WWPassStrategy({
  ...
},
function verify(puid, done) {
  // Do what you need to turn a PUID into a user object, then...
  done(null, user);
});

```

Using it this way is actually optional, as you can do the same in `serializeUser`:

```javascript
passport.serializeUser(function (user, done) {
    // If you didn't use the verify callback, 'user' is a string containing PUID.
    done(null, user);
});
```

### Using with frameworks other than Express

If you can't use `.getTicketExpress` due to not using Express, you will need to manually massage the output of `.getTicket` (a promise) to produce and return the JSON response the frontend will need, through whichever method is suitable in your environment:

```javascript
strategy.getTicket().then(
  ticket => {
    ... JSON.stringify(ticket)
  });
```

### Setup Frontend

You may wish to integrate [wwpass-frontend](https://github.com/wwpass/wwpass-frontend) into your build process and build it into the rest of your frontend Javascript. Otherwise, you need to install the standalone script from Releases for that package _(at the moment, there is no CDN for wwpass-frontend)_ and hook it up in this manner:

```html
<script src="wwpass-frontend.js"></script>
<script>
    WWPass.authInit({
        qrcode: document.querySelector("#qrcode"),
        passkey: document.querySelector("#button--login"),
        ticketURL: `{getTicket endpoint}`,
        callbackURL: `{authenticate endpoint}`,
    });
</script>
```

### Other reading

- [Passport: The Hidden Manual](https://github.com/jwalton/passport-api-docs) helps a lot with understanding Passport instead of blindly using recipes.
- [passport-wwpass-oidc](https://github.com/wwpass/passport-wwpass) authorizes with WWPass using OpenIDConnect protocol, which may or may not be more suitable to your needs than the native protocol.

## License

This program is licensed under the terms of [MIT License](LICENSE).

Copyright (c) 2023 WWPass Corporation.
