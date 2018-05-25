const https = require('https')
const fs = require('fs')
const url = 'https://players.gc2.com.br/cron/89fm/results2.json'
const fileName =  './data.json'
const file = require(fileName)

https.get(url, (res) => {
    var data = '';
    res.on('data', (chunk) => {
        data += chunk;
        console.log(data);
    });
    res.on('end', () => {
        var json = JSON.parse(data);
        console.log("Got a response: ", json);
        const music = json.musicas.tocando
        const singer = music.singer
        const song = music.tocando
        file.song = {
            'singer' : singer,
            'song' : song
        }
        fs.writeFile(fileName, JSON.stringify(file), (err) => {
            if(err) console.log('Error on write file.');
        })
    });
}).on('error', function (e) {
    console.log("Got an error: ", e);
});