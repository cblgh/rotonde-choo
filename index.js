// import choo
var choo = require("choo")

// import choo's template helper
var html = require("choo/html")

// initialize choo
var app = choo();

// var input = require("./handleInput.js")

var $ = document.getElementById.bind(document);

function fetchPortal(portal) {
    if (portal.indexOf("http") < 0) {
        portal = "http://" + portal;
    }
    return fetch(portal)
        .catch(function(err) {
            return err;
        })
        .then(function(response) { 
        return response.json();
    });
}

app.use(function(state, emitter) {
    process("rotonde.cblgh.org"); // set initial portal to mine

    function process(portalUrl) {
        state.list = []; // clear list
        fetchPortal(portalUrl).then(function(base) {
            // for each portal i follow
            base.portal.map(function (portalDomain) {
                // get its contents
                console.log("fetching", portalDomain);
                fetchPortal(portalDomain).then(function(portal) {
                    // then process its entries
                    portal.feed.map(function(entry) {
                        // adding its properties to each entry
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

    emitter.on("newPortal", function(data) {
        // redraw page
        process(data);
        emitter.emit("render");
    });
});

function link(entry, prop, text) {
    if (entry[prop]) {
        return html`<a href="${entry[prop]}">${text}</a>`;
    }
}

// create a route
app.route("/", function(state, emit) {
    function messageBox(entry) {
        return html`
            <div style="background-color: ${entry.color}" class="msgbox">
                <div class="meta-container">
                    <div class="domain-container">
                        <div class="nick">${entry.name}</div>
                        <div class="domain" onclick=${domainClick}>@${entry.portal}</div>
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

    function domainClick(e) {
        emit("newPortal", e.target.innerHTML.substr(1));
    }

    return html`
        <div>
            <div class="container">
                <div>
                    ${state.list.map(messageBox)}
                </div>
            </div>
            <div class="bar-container">
                <div class="input-bar">
                    <div class="console-cursor">${">"}</div>
                    <input onkeypress=${checkInput} id="console">
                </div>
                <div class="stats-bar">
                    <div class="stats-msg">
                        currently in ~
                    </div>
                    <div class="stats-msg">
                        uptime 2 hours
                    </div>
                </div>
            </div>
        </div>
    `
});

function checkInput(evt) {
    // enter was pressed
    if (evt.keyCode === 13) {
        // get the message 
        var message = $("console").value;
        console.log(message)
        // clear console
        $("console").value = ""; 
    }
}

// take another's feed and present them with boxes for input
// show the resulting rotonde.json for them to copy somewhere else
app.route("/generate", function(state) {
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

// select contents of the textarea that was clicked on
function jsonClick(e) {
    e.target.select();
}

// load portal for /generate
function portalClick() {
    var area = $("json-area");
    var url = $("url").value;
    try {
        fetchPortal(url)
        .then(function(portal) {
            if (portal === "undefined") {
                area.value = "couldn't fetch " + url + "\n" + err;
                return;
            }
            area.value = JSON.stringify(portal); // fill with stringified json
            area.scrollTop = area.scrollHeight; // scroll to bottom of textarea
    });
    } catch (err) {
        console.log("A MOTHERFLOWING ERROR", err);
    }
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
