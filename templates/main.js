// import choo's template helper
var html = require("choo/html");

// export module
module.exports = function(state, emit) {
    // create html template
    return html`
        <div class="container">
            <div class="avatar"></div>
            <div class="msg">sup</div>
        </div>
    `
}
