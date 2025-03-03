const express = require('express');
const axios = require("axios");
const PRIVATE_APP_ACCESS = process.env.NENADS_PRACTICUM_PRIVATE_APP;
const getConductors = express.Router();

getConductors.get("/", async (req, res) => {
    const url = "https://api.hubapi.com/crm/v3/objects/contacts/search";

    const headers = {
        Authorization: `Bearer ${PRIVATE_APP_ACCESS}`,
        "Content-Type": "application/json",
    };

    const body = {
        filterGroups: [
            {
                filters: [
                    {
                        propertyName: "jobtitle",
                        operator: "EQ",
                        value: "Conductor",
                    },
                ],
            },
        ],
        properties: ["hs_object_id", "firstname", "lastname"],
        limit: 100,
    };

    try {
        const response = await axios.post(url, body, { headers });
        res.json(response.data.results);
    } catch (error) {
        console.error("Error fetching contacts:", error.response ? error.response.data : error);
        res.status(500).json({ error: "Failed to fetch conductors" });
    }
});

module.exports = getConductors;