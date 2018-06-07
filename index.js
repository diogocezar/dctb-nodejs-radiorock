const https   = require('https')
//const fs      = require('fs')
const fb      = require("firebase-admin");

class RadioRock {
    constructor(){
        this.url      = 'https://players.gc2.com.br/cron/89fm/results2.json'
        this.dbUrl    = 'https://dctb-radiorock.firebaseio.com'
        this.keyFile  = './key.json'
        //this.fileName = './data.json'
        this.root     = 'radio-rock'
        //this.file     = require(this.fileName)
        this.account  = require(this.keyFile)
        this.data     = ''
        this.seconds  = 100
        this.configureFirebase()
        this.getData()
        this.loop()
    }
    loop(){
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
                //this.writeFile(json)
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
        const date   = new Date().toLocaleString()
        return {
            'date'   : date,
            'singer' : singer,
            'song'   : song,
            'found'  : [date]
        }
    }
    writeFireBase(result){
        console.log('Gravação no FireBase.')
        const obj = {}
        obj[(new Date().getTime()*-1)] = result
        this.checkIfExistsFb(result, obj);
    }
    checkIfExistsFb(result, obj){
        const db  = fb.database();
        const ref = db.ref("/" + this.root);
        ref.once("value", (snapshot) => {
            const dataBase = snapshot.val();
            let save       = true;
            for (let k in dataBase) {
                if (dataBase[k].singer == result.singer && dataBase[k].song == result.song){
                    if(save == true){
                        save = false
                        console.log('\x1b[33m', '')
                        console.log(`[FIREBASE] Música já encontrada: ${result.singer} - ${result.song}`)
                        console.log('\x1b[0m')
                        if (dataBase[k].found != undefined){
                            let dateNow = new Date().toLocaleString()
                            let dateSaved = dataBase[k].found[dataBase[k].found.length - 1]
                            if(dateSaved != undefined){
                                let dateCompNow = new Date(dateNow)
                                let dateCompSaved = new Date(dateSaved)
                                let diffMs = (dateCompSaved - dateCompNow) * -1;
                                let diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000);
                                if(diffMins > 10){
                                    let updateObj = {};
                                    updateObj['found'] = dataBase[k].found || []
                                    updateObj['found'].push(new Date().toLocaleString())
                                    db.ref("/" + this.root + "/" + k).update(updateObj)
                                }
                            }
                        }
                    }
                }
            }
            if(save){
                console.log('\x1b[32m', '')
                console.log(`[FIREBASE] Nova música encontrada: ${result.singer} - ${result.song}`)
                console.log('\x1b[0m')
                ref.update(obj)
            }
            console.log('Aguardando...')
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
                oldContent[(new Date().getTime() * -1)] = result
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