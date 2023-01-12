const axios = require("axios");
exports.handler = async (event, context) => {
    try {
        const { url } = JSON.parse(event.body);
        const response = await axios({
            url,
            method: "GET",
            headers: {
                "x-api-key": process.env.GOOGLE_MAPS_API_KEY
            }
        });
        return {
            statusCode: 200,
            body: JSON.stringify(response.data)
        };
    } catch (err) {
        return {
            statusCode: err.statusCode || 500,
            body: JSON.stringify({ error: err.message })
        };
    }
};