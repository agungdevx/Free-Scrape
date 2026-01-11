const crypto = require('crypto');

class AgungDevXYouTubeDownloaderV2 {
    constructor() {
        this.hexKey = "C5D58EF67A7584E4A29F6C35BBC4EB12";
    }

    hexToBytes(hex) {
        const bytes = [];
        for (let i = 0; i < hex.length; i += 2) {
            bytes.push(parseInt(hex.substr(i, 2), 16));
        }
        return new Uint8Array(bytes);
    }

    base64ToBytes(base64) {
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        return bytes;
    }

    async decryptData(encryptedBase64) {
        try {
            const keyBytes = this.hexToBytes(this.hexKey);
            
            const key = await crypto.subtle.importKey(
                "raw",
                keyBytes,
                { name: "AES-CBC" },
                false,
                ["decrypt"]
            );
            
            const encryptedBytes = this.base64ToBytes(encryptedBase64);
            
            if (encryptedBytes.length < 16) {
                throw new Error('Data too short');
            }
            
            const iv = encryptedBytes.slice(0, 16);
            const data = encryptedBytes.slice(16);
            
            const decrypted = await crypto.subtle.decrypt(
                {
                    name: "AES-CBC",
                    iv: iv
                },
                key,
                data
            );
            
            const text = new TextDecoder().decode(decrypted);
            return JSON.parse(text);
            
        } catch (error) {
            throw new Error(`Decryption failed: ${error.message}`);
        }
    }

    async getCDN() {
        try {
            const response = await fetch("https://media.savetube.me/api/random-cdn");
            const data = await response.json();
            return data.cdn;
        } catch (error) {
            return 'd2.savetube.me';
        }
    }

    async getVideoInfo(url) {
        try {
            if (!url.includes('youtu')) {
                throw new Error('Invalid YouTube URL');
            }

            const cdn = await this.getCDN();
            
            const response = await fetch(`https://${cdn}/v2/info`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ url })
            });

            const result = await response.json();
            
            if (!result.status) {
                throw new Error(result.message || 'Failed to get video info');
            }

            const decryptedData = await this.decryptData(result.data);
            
            return {
                success: true,
                title: decryptedData.title,
                duration: decryptedData.durationLabel,
                thumbnail: decryptedData.thumbnail,
                key: decryptedData.key,
                formats: decryptedData.video_formats?.map(format => ({
                    label: format.label,
                    quality: format.height,
                    isDefault: format.default_selected || false
                })) || []
            };

        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    async getDownloadLink(videoKey, quality, type = 'audio') {
        try {
            const cdn = await this.getCDN();
            
            const response = await fetch(`https://${cdn}/download`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    downloadType: quality === "128" ? "audio" : type,
                    quality: quality,
                    key: videoKey
                })
            });

            const result = await response.json();
            
            if (!result.status) {
                throw new Error(result.message || 'Failed to get download link');
            }

            return result.data.downloadUrl;

        } catch (error) {
            throw new Error(`Get download link failed: ${error.message}`);
        }
    }

    async download(url, quality = '128', type = 'audio') {
        try {
            const videoInfo = await this.getVideoInfo(url);
            
            if (!videoInfo.success) {
                return videoInfo;
            }

            const downloadUrl = await this.getDownloadLink(videoInfo.key, quality, type);
            
            return {
                success: true,
                title: videoInfo.title,
                duration: videoInfo.duration,
                thumbnail: videoInfo.thumbnail,
                downloadUrl: downloadUrl,
                quality: quality,
                type: type,
                availableFormats: videoInfo.formats
            };

        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
}

async function main() {
    const downloader = new AgungDevXYouTubeDownloaderV2();
    
    const result = await downloader.download(
        'https://youtu.be/yJg-Y5byMMw',
        '128',
        'audio'
    );
    
    console.log(JSON.stringify(result, null, 2));
}

if (require.main === module) {
    main();
}

module.exports = AgungDevXYouTubeDownloaderV2;