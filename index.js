// import choo
var choo = require("choo")

// import choo's template helper
var html = require("choo/html")

var main = require("./templates/main.js");

// initialize choo
var app = choo();


app.use(function(state, emitter) {
    function fetchPortal(portal) {
        return fetch("http://" + portal).then(function(response) { 
            return response.json();
        });
    }

    function compare(a, b) {
        var first = parseInt(a.time);
        var second = parseInt(b.time);
        if (first < second) {
            return 1;
        } else if (first > second) {
            return -1;
        }
        return 0;
    }

    state.list = [];
    fetchPortal("rotonde.cblgh.org").then(function(base) {
        // for each portal i follow
        base.portal.map(function (portalDomain) {
            // get its contents
            console.log("fetching", portalDomain);
            fetchPortal(portalDomain).then(function(portal) {
                // then process its entries
                portal.feed.map(function(entry) {
                    // adding its avatar to each entry
                    entry.avatar = portal.profile.avatar;
                    entry.color = portal.profile.color;
                    // and pushing it onto our timeline feed
                    state.list.push(entry);
                }); 
                // sort entries with newest at the top of the page
                state.list.sort(compare);
                emitter.emit("render");
            });
        });
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
        <div style="background-color: ${entry.color}" class="msgbox">
            <img class="avatar" src="${entry.avatar}">
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

app.route("/:base", function(state) {
    console.log(state.params.base);
});

// start app
app.mount("div");
