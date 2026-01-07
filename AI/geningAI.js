const axios = require('axios');

async function geningAI(message) {
    const url = 'https://www.gening.ai/cgi-bin/auth/aigc/text';
    
    const requestData = {
        messages: [
            {
                role: "system",
                content: "Hello! How can I help you today?"
            },
            {
                role: "user",
                content: message
            }
        ]
    };

    const headers = {
        'Content-Type': 'application/json',
        'Cookie': 'uid=2008749140611174400'
    };

    try {
        const response = await axios.post(url, requestData, { headers });
        
        return {
            success: response.data.code === 0,
            response: response.data.data.result,
            remain: response.data.data.remain,
            author: "AgungDevX"
        };
    } catch (error) {
        return {
            success: false,
            error: error.message,
            author: "AgungDevX"
        };
    }
}

geningAI("Hai")
    .then(result => console.log(JSON.stringify(result, null, 2)))
    .catch(console.error);