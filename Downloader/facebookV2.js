const axios = require('axios');

async function fbDown(url) {
    try {
        // Headers nu leuwih mirip Browser asli
        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'Sec-Fetch-Mode': 'navigate',
            'Cookie': 'sb=1; datr=1;' // Cookie minimalis keur ngecoh bot-detection
        };

        // Paké request biasa heula keur neangan URL asli mun aya redirect
        const response = await axios.get(url, { 
            headers, 
            timeout: 15000,
            maxRedirects: 10 
        });

        const html = response.data;

        // Regex keur neangan link video dina tumpukan kode Facebook
        const findUrl = (regex) => {
            const match = html.match(regex);
            if (match && match[1]) {
                return match[1]
                    .replace(/\\\//g, '/')
                    .replace(/\\u0025/g, '%')
                    .replace(/\\u0026/g, '&');
            }
            return null;
        };

        const hd = findUrl(/"browser_native_hd_url":"([^"]+)"/) || findUrl(/"playable_url_quality_hd":"([^"]+)"/);
        const sd = findUrl(/"browser_native_sd_url":"([^"]+)"/) || findUrl(/"playable_url":"([^"]+)"/);
        const title = html.match(/<title>(.*?)<\/title>/)?.[1]?.split(' | ')[0] || "Facebook Video";

        if (!hd && !sd) {
            return {
                creator: "@ShiroNexo",
                status: false,
                message: "Video teu kapanggih. Facebook keur proteksi, coba ganti IP/VPN."
            };
        }

        return {
            creator: "@ShiroNexo",
            status: true,
            title,
            hd,
            sd
        };

    } catch (err) {
        return {
            creator: "@ShiroNexo",
            status: false,
            message: err.response ? `Error ${err.response.status}: Facebook nolak request.` : err.message
        };
    }
}

const tester = "https://www.facebook.com/share/r/1WCkXg8fsT/";

fbDown(tester).then(res => {
    console.log(JSON.stringify(res, null, 2));
});



// Conto hasilna
/**
{
  "creator": "@ShiroNexo",
  "status": true,
  "title": "Facebook",
  "hd": "https://video.fbdo18-1.fna.fbcdn.net/o1/v/t2/f2/m86/AQMdg8K5f_DAf4Y6_rD1zBQ1ssEOU0R6mIJu3cTRdnd6hT0lo0JI5K38kOGrIICCnQ52Fu7g214eW7_S8opDzUJILdbHlqJbOd7YRrs.mp4?_nc_cat=109&_nc_oc=AdlhHHLi7LSm1nAi7nZLv-XgP67ndB91aX2DxAHy6YBtLDAtUhel5LUOY_rqUO6Qe5E&_nc_sid=5e9851&_nc_ht=video.fbdo18-1.fna.fbcdn.net&_nc_ohc=7YPLJH4CXXEQ7kNvwFERblR&efg=eyJ2ZW5jb2RlX3RhZyI6Inhwdl9wcm9ncmVzc2l2ZS5GQUNFQk9PSy4uQzMuNzIwLmRhc2hfYmFzZWxpbmVfMV92MSIsInhwdl9hc3NldF9pZCI6MTc5MzgzMDIzOTkxMTk4NzksImFzc2V0X2FnZV9kYXlzIjozLCJ2aV91c2VjYXNlX2lkIjoxMDA5OSwiZHVyYXRpb25fcyI6MTksInVybGdlbl9zb3VyY2UiOiJ3d3cifQ%3D%3D&ccb=17-1&vs=97762bb71e7d70e&_nc_vs=HBksFQIYUmlnX3hwdl9yZWVsc19wZXJtYW5lbnRfc3JfcHJvZC85MzRDNTExRDc5MTgxQjk3RDZDRTcxM0Q0MTc2NjlCQV92aWRlb19kYXNoaW5pdC5tcDQVAALIARIAFQIYUWlnX3hwdl9wbGFjZW1lbnRfcGVybWFuZW50X3YyLzM0NDczQjU5NDMzQTQ1REFCNzdDRkYzODNGMDEzNUFDX2F1ZGlvX2Rhc2hpbml0Lm1wNBUCAsgBEgAoABgAGwKIB3VzZV9vaWwBMRJwcm9ncmVzc2l2ZV9yZWNpcGUBMRUAACaOiPzlz7LdPxUCKAJDMywXQDNEGJN0vGoYEmRhc2hfYmFzZWxpbmVfMV92MREAdQJl5p0BAA&_nc_gid=_6rqMp_8jjayMugkc5rOaw&_nc_zt=28&oh=00_AfuXycdSoDx41BtxBbhPUNcGEdUbXyK6DoDYWnsUz7jryg&oe=69876BD2&bitrate=2713258&tag=dash_baseline_1_v1",
  "sd": "https://video.fbdo18-1.fna.fbcdn.net/o1/v/t2/f2/m367/AQNvdVJtTulc4X_cDVwxKgSJzb8Bx5hIfxuNkOwM4Qb_V6eMMtqNF5V5rlYH4Jthno_x3vnZJ-sSLOl5MdlGPkuVxVWqTLTtuMWutjkN4g.mp4?_nc_cat=104&_nc_oc=AdkdQCI3J7AKqwxHHVhauT9SVv9zcSXzeXSApVmQiiuySHRh3AuOTVh4EDipVZpgQ5U&_nc_sid=8bf8fe&_nc_ht=video.fbdo18-1.fna.fbcdn.net&_nc_ohc=Si1GV63E0GYQ7kNvwHAMXNp&efg=eyJ2ZW5jb2RlX3RhZyI6Inhwdl9wcm9ncmVzc2l2ZS5GQUNFQk9PSy4uQzMuMzYwLnByb2dyZXNzaXZlX2gyNjQtYmFzaWMtZ2VuMl8zNjBwIiwieHB2X2Fzc2V0X2lkIjoxNzkzODMwMjM5OTExOTg3OSwiYXNzZXRfYWdlX2RheXMiOjMsInZpX3VzZWNhc2VfaWQiOjEwMDk5LCJkdXJhdGlvbl9zIjoxOSwidXJsZ2VuX3NvdXJjZSI6Ind3dyJ9&ccb=17-1&_nc_gid=_6rqMp_8jjayMugkc5rOaw&_nc_zt=28&oh=00_AfsxuPykAqh-dVCcfmo5Oc_c-TIijSQwcYEoNxmjB-Onqg&oe=698B5ED2&bitrate=723828&tag=progressive_h264-basic-gen2_360p"
}
**/
