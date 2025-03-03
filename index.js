const express = require('express');
const axios = require('axios');
require("dotenv").config();
const getConductors  = require('./utils/getConductors');
const checkConcertDate  = require('./utils/checkConcertDate');
const app = express();

app.set('view engine', 'pug');
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// * Please DO NOT INCLUDE the private app access token in your repo. Don't do this practicum in your normal account.
const PRIVATE_APP_ACCESS = process.env.NENADS_PRACTICUM_PRIVATE_APP;
app.use("/conductors", getConductors);
app.use("/check-concert-date", checkConcertDate);

// TODO: ROUTE 1 - Create a new app.get route for the homepage to call your custom object data. Pass this data along to the front-end and create a new pug template in the views folder.

app.get("/", async (req, res) => {
    const url = "https://api.hubspot.com/crm/v3/objects/concerts?properties=concert_date_stamp,concert_date,concert_time,name,composer,composition,conductor_name";


    const headers = {
        Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
        "Content-Type": "application/json",
    };

    const params = {
        properties: ["concert_date_stamp", "concert_date", "concert_time", "name", "composer", "composition", "conductor_name"],
    };

    try {
        const getConcertsResponse = await axios.get(url, { headers, params });
        console.log("API Response:", JSON.stringify(getConcertsResponse.data, null, 2));
        const concertsData = getConcertsResponse.data.results;
        console.log("Data:", JSON.stringify(concertsData, null, 2));
        res.render("index", { concertsData });
    } catch (error) {
        console.error(error);
    }
});

// TODO: ROUTE 2 - Create a new app.get route for the form to create or update new custom object data. Send this data along in the next route.

app.get("/update-cobj", (req, res) => {
    try {
        res.render("updates", {
            pageTitle:
                "Update Custom Object Form | Integrating With HubSpot I Practicum",
        });
    } catch (error) {
        console.error(error);
    }
});

// TODO: ROUTE 3 - Create a new app.post route for the custom objects form to create or update your custom object data. Once executed, redirect the user to the homepage.

app.post("/update-cobj", async (req, res) => {
    const url = "https://api.hubspot.com/crm/v3/objects/concerts";

    const headers = {
        Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
        "Content-Type": "application/json",
    };
    // Get and split date and time from input
    const [concertDatePart, concertTimePart] = req.body.dateTime.split(" ");
    // Convert date US format
    const concertDateObject = new Date(concertDatePart);
    const usConcertDate = concertDateObject.toLocaleDateString("en-US", {
        month: "long",
        day: "2-digit",
        year: "numeric"
    });

    // Convert time to US format
    const [concertHour, concertMinute] = concertTimePart.split(":");
    const concertTime = new Date();
    concertTime.setHours(concertHour);
    concertTime.setMinutes(concertMinute);

    const usConcertTime = concertTime.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true
    });
    // Create UNIX Concert Date/Time Stamp
    const concertDateForUnix = new Date(concertDatePart);
    concertDateForUnix.setUTCHours(0, 0, 0, 0);
    const concertUnixTimestamp = Math.floor(concertDateForUnix.getTime() / 1000);

    const composers = Array.isArray(req.body.composer) ? req.body.composer.join("; ") : req.body.composer;
    const compositions = Array.isArray(req.body.composition) ? req.body.composition.join("; ") : req.body.composition;

    const conductorId = req.body.conductor;

    const data = {
        properties: {
            name: req.body.name,
            composer: composers,
            composition: compositions,
            concert_date: usConcertDate,
            concert_date_stamp: concertUnixTimestamp,
            concert_time: usConcertTime,
            conductor_name: req.body.conductorName,
            hubspot_owner_id: '44516880',
        },
    };

    try {
        // STEP 1: Create the Custom Object "Concert" Record
        const response = await axios.post(url, data, { headers });

        // Get the new Concert Record ID
        const concertId = response.data.id;

        // STEP 2: Associate Conductor to Concert
        if (conductorId) {
            const associationUrl = `https://api.hubapi.com/crm/v4/objects/concerts/${concertId}/associations/contacts/${conductorId}`;

            const associationData = [
                {
                    associationCategory: "USER_DEFINED",
                    associationTypeId: 19,
                },
            ];

            await axios.put(associationUrl, associationData, { headers });
        }

        res.redirect("/");

    } catch (error) {
        console.error(error);
    }
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Listening on http://localhost:${PORT}`));