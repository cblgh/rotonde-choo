var path = require("path")
var fs = require("fs")
var osenv = require("osenv")
var url = require("url")
// import choo
var choo = require("choo")
// import choo's template helper
var html = require("choo/html")
// initialize choo
var app = choo()
// alias document.getElementById for convenience
var $ = document.getElementById.bind(document)
//  manage files and URLs using their default applications
var shell = require("electron").shell
var util = require("./rotonde-cli/rotonde-utils.js")
// to handle the rotonde specific stuff
var rotonde = require("./rotonde-cli/rotonde-lib.js")
// to connect rotonde with dat
var hyperotonde = require("/Users/cblgh/code/hyperotonde/hyperotonde.js")
archive = hyperotonde(path.resolve(util.dir, "rotonde.archive"))
// parses messages for --url, --media
var minimist = require("minimist")

// print archive key
archive.key().then(function(key) { console.log("btw ur key is %s", key) })

// upload media links on the filesystem to dat
function mediaLink(link) {
    return new Promise(function(resolve, reject) {
        // links to a web resource
        var protocolIndex = link.indexOf("://") 
        if (protocolIndex > -1) {
            return link
        } else {
            // assume it is a file on this computer
            link = link.replace("~", osenv.home())
            fs.stat(link, function(err, stat) {
                if (err == null) {
                    // file exists
                    // add it to the dat archive
                    archive.add(link).then(function() {
                        return archive.key()
                    })
                    // return path as dat://<archiveKey>/<filename> &&
                    // https://<dat-endpoint>/<filename>
                    // (e.g. https://rotonde3-cblgh.hashbase.io/<filename>)
                    .then(function(key) {
                        var file = path.basename(link)
                        link = {"dat": "dat://" + key + "/" + file}
                        // load the dat endpoint from the settings file
                        util.settings().then(function(settings) {
                            link["http"] = url.resolve(settings["dat endpoint"], file)
                            resolve(link)
                        })
                    })
                } else if (err.code == "ENOENT") {
                    console.error("file %s doesn't exist!", link)
                    reject()
                }
            })
        }
    })
}

function setDatEndpoint(endpoint) {
    util.settings().then(function(settings) {
        settings["dat endpoint"] = endpoint
        util.saveSettings(settings)
    })
}


function saveArchive() {
    util.settings().then(function(settings) {
        archive.save(settings["rotonde location"])
    })
}

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
    // create state.list
    state.list = []
    loadLocal()

    function loadLocal() {
        // read local data first, populating the feed
        util.data().then(function(data) {
            var base = data[0]
            processPortals(base)
        })
    }

    // called when a link is clicked
    function process(portalUrl) {
        state.list = [] // clear list
        fetchPortal(portalUrl).then(function(base) {processPortals(base) })
    }

    function processPortals(base) {
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
    emitter.on("home", function() {
        loadLocal()
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
    function home() {
        emit("home")
    }

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

    function handleInput(message) {
        var argv = minimist(message.split(" "))
        var commands = {"save": rotonde.save, "set": rotonde.attribute, "follow": rotonde.follow, "unfollow":
            rotonde.unfollow, "endpoint": setDatEndpoint, "home": home
        }
        // we're dealing with a command (or a typo)
        if (message.charAt(0) === "/") {
            var parts = message.substr(1).split(" ")
            var cmd = parts.splice(0, 1)[0]
            var content = parts

            if (cmd in commands) {
                // set <color|location|name>=<value> for properties
                if (cmd === "set" && content.length > 1) {
                    var attribute = content.splice(0, 1)[0]
                    var value = content.join(" ")
                    rotonde.set(attribute, value)
                } else if (cmd === "save") {
                    var jsonLocation = content.join(" ")
                    // save to file
                    rotonde.save(jsonLocation)
                }  else {
                    content = content.join(" ")
                    commands[cmd](content)
                }
            }
        // we don't allow writing messages starting with / as 99% time they'll just be typos of commands
        } else {
            // default action is writing to your feed
            if (argv.media) {
                console.log(argv.media)
                mediaLink(argv.media).then(function(link) {
                    message = message.replace(argv.media, link["http"])
                    rotonde.write(message).then(saveArchive)
                }).catch(function() {
                    console.error("noo it didnt exist :<")
                })
            } else {
                rotonde.write(message).then(saveArchive)
            }
        }
    }
})


// start app
app.mount("div")
