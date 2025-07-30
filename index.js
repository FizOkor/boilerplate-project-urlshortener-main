require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose')
const dns = require('dns');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser')
const ShortUrl = require('./models/shortUrl')

app.use(bodyParser.urlencoded({extended: false}))

mongoose.connect(process.env.MONGO_URI);


// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

function isValidURL(input) {
  return new Promise((resolve) => {
    let url = input.trim();

    // Add protocol if missing
    if (!/^https?:\/\//i.test(url)) {
      url = 'http://' + url;
    }

    let hostname;
    try {
      hostname = new URL(url).hostname;
    } catch (err) {
      return resolve(false);
    }

    dns.lookup(hostname, (err) => {
      if (err) {
        console.error('DNS lookup failed:', err);
        return resolve(false);
      }
      resolve(true);
    });
  });
}


app.post('/api/shorturl', async (req, res, next) => {
  const data = req.body;
  const { hostname } = new URL(data.url);
  const isValid = await isValidURL(hostname)

  if(!isValid) return res.send({error: 'invalid url'})
  
  const existing = await ShortUrl.findOne({full: data.url});

  if(existing){
    console.log('Url exists:', existing.full)

    return res.send({
      original_url: existing.full,
      short_url: existing.short
    });
  }
  
  await ShortUrl.create({full: data.url})
  const shortData = await ShortUrl.findOne({full: data.url})
  console.log(shortData)
  res.send({
    original_url: data.url,
    short_url: shortData.short
  });

});

app.get('/api/shorturl/:short_url', async (req, res) => {
  const urlData = await ShortUrl.findOne({short: req.params.short_url});
  console.log("finding short url:", req.params.short_url)

  if(urlData === null) return res.sendStatus(404)

  urlData.clicks++;
  res.redirect(urlData.full);
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
