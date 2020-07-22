const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");
const app = express();
app.use(cors({ origin: true }));
const axios = require("axios");
const forecastEndpoint =
	"https://api.weather.gov/gridpoints/AKQ/38,80/forecast";
const forecastHourlyEndpoint =
	"https://api.weather.gov/gridpoints/AKQ/38,80/forecast/hourly";
const moment = require("moment");

// setup the API to have admin privlages
// this uses the builtin FIREBASE_CONFIG environment variables and a JSON file pulled from the console
// https://firebase.google.com/docs/functions/config-env
// https://firebase.google.com/docs/admin/setup#initialize-sdk
const serviceAccount = require("./service-account/permissions.json");
const adminConfig = JSON.parse(process.env.FIREBASE_CONFIG);
adminConfig.credential = admin.credential.cert(serviceAccount);
admin.initializeApp(adminConfig);

// create reference to the database for firestore here
const db = admin.firestore();

/**
 * middleware to log requests
 * @param  {[type]}   req  request
 * @param  {[type]}   res  response
 * @param  {Function} next callback
 * @return {[type]}
 */
const requestTime = function (req, res, next) {
	req.requestTime = Date.now();
	console.log("method " + req.method + " and url " + req.url);
	console.log("request came across at " + req.requestTime);
	next();
};
app.use(requestTime);

app.get("/api/health", (req, res) => {
	res.status(200).send("app is working correctly");
});

app.post("/api/weather", async (req, res) => {
	(async () => {
		try {
			const weatherTemp = parseFloat(req.body.temp);
			const tempRounded = Math.round(weatherTemp);

			const recorded = moment().utcOffset(-240);
			const weather = {
				recorded: recorded.format("MMMM Do YYYY, h:mm:ss a"),
				temp: tempRounded,
				humidity: req.body.humidity,
			};
			await db.collection("results").doc("/0/").set(weather);
			return res.status(200).send();
		} catch (error) {
			console.log(error);
			return res.status(500).send(error);
		}
	})();
});

app.get("/api/noaa", async (req, res) => {
	(async () => {
		try {
			const forecastResponse = await axios.get(forecastEndpoint);
			const detailedForecast = forecastResponse.data.properties.periods;

			const hourlyResponse = await axios.get(forecastHourlyEndpoint);
			let hourlyForecast = {};
			hourlyForecast = hourlyResponse.data.properties.periods.filter(
				(value) => {
					if (value.number <= 12) {
						return true;
					} else {
						return false;
					}
				}
			);

			const recorded = moment().utcOffset(-240);
			const NOAA = {
				recorded: recorded.format("MMMM Do YYYY, h:mm:ss a"),
				detailed: detailedForecast,
				hourly: hourlyForecast,
			};
			await db.collection("results").doc("/1/").set(NOAA);
			return res.status(200).send();
		} catch (error) {
			console.log(error);
			return res.status(500).send(error);
		}
	})();
});

app.get("/api/results", async (req, res) => {
	(async () => {
		try {
			let query0 = db.collection("results").doc("/0");
			const query0Response = await query0.get();
			let query1 = db.collection("results").doc("/1");
			const query1Response = await query1.get();

			const weather = {
				weatherRecorded: query0Response.data().recorded,
				temp: query0Response.data().temp,
				humidity: query0Response.data().humidity,
				NOAARecorded: query1Response.data().recorded,
				hourly: query1Response.data().hourly,
				detailed: query1Response.data().detailed,
			};
			return res.status(200).send(weather);
		} catch (error) {
			console.log(error);
			return res.status(500).send(error);
		}
	})();
});

exports.app = functions.https.onRequest(app);
