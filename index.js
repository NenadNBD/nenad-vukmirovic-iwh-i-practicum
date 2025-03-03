const express = require('express');
const axios = require('axios');
require("dotenv").config();
const app = express();

app.set('view engine', 'pug');
app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// * Please DO NOT INCLUDE the private app access token in your repo. Don't do this practicum in your normal account.
const PRIVATE_APP_ACCESS = process.env.NENADS_PRACTICUM_PRIVATE_APP;

// TODO: ROUTE 1 - Create a new app.get route for the homepage to call your custom object data. Pass this data along to the front-end and create a new pug template in the views folder.

app.get("/", async (req, res) => {
    const url = "https://api.hubspot.com/crm/v3/objects/concerts?properties=concert_date,concert_time,name,composer,composition";


    const headers = {
        Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
        "Content-Type": "application/json",
    };

    const params = {
        properties: ["concert_date", "concert_time", "name", "composer", "composition"],
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
    const composers = Array.isArray(req.body.composer) ? req.body.composer.join("; ") : req.body.composer;
    const compositions = Array.isArray(req.body.composition) ? req.body.composition.join("; ") : req.body.composition;
    const data = {
        properties: {
            name: req.body.name,
            composer: composers,
            composition: compositions,
            concert_date: usConcertDate,
            concert_time: usConcertTime
        },
    };

    try {
        const response = await axios.post(url, data, { headers });
        console.log("API Response:", JSON.stringify(response.data, null, 2));
        res.redirect("/");
    } catch (error) {
        console.error(error);
    }
});

/** 
* * This is sample code to give you a reference for how you should structure your calls. 

* * App.get sample
app.get('/contacts', async (req, res) => {
    const contacts = 'https://api.hubspot.com/crm/v3/objects/contacts';
    const headers = {
        Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
        'Content-Type': 'application/json'
    }
    try {
        const resp = await axios.get(contacts, { headers });
        const data = resp.data.results;
        res.render('contacts', { title: 'Contacts | HubSpot APIs', data });      
    } catch (error) {
        console.error(error);
    }
});

* * App.post sample
app.post('/update', async (req, res) => {
    const update = {
        properties: {
            "favorite_book": req.body.newVal
        }
    }

    const email = req.query.email;
    const updateContact = `https://api.hubapi.com/crm/v3/objects/contacts/${email}?idProperty=email`;
    const headers = {
        Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
        'Content-Type': 'application/json'
    };

    try { 
        await axios.patch(updateContact, update, { headers } );
        res.redirect('back');
    } catch(err) {
        console.error(err);
    }

});
*/


// * Localhost
app.listen(3000, () => console.log('Listening on http://localhost:3000'));