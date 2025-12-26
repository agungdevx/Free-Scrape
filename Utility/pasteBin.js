/**
 * @project Pastebin Uploader Engine
 * @author AgungDEV
 * @license MIT
 */

const axios = require('axios');

// API Documentation & Key: https://pastebin.com/doc_api#1
const PASTEBIN_CONFIG = {
    API_KEY: 'YOUR_PASTEBIN_API_KEY', 
    END_POINT: 'https://pastebin.com/api/api_post.php'
};

const PastebinProvider = {
    /**
     * Upload content and return structured JSON
     */
    upload: async (code, title = 'Script Upload') => {
        // Validation Logic
        if (!code?.trim()) {
            return {
                status: 400,
                success: false,
                message: 'INVALID_PAYLOAD: Content cannot be empty'
            };
        }

        if (PASTEBIN_CONFIG.API_KEY === 'YOUR_PASTEBIN_API_KEY') {
            return {
                status: 401,
                success: false,
                message: 'UNAUTHORIZED: API Key is required',
                source: 'https://pastebin.com/doc_api#1'
            };
        }

        try {
            const payload = new URLSearchParams({
                api_dev_key: PASTEBIN_CONFIG.API_KEY,
                api_option: 'paste',
                api_paste_code: code,
                api_paste_private: '0', 
                api_paste_name: title,
                api_paste_expire_date: '10M',
                api_paste_format: 'text'
            });

            const { data, status } = await axios.post(PASTEBIN_CONFIG.END_POINT, payload);

            // Logic for successful Pastebin Response
            if (typeof data === 'string' && data.startsWith('https://pastebin.com/')) {
                const pasteId = data.split('/').pop();
                
                return {
                    status: 200,
                    success: true,
                    data: {
                        id: pasteId,
                        url: data,
                        raw: `https://pastebin.com/raw/${pasteId}`,
                        metadata: {
                            title: title,
                            expiry: '10 Minutes',
                            created_at: new Date().toISOString()
                        }
                    }
                };
            }

            // Fallback for API Error messages from Pastebin
            return {
                status: 422,
                success: false,
                message: `API_REJECTED: ${data}`
            };

        } catch (err) {
            return {
                status: err.response?.status || 500,
                success: false,
                error: {
                    type: 'SYSTEM_FAILURE',
                    message: err.message
                }
            };
        }
    }
};

// --- EXECUTION EXAMPLE ---
(async () => {
    const result = await PastebinProvider.upload("console.log('Testing System');", "Debug_Log");
    console.log(JSON.stringify(result, null, 2));
})();