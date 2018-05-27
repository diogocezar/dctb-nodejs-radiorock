const https   = require('https')
const fs      = require('fs')
const fb      = require("firebase-admin");

class RadioRock {
    constructor(){
        this.url      = 'https://players.gc2.com.br/cron/89fm/results2.json'
        this.dbUrl    = 'https://dctb-radiorock.firebaseio.com'
        this.keyFile  = './key.json'
        this.fileName = './data.json'
        this.file     = require(this.fileName)
        this.account  = require(this.keyFile)
        this.data     = ''
        this.seconds  = 60
        this.configureFirebase()
        this.loop()
    }
    loop(){
        this.getData()
        setTimeout(() => {
            this.getData()
            this.loop()
        }, this.seconds*1000)
    }
    configureFirebase(){
        console.log('Configurando conexão com o banco de dados FireBase.')
        fb.initializeApp({
            credential: fb.credential.cert(this.account),
            databaseURL: this.dbUrl
        });
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
                const json = this.getJsonResult(this.data)
                this.writeFile(json)
                this.writeFireBase(json)
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
    writeFireBase(result){
        console.log('Gravação no FireBase.')
        const obj = {}
        obj[new Date().toLocaleString()] = result
        this.checkIfExistsFb(result, obj);
    }
    checkIfExistsFb(result, obj){
        const db  = fb.database();
        const ref = db.ref("/radio-rock");
        ref.on("value", (snapshot) => {
            const dataBase = snapshot.val();
            let save       = true;
            for (let k in dataBase) {
                if (dataBase[k].singer == result.singer && dataBase[k].song == result.song){
                    console.log('\x1b[33m', '')
                    console.log(`[FIREBASE] Música já encontrada: ${result.singer} - ${result.song}`)
                    console.log('\x1b[0m')
                    save = false
                }
            }
            if(save){
                console.log('\x1b[32m', '')
                console.log(`[FIREBASE] Nova música encontrada: ${result.singer} - ${result.song}`)
                console.log('\x1b[0m')
                ref.update(obj)
            }
                
        }, function (errorObject) {
            console.log("The read failed: " + errorObject.code);
        });
    }
    writeFile(result){
        console.log('Gravação em Arquivo Local.')
        fs.readFile(this.fileName, (err, oldContent) => {
            if (err) { return console.log(err) }
            oldContent = JSON.parse(oldContent)
            if(this.checkIfExists(result, oldContent)){
                console.log('\x1b[32m', '')
                console.log(`[FILE] Nova música encontrada: ${result.singer} - ${result.song}`)
                console.log('\x1b[0m')
                oldContent[new Date().toLocaleString()] = result
                fs.writeFile(this.fileName, JSON.stringify(oldContent), (err) => {
                    if (err) { return console.log(err) }
                })
            }
            else{
                console.log('\x1b[33m', '')
                console.log(`[FILE] Música já encontrada: ${result.singer} - ${result.song}`)
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