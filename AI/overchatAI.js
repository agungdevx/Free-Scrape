const axios = require('axios');
const crypto = require('crypto');

async function overchatAI(message, model = "deepseek/deepseek-non-thinking-v3.2-exp") {
    const url = 'https://api.overchat.ai/v1/chat/completions';
    
    const chatId = crypto.randomUUID();
    const messageId = crypto.randomUUID();
    
    const personaMap = {
        "deepseek/deepseek-non-thinking-v3.2-exp": "deepseek-v-3-2-landing",
        "openai/gpt-4o": "gpt-4o-landing",
        "claude-haiku-4-5-20251001": "claude-haiku-4-5-landing"
    };
    
    const requestData = {
        chatId: chatId,
        model: model,
        messages: [{
            id: messageId,
            role: "user",
            content: message
        }, {
            id: crypto.randomUUID(),
            role: "system",
            content: ""
        }],
        personaId: personaMap[model] || "deepseek-v-3-2-landing",
        frequency_penalty: 0,
        max_tokens: 4000,
        presence_penalty: 0,
        stream: true,
        temperature: 0.5,
        top_p: 0.95
    };

    const headers = {
        'Content-Type': 'application/json',
        'Accept': '*/*',
        'X-Device-Platform': 'web',
        'X-Device-Language': 'en-US',
        'X-Device-Uuid': crypto.randomUUID(),
        'X-Device-Version': '1.0.44',
        'Origin': 'https://overchat.ai'
    };

    try {
        const response = await axios.post(url, requestData, { 
            headers,
            responseType: 'stream'
        });

        let fullResponse = '';
        
        return new Promise((resolve, reject) => {
            response.data.on('data', (chunk) => {
                const chunkStr = chunk.toString();
                const lines = chunkStr.split('\n');
                
                for (const line of lines) {
                    if (line.startsWith('data: ') && !line.includes('[DONE]')) {
                        try {
                            const data = JSON.parse(line.slice(6));
                            if (data.choices?.[0]?.delta?.content) {
                                fullResponse += data.choices[0].delta.content;
                            }
                        } catch (e) {}
                    }
                }
            });

            response.data.on('end', () => {
                resolve({
                    success: true,
                    response: fullResponse,
                    model: model,
                    author: "AgungDevX"
                });
            });

            response.data.on('error', (error) => {
                reject({
                    success: false,
                    error: error.message,
                    author: "AgungDevX"
                });
            });
        });
    } catch (error) {
        return {
            success: false,
            error: error.message,
            author: "AgungDevX"
        };
    }
}

overchatAI("Siapa presiden Indonesia saat ini")
    .then(result => console.log(JSON.stringify(result, null, 2)))
    .catch(console.error);