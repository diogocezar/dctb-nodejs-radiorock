const App = {
    config : {
        apiKey            : "AIzaSyCIaqXU3T-vPozdG4BjR-LXfP-ZjL54kRw",
        authDomain        : "dctb-radiorock.firebaseapp.com",
        databaseURL       : "https://dctb-radiorock.firebaseio.com",
        projectId         : "dctb-radiorock",
        messagingSenderId : "957919561974"
    },
    db : null,
    ref : null,
    musics : [],
    searchInput : null,
    suggestions : null,
    init: () => {
        firebase.initializeApp(App.config);
        App.db  = firebase.database()
        App.ref = App.db.ref('/radio-rock') 
        App.setEvents()
        App.getMusics()
    },
    setEvents: () => {
        App.searchInput = document.querySelector('.search')
        App.suggestions = document.querySelector('.suggestions')
        App.searchInput.addEventListener('change', App.displayMatches)
        App.searchInput.addEventListener('keyup', App.displayMatches)
    },
    findMatches: (wordToMatch, musics) => {
        if (wordToMatch != undefined && wordToMatch != '') {
            return musics.filter(item => {
                const regex = new RegExp(wordToMatch, 'gi')
                return item.song.match(regex) || item.singer.match(regex) || item.date.match(regex)
            })
        }
        else{
            return musics
        }
    },
    displayMatches: () => {
        const typed = App.searchInput.value.toUpperCase();
        const matchArray = App.findMatches(typed, App.musics)
        const html = matchArray.map(item => {
            let data = {}
            if(typed != ''){
                const regex     = new RegExp(typed, 'gi')
                data.songName   = item.song.replace(regex, `<span class="hl">${typed}</span>`)
                data.singerName = item.singer.replace(regex, `<span class="hl">${typed}</span>`)
                data.dateName   = item.date.replace(regex, `<span class="hl">${typed}</span>`)
            }
            else{
                data.songName   = item.song;
                data.singerName = item.singer;
                data.dateName   = item.date;
            }
            return `
            <li>
                <span class="name">${data.songName} - ${data.singerName}</span>
                <span class="date">${data.dateName}</span>
            </li>
            `
        }).join('')
        App.suggestions.innerHTML = html
    },
    snapshotToArray: (snapshot) => {
        var returnArr = []
        snapshot.forEach(function (childSnapshot) {
            var item = childSnapshot.val()
            item.key = childSnapshot.key
            returnArr.push(item)
        });
        return returnArr;
    },
    getMusics: () => {
        App.ref.on('value', function (snapshot){
            App.musics = App.snapshotToArray(snapshot)
            App.musics.reverse();
            App.displayMatches();
        })
    },

}
App.init();