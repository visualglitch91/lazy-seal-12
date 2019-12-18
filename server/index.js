require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");

const port = process.env.PORT || 3000;
const authenticityToken = process.env.INSTAGRAM_TO_TWITTER_TOKEN;

const app = express();

app.use(bodyParser.json());

app.use((req, res, next) => {
  if (authenticityToken !== req.body.token) {
    return res.sendStatus(401);
  } else {
    return next();
  }
});

app.post("/instagram-to-twitter", require("./instagram-to-twitter"));
app.post("/save-tweet", require("./save-tweet"));
app.post("/ping", require("./ping"));

app.listen(port, () => console.log("Listening on", port));
