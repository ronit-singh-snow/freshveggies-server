const express = require('express');
const bodyParser = require('body-parser');
const {validateUserLogin, getFruits, getFruit, getVegetables} = require('./mysqlConnection.js');
const fs = require('fs');
var path = require('path');
const app = express();
const PORT = 3000;
const FSQ_API_KEY = "fsq3BSXxU5+jqWj6Ygx9DrTNXs0rfhS9CqleCTZ4unHmm8o=";


app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/static', express.static(path.join(__dirname, 'public')))

app.get("/banner_images", (req, res) => {
  var bannerImagePath = path.join(__dirname,  "public", 'Images', 'banner_image_1');
  fs.readFile(bannerImagePath, (err, data) => {
    if (err)
      console.log(err);
    const base64String = Buffer.from(data).toString('base64');
    let encodedString = `data:image/jpg;base64,${base64String}`;
    console.log(encodedString);
    res.json({
      image: encodedString,
      id: "banner_image_1"
    })
  })
})

app.post("/validate_login", async (req, res) => {
  const x = await validateUserLogin(req.body.userId, req.body.password);
  console.log(x);
  if (x)
    return res.send(true);
  else
    return res.send(false);
});

app.get("/fruits", (req, res) => {
  getFruits(req.query.limit).then((result) => {
    res.json(result);
  })
});

app.get("/vegetables", (req, res) => {
  console.log(req.query.limit);
  getVegetables(req.query.limit).then((result) => {
    res.json(result);
  })
});

app.get("/fruit/:id", (req, res) => {
  getFruit(req.params["id"]).then((result) => {
    res.json(result);
  })
})

app.listen(PORT, function (err) {
  if (err) console.log(err);
  console.log("Server listening on PORT", PORT);
});