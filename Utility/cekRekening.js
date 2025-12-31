const https = require('https');
const url = 'https://www.rumahotp.com/api/v1/h2h/check/rekening?bank_code=dana&account_number=08xxx';

https.get(url, (resp) => {
  let data = '';

  resp.on('data', (chunk) => {
    data += chunk;
  });

  resp.on('end', () => {
    console.log(data);
  });

}).on("error", (err) => {
  console.log("Error: " + err.message);
});