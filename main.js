const electron = require("electron")
const app = electron.app
const Menu = electron.Menu
const BrowserWindow = electron.BrowserWindow

const path = require("path")
const url = require("url")
// allow right-clicking for a context menu, copy paste etc
require("electron-context-menu")()

let mainWindow
function createWindow () {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600
        // icon: path.join(__dirname, "./images/rotonde.svg")
    })
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, "index.html"),
        protocol: "file:",
        slashes: true
    }))

    // mainWindow.webContents.openDevTools()

    mainWindow.on("closed", function () {
        mainWindow = null
    })

    var template = [{
        label: "Application",
        submenu: [
            { label: "About Application", selector: "orderFrontStandardAboutPanel:" },
            { type: "separator" },
            { label: "Quit", accelerator: "Command+Q", click: function() { app.quit(); }}
        ]}, {
            label: "Edit",
            submenu: [
                { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
                { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
                { type: "separator" },
                { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
                { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
                { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
                { label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" }
            ]}
    ];

    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

app.on("ready", createWindow)
app.on("window-all-closed", function () {
    if (process.platform !== "darwin") {
        app.quit()
    }
})

app.on("activate", function () {
    if (mainWindow === null) {
        createWindow()
    }
})

