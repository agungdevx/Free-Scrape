const axios = require('axios');
const cheerio = require('cheerio');

async function fbDown(fbUrl) {
    try {
        // 1. Muka halaman utama heula jang nyokot Cookie sési
        const getHome = await axios.get('https://fdown.world/', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        const cookie = getHome.headers['set-cookie'];

        // 2. Tembak POST bari mawa Cookie tadi
        const { data } = await axios.post('https://fdown.world/result.php', 
            new URLSearchParams({
                'codehap_link': fbUrl,
                'codehap': 'true'
            }), 
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'Accept': '*/*',
                    'X-Requested-With': 'XMLHttpRequest',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Cookie': cookie,
                    'Referer': 'https://fdown.world/'
                }
            }
        );

        const $ = cheerio.load(data);
        const results = [];

        // Ngabedah elemen link download
        $('.download-btn').each((i, el) => {
            const link = $(el).attr('href');
            let text = $(el).text().trim().replace(/\s+/g, ' ');
            if (link && link !== '#') {
                results.push({
                    quality: text,
                    url: link.startsWith('http') ? link : 'https://fdown.world' + link
                });
            }
        });

        const thumb = $('img').first().attr('src');

        return {
            status: results.length > 0,
            thumbnail: thumb || null,
            links: results
        };

    } catch (err) {
        return { status: false, msg: err.message };
    }
}

// TEST DEUI LUR
fbDown("https://www.facebook.com/share/r/1WCkXg8fsT/").then(res => {
    console.log(JSON.stringify(res, null, 2));
});

/**
*** hasil json
***
{
  "status": true,
  "thumbnail": "https://scontent-ams2-1.xx.fbcdn.net/v/t15.5256-10/503213579_700866032441049_4904061393674818428_n.jpg?_nc_cat=108&ccb=1-7&_nc_sid=a27664&_nc_ohc=AWl2ij4-gK4Q7kNvwEbZxUr&_nc_oc=AdlzK7KjWlOSP9beTe6D3qGAUV0F2kiTJM9q1CUauARUu18adx5yKkUCEKboaDYlpXQ&_nc_zt=23&_nc_ht=scontent-ams2-1.xx&_nc_gid=9Q7ZJG-pooYQBudmUX3i7w&oh=00_AfsDamoNZsfzD-D6kRGqZF-YZMU0OJcCpW6Ap60h7zC-iw&oe=699748D5",
  "links": [
    {
      "quality": "Download 720p(HD)",
      "url": "https://fdown.world/download.php?type=mp4&link=https%3A%2F%2Fssscdn.io%2Fcodehap%2FNDIzMjExMjM0NTYzMjEzM0QwelhsN3p1dExYK0xJT1pETExKL1FESWNRRU9QUWFFNysyeUYzdCtBN3FuUklsQUkwTHNOdURZSDFTb05HdktVcUxXQnF1WGt1bjRtRGtjaGlHUGJKUjFleEZYaGlObTEwSDY2cEY2Vk44bExLNXlmMjBmV1o4R1FEZTZ0bDdIeHo5N1NWbXVMSEtJK1lNQ3FDOFd5RGtqb1RnNktaYXcyY3U3OVNWeFVZaHBxSEl2bU43NU9RcURJQ1krSE85SThGQjJjUUNjeCtsQzEzRElPVTZsT2Y1YnExdkp2ck9udFkwRDF1c1VBTG1MdFdJVGxkNThJT2NTemZra21qVkt0dm1iS2tPbWpvd0hyM3QrbzJqR0JrZitMc2xkcTVmQU9nRUp0bExIdFBKNEd2R2g4dm1ZRVJXRlJlTUxQUldXd2Vwd2ovTEFzd1lUczZOSlNpZldkNE9rWFZkMW9uaWhFUkpkd2psTi9xR21xYnVBaWljdWdBMWhtdDZtVGpTOTZHT29LTzUxNWVxd0pHODhpSlhoT3dzc0xCd05zQWc0VXFSMmp0dXhVS2t0bnNJSWJkT0lIOWlWNGVOcThiS1E1TUNyZXdrblBRRnVvOC9FVjZGYkRMM3F2SDBkUWZDWEFvNHRMRFI1ZlBaYlAwVGlPV3pQK2pFa2RhdDFleU90cnVUOGUzSXY3eVZDcktsK2Y0MC9YR3dlL3lrQ2FHRXNINk1OSGJKNklvYU84OG10S0dNQ3dMa001eTdYbE1NdHBNcjltUjVYT0ZvVVM0QlRwM01QbmhLKzExUzJzd211VTJCanR4QkZHRURFbzdLVW4rSDF4L3NJQ3htNElsM0k4aHRLclNvajhJcFVWVlU5WDk1UHhXcmU3aEdyaWJ1UHc5czNhNUxpczlqekUwdWhvVVo4ZVh0cExWSEpVQ1ZIQTBzazY5Umg2UXJLWWNRN0VmZk1jblZveG9jUVNvdC9EdmpROWR2MDR3aHNBRHoyNnFEZ3ZuMEltSlc0NjNydytOMjVjTVk0WnJELzlkTlo1V3BYVXRwSHJLMzRmU2d5bFFSbGdyVm1ZeklUSStUZ1hNNDR3MkpacDQ3YVVheHo2T3ZoR0cwaTh5VVBCdHkwbG5XeXJtMG1hSlhSYXNNMnc3RkZ3aURnb3FwcExNcjdqdjFHbUNFMUZGS01aMEVubDEzR0luRWx6OUZ1N3VkamhDUnpyRm9uWUx5MnJSM0RNeGRuNjNXcXQzQmJ0Q1NjSUsybjIraUQ4Z0ZueXpJaVd3U0h6U0prZzU4OVM0ZTFNT1h4OUZVUUwzTm5WMWVRa3g1a3IyYjA3c3I4eGk0SXhxbE1PQXFiTzByaW1JZHo4WkJ2NG13dzdlWU1QVEtpbHVaamJqM0dzelQxNGFWbmUxVzJ0RG8xYlE0ckQ1cmNVekVYRkJSUW02SkUvZkUyaWRPT2d3aTZEKzNMVjJhSkJETFczRGZJYUx2RWJkOFZMc2ZMUFkwYnBUNVFjMzNyRnFYZ21WU2hmQ1JPbndydVJIamRiVDVYeWNTemtiR1FHRkR5ZTUwdmVZMm0zaDNxMTluelhic3JEYVkyL21Ya0l0ZVNtTzUxL00vYzc1VWxZeEVwUmFKM3hiNjZZcFM1NS9xSC9HV0FVdVF5THZ1WTdxL09LTnp3VjFaNlFueUtFdVZWb0tpR1ZaTjlXRDZ5UFhiUnc1K3gwOU1TNkVGcGQ3K0kwMEszRHZ4blYwQWtkRnAxelBWUEhndGhMNVdjOHVvMHZheE81WVB1TlQ5alViaVI0OXNVWXVmck5mdWMveDZDKzBqNWNtSVdFOTN2OU9EQTBwRWx0ams9"
    },
    {
      "quality": "Download 360p(SD)",
      "url": "https://fdown.world/download.php?type=mp4&link=https%3A%2F%2Fssscdn.io%2Fcodehap%2FNDIzMjExMjM0NTYzMjEzM0QwelhsN3p1dExYK0xJT1pETExKL1FESWNRRU9QUWFFNysyeUYzdCtBN3E5cHM3NS8xRUNHaThVU3hXbVYzdFEwclByL3VNOWt2aVowb3QvUllCTkJveHlSdWwvTndWSTcxQUxXUEo2UU1BQkE4WXBQV045SFR5VmR6eHV1SDl0cElxQkpCd2RBZ0o1NXBxdjJuWjVNckJZK0JZNkdRbmF3MWpZczV6dDc5R2luMGVFTHIvSWd5ZExFUmcvL24xbHV6a2dWVVp2MDc1ckdLS1MvZzdxNDRHM2NwaTdTSDdhbzhkYlFQc1U5V3VGcFdoTGZISG5WOC9WMElVSHFPNnB0ZGxHcUtJZzk3Z1ZTOXk0N0xFdG82M3R0THBHb1hZdGltRHBqdU00WXhyQWhYbzdrK3IxV29uRnRocHNRVlVZbE5iSjZYdUNCcXZUWFFIZ0RwSDVNb1k5eUhDKzRmamVsMGNNYmN3VHNvcCs4Zm9oM29aT2E1SGwvcGF1U1VYdFNWWE5JbktXR0hLb3JtamNnUXdXeCt6Z1lxdjU1N2U1T255RW5RRVQ2UWRlQ3BLQkxlMXRxTW5zLzJidVJsby9BSnFVY0Jka3BzWVZIOFdCNG9YNGM0MDQxdTBPZDR3L1N2Vm1TR0tFT3pvU21WQVh3Y2h1ZWNqZkNqamM5c2lLMnhZRlN3dVkwQkdYNVpzMUJuenJPek1QZ3RZc290a2dFaG5wQkdxSzdDbnhsL2k5QmE2OHkvQ0J0RXV5TkhYSnJzMHpoeTBsMjlCQ3Y3T1lGZ3lBNWwrd2N4dWNTeG94ckJ4SWRrMHcxZk8zb0RuN2J6a3YvYXlnQkp5d2RYRFRmVzI4MzNoeElNMlMvR2puL3BlUzhDbUQ2dktCcDBMYkRrcTdjWUFNWDZhOGFLUE1Sb3dSdEllaUZ4R0JtNkxkNHorYnVVR1FkTTBvWVFpY2JuRVVVVHAzRVVkSWV6RU9NQ3Q3aVZLYmNCM1Y2UmpkR0JrZmMxdk5SNElGcVRJaExLUGJhU0Y0N2dLdXArSnhwb3JwTUZwd2hkNEdQZ2JmNTdPZVRrbW80ZjNXazVpSlYxbzNROGxvbStrd2l6L00%3D"
    },
    {
      "quality": "Download Video (Server 2)",
      "url": "https://fdown.world/download.php?type=mp4&link=https%3A%2F%2Fssscdn.io%2Fcodehap%2FNDIzMjExMjM0NTYzMjEzM0QwelhsN3p1dExYK0xJT1pETExKL1FESWNRRU9QUWFFNysyeUYzdCtBN3FuUklsQUkwTHNOdURZSDFTb05HdktVcUxXQnF1WGt1bjRtRGtjaGlHUGJKUjFleEZYaGlObTEwSDY2cEY2Vk44bExLNXlmMjBmV1o4R1FEZTZ0bDdIeHo5N1NWbXVMSEtJK1lNQ3FDOFd5RGtqb1RnNktaYXcyY3U3OVNWeFVZaHBxSEl2bU43NU9RcURJQ1krSE85SThGQjJjUUNjeCtsQzEzRElPVTZsT2Y1YnExdkp2ck9udFkwRDF1c1VBTG1MdFdJVGxkNThJT2NTemZra21qVkt0dm1iS2tPbWpvd0hyM3QrbzJqR0JrZitMc2xkcTVmQU9nRUp0bExIdFBKNEd2R2g4dm1ZRVJXRlJlTUxQUldXd2Vwd2ovTEFzd1lUczZOSlNpZldkNE9rWFZkMW9uaWhFUkpkd2psTi9xR21xYnVBaWljdWdBMWhtdDZtVGpTOTZHT29LTzUxNWVxd0pHODhpSlhoT3dzc0xCd05zQWc0VXFSMmp0dXhVS2t0bnNJSWJkT0lIOWlWNGVOcThiS1E1TUNyZXdrblBRRnVvOC9FVjZGYkRMM3F2SDBkUWZDWEFvNHRMRFI1ZlBaYlAwVGlPV3pQK2pFa2RhdDFleU90cnVUOGUzSXY3eVZDcktsK2Y0MC9YR3dlL3lrQ2FHRXNINk1OSGJKNklvYU84OG10S0dNQ3dMa001eTdYbE1NdHBNcjltUjVYT0ZvVVM0QlRwM01QbmhLKzExUzJzd211VTJCanR4QkZHRURFbzdLVW4rSDF4L3NJQ3htNElsM0k4aHRLclNvajhJcFVWVlU5WDk1UHhXcmU3aEdyaWJ1UHc5czNhNUxpczlqekUwdWhvVVo4ZVh0cExWSEpVQ1ZIQTBzazY5Umg2UXJLWWNRN0VmZk1jblZveG9jUVNvdC9EdmpROWR2MDR3aHNBRHoyNnFEZ3ZuMEltSlc0NjNydytOMjVjTVk0WnJELzlkTlo1V3BYVXRwSHJLMzRmU2d5bFFSbGdyVm1ZeklUSStUZ1hNNDR3MkpacDQ3YVVheHo2T3ZoR0cwaTh5VVBCdHkwbG5XeXJtMG1hSlhSYXNNMnc3RkZ3aURnb3FwcExNcjdqdjFHbUNFMUZGS01aMEVubDEzR0luRWx6OUZ1N3VkamhDUnpyRm9uWUx5MnJSM0RNeGRuNjNXcXQzQmJ0Q1NjSUsybjIraUQ4Z0ZueXpJaVd3U0h6U0prZzU4OVM0ZTFNT1h4OUZVUUwzTm5WMWVRa3g1a3IyYjA3c3I4eGk0SXhxbE1PQXFiTzByaW1JZHo4WkJ2NG13dzdlWU1QVEtpbHVaamJqM0dzelQxNGFWbmUxVzJ0RG8xYlE0ckQ1cmNVekVYRkJSUW02SkUvZkUyaWRPT2d3aTZEKzNMVjJhSkJETFczRGZJYUx2RWJkOFZMc2ZMUFkwYnBUNVFjMzNyRnFYZ21WU2hmQ1JPbndydVJIamRiVDVYeWNTemtiR1FHRkR5ZTUwdmVZMm0zaDNxMTluelhic3JEYVkyL21Ya0l0ZVNtTzUxL00vYzc1VWxZeEVwUmFKM3hiNjZZcFM1NS9xSC9HV0FVdVF5THZ1WTdxL09LTnp3VjFaNlFueUtFdVZWb0tpR1ZaTjlXRDZ5UFhiUnc1K3gwOU1TNkVGcGQ3K0kwMEszRHZ4blYwQWtkRnAxelBWUEhndGhMNVdjOHVvMHZheE81WVB1TlQ5alViaVI0OXNVWXVmck5mdWMveDZDKzBqNWNtSVdFOTN2OU9EQTBwRWx0ams9"
    },
    {
      "quality": "Download Image",
      "url": "https://fdown.world/download.php?type=jpg&link=https%3A%2F%2Fscontent-ams2-1.xx.fbcdn.net%2Fv%2Ft15.5256-10%2F503213579_700866032441049_4904061393674818428_n.jpg%3F_nc_cat%3D108%26ccb%3D1-7%26_nc_sid%3Da27664%26_nc_ohc%3DAWl2ij4-gK4Q7kNvwEbZxUr%26_nc_oc%3DAdlzK7KjWlOSP9beTe6D3qGAUV0F2kiTJM9q1CUauARUu18adx5yKkUCEKboaDYlpXQ%26_nc_zt%3D23%26_nc_ht%3Dscontent-ams2-1.xx%26_nc_gid%3D9Q7ZJG-pooYQBudmUX3i7w%26oh%3D00_AfsDamoNZsfzD-D6kRGqZF-YZMU0OJcCpW6Ap60h7zC-iw%26oe%3D699748D5"
    }
  ]
}
**/