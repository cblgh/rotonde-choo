// import choo
var choo = require("choo")

// import choo's template helper
var html = require("choo/html")

var main = require("./templates/main.js");

// initialize choo
var app = choo();

app.use(function(state, emitter) {
    state.list = [];
    fetch("http://rotonde.cblgh.org").then(function(response) { 
        var contentType = response.headers.get("content-type");
        if(contentType && contentType.indexOf("application/json") !== -1) {
            return response.json().then(function(json) {
                json.feed.map(function(entry) { entry.avatar = json.profile.avatar});
                console.log(JSON.stringify(json.feed));
                state.list = json.feed;
                emitter.emit("render");
            })
        }
    });
    emitter.on("evt", function(data) {
        console.log("HOLY SHIT, EVT!");
        if (data) { console.log("we even had some data", data); }
        // redraw page
        emitter.emit("render");
    });
})

console.log(main());


function messageBox(entry) {
    return html`
        <div class="msgbox">
            <img src=${entry.avatar} width="100" class="avatar">
            <div class="msg">${entry.text}</div>
        </div>
    `
}

// create a route
app.route("/", function(state) {
    return html`
        <div class="container">
            ${state.list.map(messageBox)}
        </div>
    `
});

// start app
app.mount("div");
