// import choo
var choo = require("choo")

// import choo's template helper
var html = require("choo/html")

// initialize choo
var app = choo();

var $ = document.getElementById.bind(document);

function fetchPortal(portal) {
    if (portal.indexOf("http") < 0) {
        portal = "http://" + portal;
    }
    return fetch(portal).then(function(response) { 
        return response.json();
    });
}

app.use(function(state, emitter) {

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
            <div class="time">${new Date(entry.time * 1000).toDateString()}</div>
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

// take another's feed as input/url.param
// present them with boxes for input
// show resulting rotonde.json for them to copy somewhere else
app.route("/generate", function(state) {
    // fetchPortal(state.params.portal).then(function(resp) {
    //     return messageBox(resp.feed[0])
    // });

    return html`
        <div class="generate-wrapper">
            <div class="generate-container">
                <input id="url" class="input-url" placeholder="portal url e.g. rotonde.cblgh.org">
                <textarea id="json-area" class="json-area" placeholder="<rotonde.json>" onclick=${jsonClick} readonly></textarea>
                <input id="text" class="entry-text" placeholder="entry text">
            </div>
            <div>
                <button onclick=${addText}>add text</button>
                <button onclick=${portalClick}>load portal</button>
            </div>
        </div>
    `
});

function jsonClick(e) {
    console.log(e.target);
    e.target.select();
}

function portalClick() {
    fetchPortal($("url").value).then(function(portal) {
        var area = $("json-area");
        area.value = JSON.stringify(portal); // fill with stringified json
        area.scrollTop = area.scrollHeight; // scroll to bottom of textarea
        console.log(portal);
    });
}

function addText() {
    var time = parseInt(new Date() / 1000);
    var rotonde = JSON.parse($("json-area").value);
    rotonde.feed.push({text: $("text").value, time: time});
    $("json-area").value = JSON.stringify(rotonde);
    $("text").value = ""; // clear input box
}

// start app
app.mount("div");
