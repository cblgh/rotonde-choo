var rotonde = require("./rotonde-cli/rotonde-lib.js")
var commands = {"save": rotonde.save, "set": rotonde.attribute, "follow": rotonde.follow,
    "unfollow": rotonde.unfollow}

module.exports = function(message) {
    // set <color|location|name>=<value> for properties
    if (message.charAt(0) === "/") {
        var parts = message.substr(1).split(" ")
        var cmd = parts.splice(0, 1)[0]
        var content = parts
        if (cmd in commands && content.length) {
            if (cmd === "set" && content.length > 1) {
                var attribute = content.splice(0, 1)[0]
                var value = content.join(" ")
                commands["set"](attribute, value)
            } else {
                content = content.join(" ")
                commands[cmd](content)
            }
        } else {
            // default action is to write msg to feed
            rotonde.write(message)
        }
    }
}
