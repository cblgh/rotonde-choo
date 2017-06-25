// import choo
var choo = require("choo")

// import choo's template helper
var html = require("choo/html")

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
                    entry.portal = portalDomain;
                    entry.name = portal.profile.name;
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

function link(entry, prop, text) {
    if (entry[prop]) {
        return html`<a href="${entry[prop]}">${text}</a>`;
    }
}

function messageBox(entry) {
    return html`
        <div style="background-color: ${entry.color}" class="msgbox">
            <div class="meta-container">
                <div class="domain-container">
                    <div class="nick">${entry.name}</div>
                    <div class="domain">@${entry.portal}</div>
                </div>
                <div class="link-container">${link(entry, "url", "link")} ${link(entry, "media", "media")}</div>
            </div>
            <div class="msg-container">
                <img class="avatar" src="${entry.avatar}">
                <div class="msg">${entry.text}</div>
            </div>
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
