const { app, BrowserWindow } = require("electron");
const path = require("path");

let mainWindow;

function createWindow() {

    mainWindow = new BrowserWindow({

        width: 1920,
        height: 1080,

        // Prevent window becoming too small
        minWidth: 1280,
        minHeight: 720,

        // UI improvements
        autoHideMenuBar: true,
        backgroundColor: "#000000",

        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    // Load Cocos build
    mainWindow.loadFile(
        path.join(__dirname, "build/web-mobile/index.html")
    );

    // Start maximized
    mainWindow.maximize();

    // Optional: disable right-click menu
    mainWindow.webContents.on("context-menu", (e) => {
        e.preventDefault();
    });

}

// Create window
app.whenReady().then(createWindow);

// Quit when all windows closed
app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

// Mac behavior
app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});