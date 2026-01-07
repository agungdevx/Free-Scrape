const axios = require('axios');

async function unlimitedAIChat(message, chatId = "e6d80bed-6b42-4ea0-a5ac-01d4e9175ee1") {
    const url = `https://app.unlimitedai.chat/chat/${chatId}`;
    
    const requestData = [{
        chatId: chatId,
        messages: [{
            id: "025cd08e-4445-4dfc-ac8b-27117973cb71",
            role: "user",
            content: message,
            parts: [{ type: "text", text: message }],
            createdAt: "$D2026-01-07T03:07:23.149Z"
        }, {
            id: "50585339-372e-4785-8a60-c3148c68838e",
            role: "assistant",
            content: "",
            parts: [{ type: "text", text: "" }],
            createdAt: "$D2026-01-07T03:07:23.150Z"
        }],
        selectedChatModel: "chat-model-reasoning",
        selectedCharacter: null,
        selectedStory: null
    }];

    const headers = {
        'Accept': 'text/x-component',
        'Next-Action': '40713570958bf1accf30e8d3ddb17e7948e6c379fa',
        'Next-Router-State-Tree': '%5B%22%22%2C%7B%22children%22%3A%5B%5B%22locale%22%2C%22en%22%2C%22d%22%5D%2C%7B%22children%22%3A%5B%22__PAGE__%22%2C%7B%7D%2Cnull%2Cnull%5D%7D%2Cnull%2Cnull%5D%7D%2Cnull%2Cnull%2Ctrue%5D',
        'Content-Type': 'application/json'
    };

    try {
        const response = await axios.post(url, requestData, { headers });
        
        let responseText = '';
        const lines = response.data.toString().split('\n');
        
        for (const line of lines) {
            if (line.includes('"diff"')) {
                try {
                    const jsonStr = line.substring(line.indexOf('{'));
                    const data = JSON.parse(jsonStr);
                    if (data.diff && data.diff[1]) {
                        responseText += data.diff[1];
                    }
                } catch (e) {
                    continue;
                }
            }
        }
        
        return {
            success: true,
            response: responseText,
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

unlimitedAIChat("Siapa presiden Indonesia saat ini")
    .then(result => console.log(JSON.stringify(result, null, 2)))
    .catch(console.error);