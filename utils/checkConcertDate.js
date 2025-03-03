const express = require("express");
const axios = require("axios");

const PRIVATE_APP_ACCESS = process.env.NENADS_PRACTICUM_PRIVATE_APP;
const checkConcertDate = express.Router(); // Create an Express router instance

// API Route: Check if a concert exists on a given date
checkConcertDate.get("/", async (req, res) => {
    try {
        const concertDate = req.query.date; // Get Unix timestamp in seconds
        const searchUrl = "https://api.hubapi.com/crm/v3/objects/concerts/search";
        
        const headers = {
            Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
            "Content-Type": "application/json",
        };

        const searchBody = {
            filterGroups: [
                {
                    filters: [
                        {
                            propertyName: "concert_date_stamp",
                            operator: "EQ",
                            value: parseInt(concertDate)
                        }
                    ]
                }
            ],
            properties: ["name", "concert_unix_date"]
        };

        const searchResponse = await axios.post(searchUrl, searchBody, { headers });

        if (searchResponse.data.total > 0) {
            return res.json({ exists: true, concertName: searchResponse.data.results[0].properties.name });
        }

        res.json({ exists: false });
    } catch (error) {
        console.error("Error checking concert date:", error.response ? error.response.data : error);
        res.status(500).json({ error: "Failed to check concert date" });
    }
});

module.exports = checkConcertDate; // Export the router directly
