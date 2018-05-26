const https    = require('https')
const fs       = require('fs')

class RadioRock {
    constructor(){
        this.url      = 'https://players.gc2.com.br/cron/89fm/results2.json'
        this.fileName = './data.json'
        this.file     = require(this.fileName)
        this.data     = ''
        this.seconds  = 60
        console.log('Iniciando aplicativo.');
        this.loop()
    }
    loop(){
        this.getData()
        setTimeout(() => {
            this.getData()
            this.loop()
        }, this.seconds*1000)
    }
    getData(){
        console.log('Iniciando a busca pelo JSON.')
        https.get(this.url, (res)  => {
            this.data = ''
            res.on('data', (chunk) => { 
                console.log('Recebendo data.')
                this.data += chunk; 
            });
            res.on('end', ()       => { 
                console.log('JSON retornado.')
                this.writeFile(this.getJsonResult(this.data)) 
            });
        }).on('error', function (err) {
            return console.log(err);
        });
    }
    getJsonResult(json){
        console.log('Realizando parse do JSON.')
        json = JSON.parse(json.replace(/'/g, ''))
        const music  = json.musicas.tocando
        const singer = music.singer
        const song   = music.song
        return {
            'singer' : singer,
            'song'   : song
        }
    }
    writeFile(result){
        console.log('Abrindo base já existente.')
        fs.readFile(this.fileName, (err, oldContent) => {
            if (err) { return console.log(err) }
            oldContent = JSON.parse(oldContent)
            if(this.checkIfExists(result, oldContent)){
                console.log('\x1b[32m', '')
                console.log(`Nova música encontrada: ${result.singer} - ${result.song}`)
                console.log('\x1b[0m')
                oldContent[new Date().toLocaleString()] = result
                fs.writeFile(this.fileName, JSON.stringify(oldContent), (err) => {
                    if (err) { return console.log(err) }
                })
            }
            else{
                console.log('\x1b[33m', '')
                console.log(`Música já encontrada: ${result.singer} - ${result.song}`)
                console.log('\x1b[0m')
            }
            console.log('Aguardando...')
        });        
    }
    checkIfExists(result, dataBase){
        for (let k in dataBase) {
            if(dataBase[k].singer == result.singer && dataBase[k].song == result.song)
                return false;
        }
        return true;
    }
}

new RadioRock();