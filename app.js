const express = require('express');
const bodyParser = require('body-parser');
const { validateUserLogin, getFruit, searchProduct, getAddresses, insertUser, getUser, submitAddress, submitOrder, ordersList, filterProductWithQuery, getHomepageDetails, deleteRecords } = require('./mysqlConnection.js');
const fs = require('fs');
var path = require('path');
const app = express();
const PORT = 3000;
const FSQ_API_KEY = "fsq3BSXxU5+jqWj6Ygx9DrTNXs0rfhS9CqleCTZ4unHmm8o=";


app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use('/static', express.static(path.join(__dirname, 'public')))

app.get("/banner_images", (req, res) => {
	var bannerImagePath = path.join(__dirname, "public", 'Images', 'banner_image_1');
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

app.get("/fruit/:id", (req, res) => {
	getFruit(req.params["id"]).then((result) => {
		res.json(result);
	})
});

app.get("/homepage", (req, res) => {
	getHomepageDetails().then((result) => {
		res.json(result);
	}).catch((err) => res.json(err));
})

app.get("/getsearchlist", (req, res) => {
	const searchText = `%${req.query.search_text}%`;
	searchProduct(searchText).then(result => {
		res.json(result);
	})
});

app.post("/prodcts", (req, res) => {
	console.log(req.body.category, req.body.subcategory, req.body.extra_query, req.body.limit);
	filterProductWithQuery(req.body.category, req.body.subcategory, req.body.extra_query, req.body.limit).then(result => {
		res.json(result);
	}).catch(err => {
		console.log("Falied getting the products", err);
	})
})

app.get("/getuseraddresses", (req, res) => {
	getAddresses(req.query["phone_number"], req.query["id"]).then(result => {
		res.json(result);
	}).catch(() => {
		console.log("failed getting the addressess");
	})
});

app.get("/insertuser", (req, res) => {
	insertUser(req.query.email_id, req.query.name, req.query.phone_number).then(result => {
		res.json(result);
	}).catch(() => {
		console.log("Insertion failed");
		res.json({
			"errorMessage": "Insertion failed"
		});
	})
});

app.get("/finduser", (req, res) => {
	getUser(req.query.id).then(result => {
		res.json(result);
	}).catch(() => {
		res.json({
			"errorMessage": "Did not find any user"
		});
	})
});


app.post("/submitaddress", (req, res) => {
	submitAddress(req.body).then(result => {
		res.send(result);
	}).catch((err) => {
		res.send(err);
	})
});

app.delete("/delete_resource/:table/:id/:columnname", (req, res) => {
	if (!req.params.table || !req.params.id)
		res.send("Table or ID is not correct");
	else {
		deleteRecords(req.params.table, req.params.id, req.params.columnname).then(result => {
			res.send(result);
		})
	}
});

app.post("/submitorder", (req, res) => {
	submitOrder(req.body.orderData, req.body.orderItems).then(result => {
		res.send(result);
	}).catch((err) => {
		res.send(err);
	})
});

app.get("/listorders", (req, res) => {
	ordersList(req.query.phone_number).then(result => {
		res.json(result);
	}).catch(() => {
		res.json({
			"errorMessage": "Did not find any order associated to the phone number"
		});
	})
});

app.listen(process.env.port || PORT, function (err) {
	if (err) console.log(err);
	console.log("Server listening on PORT", PORT);
});