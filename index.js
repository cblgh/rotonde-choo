// import choo
var choo = require("choo")
// import choo's template helper
var html = require("choo/html")
// initialize choo
var app = choo()
// load input handler
var handleInput = require("./handleInput.js")
// alias document.getElementById for convenience
var $ = document.getElementById.bind(document)
//  manage files and URLs using their default applications
var shell = require("electron").shell

function fetchPortal(portal) {
    if (portal.indexOf("http") < 0) {
        portal = "http://" + portal
    }
    return fetch(portal)
        .catch(function(err) {
            return err
        })
        .then(function(response) { 
        return response.json()
    })
}

app.use(function(state, emitter) {
    process("rotonde.cblgh.org") // set initial portal to mine

    function process(portalUrl) {
        state.list = [] // clear list
        fetchPortal(portalUrl).then(function(base) {
            // for each portal i follow
            base.portal.map(function (portalDomain) {
                // get its contents
                console.log("fetching", portalDomain)
                fetchPortal(portalDomain).then(function(portal) {
                    // then process its entries
                    portal.feed.map(function(entry) {
                        // adding its properties to each entry
                        entry.avatar = portal.profile.avatar
                        entry.color = portal.profile.color
                        entry.portal = portalDomain
                        entry.name = portal.profile.name
                        // and pushing it onto our timeline feed
                        state.list.push(entry)
                    }) 
                    // sort entries with newest at the top of the page
                    state.list.sort(compare)
                    emitter.emit("render")
                })
            })
        })
    }

    function compare(a, b) {
        var first = parseInt(a.time)
        var second = parseInt(b.time)
        if (first < second) {
            return 1
        } else if (first > second) {
            return -1
        }
        return 0
    }

    emitter.on("newPortal", function(data) {
        // redraw page
        process(data)
        emitter.emit("render")
    })
})

function link(entry, prop, text) {
    if (entry[prop]) {
        return html`<a href="${entry[prop]}" onclick=${loadOutsideApp}>${text}</a>`
    }
}

// open links that are clicked in the electron app using the default browser instead
function loadOutsideApp(evt) {
    evt.preventDefault()
    shell.openExternal(evt.target.href)
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
        emit("newPortal", e.target.innerHTML.substr(1))
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
                    <input autofocus placeholder="~/rotonde/rotonde.json  following 5  23 days ago  2 hours" onkeypress=${checkInput} id="console">
                </div>
            </div>
        </div>
    `
})

function checkInput(evt) {
    // enter was pressed
    if (evt.keyCode === 13) {
        // get the message 
        var message = $("console").value
        // clear console
        $("console").value = "" 
        handleInput(message)
    }
}

// start app
app.mount("div")
