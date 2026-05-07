const { app, BrowserWindow, session } = require("electron");
const path = require("path");
const os = require("os");
const fs = require("fs");

let mainWindow;

// Find MetaMask extension across all major Chromium browsers and all profiles (Mac + Windows)
function findMetaMaskExtensionPath() {
    const home = os.homedir();
    const id = "nkbihfbeogaeaoehlefnkodbefgpgknn";
    const local = process.env.LOCALAPPDATA || path.join(home, "AppData", "Local");
    const roaming = process.env.APPDATA || path.join(home, "AppData", "Roaming");

    // Browser root directories (contain profile folders like Default, Profile 1, Profile 2...)
    const browserRoots = process.platform === "darwin"
        ? [
            `${home}/Library/Application Support/Google/Chrome`,
            `${home}/Library/Application Support/BraveSoftware/Brave-Browser`,
            `${home}/Library/Application Support/Microsoft Edge`,
            `${home}/Library/Application Support/Vivaldi`,
            `${home}/Library/Application Support/Chromium`,
            `${home}/Library/Application Support/com.operasoftware.Opera`,
          ]
        : [
            path.join(local, "Google", "Chrome", "User Data"),
            path.join(local, "BraveSoftware", "Brave-Browser", "User Data"),
            path.join(local, "Microsoft", "Edge", "User Data"),
            path.join(local, "Vivaldi", "User Data"),
            path.join(local, "Chromium", "User Data"),
            path.join(roaming, "Opera Software", "Opera Stable"),
          ];

    for (const root of browserRoots) {
        try {
            if (!fs.existsSync(root)) continue;
            // Check all profiles: Default, Profile 1, Profile 2, Profile 3 ...
            const profiles = ["Default", ...fs.readdirSync(root).filter(f => f.startsWith("Profile"))];
            for (const profile of profiles) {
                const base = path.join(root, profile, "Extensions", id);
                if (!fs.existsSync(base)) continue;
                const versions = fs.readdirSync(base)
                    .filter(f => fs.statSync(path.join(base, f)).isDirectory())
                    .sort();
                if (versions.length > 0) {
                    return path.join(base, versions[versions.length - 1]);
                }
            }
        } catch (_) {}
    }
    return null;
}

// Load MetaMask extension before window opens so window.ethereum is injected
async function tryLoadMetaMask() {
    const extPath = findMetaMaskExtensionPath();
    if (!extPath) {
        console.log("[MetaMask] Extension not found in any browser — WalletConnect QR will be used");
        return;
    }
    try {
        await session.defaultSession.loadExtension(extPath, { allowFileAccess: true });
        console.log("[MetaMask] Extension loaded from:", extPath);
    } catch (e) {
        console.warn("[MetaMask] Failed to load extension:", e.message, "— WalletConnect QR will be used");
    }
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1920,
        height: 1080,
        minWidth: 1280,
        minHeight: 720,
        autoHideMenuBar: true,
        backgroundColor: "#000000",
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: false,
            webSecurity: false
        }
    });

    mainWindow.loadFile(path.join(__dirname, "build/web-mobile/index.html"));
    mainWindow.maximize();

    // F12 to toggle DevTools (before-input-event works reliably in packaged exe)
    mainWindow.webContents.on("before-input-event", (event, input) => {
        if (input.key === "F12" && input.type === "keyDown") {
            mainWindow.webContents.toggleDevTools();
        }
    });

    mainWindow.webContents.on("context-menu", (e) => {
        e.preventDefault();
    });
}

// Extension MUST be loaded before window creation for window.ethereum to be injected
app.whenReady().then(async () => {
    await tryLoadMetaMask();
    createWindow();
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
