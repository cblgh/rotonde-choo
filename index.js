// various node libs used to handle file i/o
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
// to handle the rotonde specific stuff
var util = require("./rotonde-cli/rotonde-utils.js")
var rotonde = require("./rotonde-cli/rotonde-lib.js")
// to connect rotonde with dat
var hyperotonde = require("/Users/cblgh/code/hyperotonde/hyperotonde.js")
archive = hyperotonde(path.resolve(util.dir, "rotonde.archive"))
// parses messages for --url, --media
var minimist = require("minimist")
// lets you write nicer `template strings` across line breaks
var dedent = require("dedent")
// print archive key
archive.key().then(function(key) { console.log("btw ur key is %s", key) })

// upload media links on the filesystem to dat
// returns {dat: "dat://<archive-key>/<filename>", http: "http://<dat endpoint>/<filename>"}
function mediaLink(link) {
    return new Promise(function(resolve, reject) {
        // links to a web resource
        var protocolIndex = link.indexOf("://") 
        if (protocolIndex > -1) {
            resolve({"http": link, "dat": ""})
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

function saveArchive() {
    util.settings().then(function(settings) {
        archive.save(settings["rotonde location"])
    })
}

function fetchPortal(portal) {
    if (portal && portal.indexOf("http") < 0) {
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

function formatPortalInfo(portal) {
    return dedent`
        ${portal.profile.name} in ${portal.profile.location} ${portal.profile.color} 
        ${portal.feed.length} entries following ${portal.portal.length}`
}

function formatPost(post, portal, domain) {
    // adding its properties to each entry
    post.avatar = portal.profile.avatar
    post.color = portal.profile.color
    post.portal = domain
    post.name = portal.profile.name
    return post
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
app.use(function(state, emitter) {
    state.isHome = true
    // set he console's placeholder to be empty initially
    state.placeholder = ""
    state.archiveKey = ""
    // holds the local portal's info for displaying posts in the feed after writing
    state.portal = {}
    state.datEndpoint = "dat endpoint not configured"
    state.feedbackMsg = ""
    state.fadeInOut = ""
    state.posts = []

    loadLocal()

    function populateDatHeader() {
        archive.key().then(function(key) {
            state.archiveKey = key
            return util.settings()
        })
        .then(function(settings) {
            state.datEndpoint = settings["dat endpoint"] || "dat endpoint not configured"
        })
    }

    function loadLocal() {
        state.isHome = true
        // read local data first, populating the feed
        util.data().then(function(data) {
            var localPortal = data[0]
            localPortal.feed.map(function(entry) {
                console.log(entry)
                addFromFeed(entry, localPortal, "localhost")
            })
            state.portal = localPortal
            processPortals(localPortal)
        })
    }

    // called when a link is clicked
    function process(portalUrl) {
        state.isHome = false
        fetchPortal(portalUrl).then(function(base) {processPortals(base) })
    }

    function addFromFeed(entry, portal, domain) {
        entry = formatPost(entry, portal, domain)
        // and pushing it onto our timeline feed
        state.posts.push(entry)
    }

    function processPortals(base) {
        populateDatHeader()
        // for each portal i follow
        state.placeholder = formatPortalInfo(base)
        base.portal.map(function (portalDomain) {
            // get its contents
            console.log("fetching", portalDomain)
            fetchPortal(portalDomain).then(function(portal) {
                // then process its entries
                portal.feed.map(function(entry) {
                    addFromFeed(entry, portal, portalDomain)
                })
                // sort entries with newest at the top of the page
                emitter.emit("addPost")
            })
            .catch(function(err) {
                console.log("err fetching %s", portalDomain)
                console.log(err)
            })
        })
    }

    emitter.on("newPortal", function(data) {
        // reset state
        state.posts = []
        // redraw page
        process(data)
        emitter.emit("render")
    })

    emitter.on("home", function() {
        // reset state
        state.posts = []
        loadLocal()
    })

    emitter.on("addPost", function() {
        state.posts.sort(compare)
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


    // commented out the rotonde logo animation as choo's render causes it to lag momentarily
    // place under id="rotonde" if fix is found
    // <animateTransform attribute="xml"
    //     attributeName="transform" 
    //     type="rotate"
    //     from="0 150 150"
    //     to="360 150 150"
    //     dur="12s"
    //     repeatCount="indefinite"/>
    function logo() {
        return html`
            <svg width="10%" height="10%" viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"  version="1.1" style="fill:none;stroke:white;stroke-width:28px;stroke-linecap:square;">
            <g id="rotonde" transform="rotate(0,150,150)">
                  <g transform="translate(150,150),rotate(120,0,0)">
                    <path d="M-15,-100 a90,90 0 0,1 90,90 l0,60"/>   
                  </g>
                  <g transform="translate(150,150),rotate(240,0,0)">
                    <path d="M-15,-100 a90,90 0 0,1 90,90 l0,60"/>   
                  </g>
                  <g transform="translate(150,150),rotate(0,0,0)">
                    <path d="M-15,-100 a90,90 0 0,1 90,90 l0,60"/>   
                  </g>
              </g>
            </svg>
            `
    }

    return html`
        <div>
        <div class="info-container">
            <div id="dat-key">${state.archiveKey}</div>
            <div id="dat-endpoint">${state.datEndpoint}</div>
            <div class=${state.fadeInOut} id="feedback">${state.feedbackMsg}</div>
        </div>
        <div class="header" onclick=${home}>
            ${logo()}
        </div>
            <div class="container">
                <div>
                    ${state.posts.map(messageBox)}
                </div>
            </div>
            <div class="bar-container">
                <div class="input-bar">
                    <div class="console-cursor">${">"}</div>
                    <input placeholder=${state.placeholder} autofocus onkeypress=${checkInput} id="console">
                </div>
            </div>
        </div>
    `
    function home() {
        return new Promise(function(resolve, reject) {
            emit("home")
            resolve()
        })
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

    function setDatEndpoint(endpoint) {
        return util.settings().then(function(settings) {
            // if endpoint is missing protocol assume http
            // (if it's actually https then most webservers will automatically redirect)
            if (endpoint.indexOf("://") < 0) {
                endpoint = "http://" + endpoint
            }
            settings["dat endpoint"] = endpoint
            state.datEndpoint = endpoint
            util.saveSettings(settings)
        })
    }

    function handleInput(message) {
        var argv = minimist(message.split(" "))
        var commands = {
            "save": rotonde.save, "set": rotonde.attribute, "follow": rotonde.follow, 
            "unfollow": rotonde.unfollow, "endpoint": setDatEndpoint, "home": home
        }

        return new Promise(function(resolve, reject) {
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
                        state.feedbackMsg = attribute + " updated"
                        if (attribute === "avatar") {
                            mediaLink(value).then(function(value) {
                                var httpLink = value["http"]
                                rotonde.attribute(attribute, httpLink).then(resolve)
                            })
                        } else {
                            rotonde.attribute(attribute, value).then(resolve)
                        }
                    } else if (cmd === "save") {
                        var jsonLocation = content.join(" ")
                        state.feedbackMsg = "now using " + jsonLocation
                        // save to file
                        rotonde.save(jsonLocation).then(resolve)
                    }  else {
                        content = content.join(" ")
                        state.feedbackMsg = cmd + " " + content
                        commands[cmd](content).then(resolve)
                    }
                }
            // the default action is to write to your feed
            } else {
                function createPost(message) {
                    var post = {text: message, time: parseInt((new Date).getTime() / 1000)}
                    post = formatPost(post, state.portal, "localhost")
                    state.posts.push(post)
                    emit("addPost")
                }
                // if the message had --media <media-path>
                if (argv.media) {
                    // check to see if it was a http link or a path on this computer
                    mediaLink(argv.media).then(function(link) {
                        message = message.replace(argv.media, link["http"])
                        createPost(message)
                        rotonde.write(message).then(resolve)
                    }).catch(function() {
                        console.error("noo it didnt exist :<")
                    })
                } else {
                    createPost(message)
                    rotonde.write(message).then(resolve)
                }
            }
        })
        .then(saveArchive)
        .catch(function(err) {
            state.feedbackMsg = "error: " + err.code
            console.log(err)
        })
        .then(function() {
            state.fadeInOut = "fader"
            setTimeout(function() {
                state.fadeInOut = ""
                state.feedbackMsg = "" 
                emit("render")
            }, 1200)
            util.data().then(function(data) {
                var portal = data[0]
                // console shows portal we're at currently,
                // if that portal is our portal, the update the console information
                if (state.isHome) {
                    state.placeholder = formatPortalInfo(portal)
                }
                // redraw page
                emit("render")
            })
        })
    }
})

// start app
app.mount("div")
