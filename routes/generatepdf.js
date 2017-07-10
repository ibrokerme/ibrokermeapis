
const http = require('http');
const https = require('https');

function getpdfbase64(userid, docid) {
    const url = 'http://localhost:60470/api/pdf/' + userid + '/' + docid;
    console.log(url);
    return new Promise((resolve, reject) => {

        http.get(url, (resp) => {
            const data = [];
            resp.on('data', (chunk) => {
                console.log('data');
                data.push(chunk);
            });
            resp.on('end', () => {
                const results = JSON.parse(data.join(''))
                console.log(results.result);
                resolve(results.result)
            });

        }).on('error', (err) => {
            reject(new Error('An error occured fetching clinics, err:' + err))
        });

    })

}

exports.getpdfbase64 = getpdfbase64;








