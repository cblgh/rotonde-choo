var rotonde = require("./rotonde-cli/rotonde-lib.js")
module.exports = function(message) {
    // set <color|location|name>=<value> for properties
    rotonde.write(message)
    console.log(message)
}
