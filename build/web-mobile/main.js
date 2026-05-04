window.boot = function () {
    var settings = window._CCSettings;
    window._CCSettings = undefined;
    var onProgress = null;

    var RESOURCES = cc.AssetManager.BuiltinBundleName.RESOURCES;
    var INTERNAL = cc.AssetManager.BuiltinBundleName.INTERNAL;
    var MAIN = cc.AssetManager.BuiltinBundleName.MAIN;
    function setLoadingDisplay() {
        // Loading splash scene
        var splash = document.getElementById('splash');
        var progressBar = splash.querySelector('.progress-bar span');
        onProgress = function (finish, total) {
            var percent = 100 * finish / total;
            if (progressBar) {
                progressBar.style.width = percent.toFixed(2) + '%';
            }
        };
        splash.style.display = 'block';
        progressBar.style.width = '0%';

        cc.director.once(cc.Director.EVENT_AFTER_SCENE_LAUNCH, function () {
            splash.style.display = 'none';

            if (cc.sys.isMobile && window.screenfull.isEnabled) {
                window.screenfull.on('change', () => {
                    onResize();
                });
            }
            onResize();
        });
    }

    var onStart = function () {

        cc.view.enableRetina(true);
        cc.view.resizeWithBrowserSize(true);

        if (cc.sys.isBrowser) {
            setLoadingDisplay();
        }

        if (cc.sys.isMobile) {
            if (settings.orientation === 'landscape') {
                cc.view.setOrientation(cc.macro.ORIENTATION_PORTRAIT);
            }
            else if (settings.orientation === 'portrait') {
                cc.view.setOrientation(cc.macro.ORIENTATION_PORTRAIT);
            }
            // cc.view.enableAutoFullScreen([
            //     cc.sys.BROWSER_TYPE_BAIDU,
            //     cc.sys.BROWSER_TYPE_BAIDU_APP,
            //     cc.sys.BROWSER_TYPE_WECHAT,
            //     cc.sys.BROWSER_TYPE_MOBILE_QQ,
            //     cc.sys.BROWSER_TYPE_MIUI,
            //     cc.sys.BROWSER_TYPE_HUAWEI,
            //     cc.sys.BROWSER_TYPE_UC,
            // ].indexOf(cc.sys.browserType) < 0);
        }

        cc.view.setOrientation(cc.macro.ORIENTATION_PORTRAIT);

        // Limit downloading max concurrent task to 2,
        // more tasks simultaneously may cause performance draw back on some android system / browsers.
        // You can adjust the number based on your own test result, you have to set it before any loading process to take effect.
        if (cc.sys.isBrowser && cc.sys.os === cc.sys.OS_ANDROID) {
            cc.assetManager.downloader.maxConcurrency = 2;
            cc.assetManager.downloader.maxRequestsPerFrame = 2;
        }

        var launchScene = settings.launchScene;
        var bundle = cc.assetManager.bundles.find(function (b) {
            return b.getSceneInfo(launchScene);
        });

        bundle.loadScene(launchScene, null, onProgress,
            function (err, scene) {
                if (!err) {
                    cc.debug.setDisplayStats(false);
                    cc.director.runSceneImmediate(scene);
                    if (cc.sys.isBrowser) {
                        // show canvas
                        var canvas = document.getElementById('GameCanvas');
                        canvas.style.visibility = '';
                        var div = document.getElementById('GameDiv');
                        if (div) {
                            div.style.backgroundImage = '';
                        }
                        console.log('Success to load scene: ' + launchScene);
                    }
                }
            }
        );

    };

    var option = {
        id: 'GameCanvas',
        debugMode: settings.debug ? cc.debug.DebugMode.INFO : cc.debug.DebugMode.ERROR,
        showFPS: settings.debug,
        frameRate: 60,
        groupList: settings.groupList,
        collisionMatrix: settings.collisionMatrix,
    };

    cc.assetManager.init({
        bundleVers: settings.bundleVers,
        remoteBundles: settings.remoteBundles,
        server: settings.server
    });

    var bundleRoot = [INTERNAL];
    settings.hasResourcesBundle && bundleRoot.push(RESOURCES);

    var count = 0;
    function cb(err) {
        if (err) return console.error(err.message, err.stack);
        count++;
        if (count === bundleRoot.length + 1) {
            cc.assetManager.loadBundle(MAIN, function (err) {
                if (!err) cc.game.run(option, onStart);
            });
        }
    }

    cc.assetManager.loadScript(settings.jsList.map(function (x) { return 'src/' + x; }), cb);

    for (var i = 0; i < bundleRoot.length; i++) {
        cc.assetManager.loadBundle(bundleRoot[i], cb);
    }
};

if (window.jsb) {
    var isRuntime = (typeof loadRuntime === 'function');
    if (isRuntime) {
        require('src/settings.js');
        require('src/cocos2d-runtime.js');
        if (CC_PHYSICS_BUILTIN || CC_PHYSICS_CANNON) {
            require('src/physics.js');
        }
        require('jsb-adapter/engine/index.js');
    }
    else {
        require('src/settings.js');
        require('src/cocos2d-jsb.js');
        if (CC_PHYSICS_BUILTIN || CC_PHYSICS_CANNON) {
            require('src/physics.js');
        }
        require('jsb-adapter/jsb-engine.js');
    }

    cc.macro.CLEANUP_IMAGE_CACHE = true;
    window.boot();
}



function onResize() {
    /**IOS RELATED */
    // if (cc.sys.os == cc.sys.OS_IOS) {
    //     if (window.innerHeight >= document.documentElement.clientHeight) {
    //         document.getElementById("swipeup").style.visibility = "hidden";
    //         window.scrollTo(0, 0);
    //         cc.director.resume();
    //         // document.body.style.height = '100%';
    //     } else {
    //         //  document.body.style.height=150%;
    //         document.getElementById("swipeup").style.visibility = "visible";
    //         cc.director.pause();
    //         //  document.body.style.height = '101%';
    //         //  document.body.style.top = '1%';
    //         window.scrollTo(0, document.body.style.height);
    //         //  document.getElementById("GameCanvas").style.visibility = "visible";
    //     }
    // }
    // if (cc.sys.isMobile) {
    var w = window.innerWidth;
    var h = window.innerHeight;
    var ratio = w / h;
    // Show noportrait message when device is in landscape mode (width > height)
    // if (ratio > 1) {
    //     // Landscape - show message to rotate device
    //     document.getElementById("noportrait").style.visibility = "visible";
    // } else {
    //     // Portrait - hide message, game can be played
    //     document.getElementById("noportrait").style.visibility = "hidden";
    // }
    // }
    /** */
    // var defaultHeight, defaultWidth;
    // defaultWidth = 864;
    // defaultHeight = 486;

    // var w = window.outerWidth;
    // var h = window.outerHeight;

    // // console.log("RESIZE IS ", w, h)

    // if (w < defaultWidth) {
    //     w = defaultWidth;
    //     h = defaultHeight;
    //     resizeWin(w, h);
    //     return;
    // }
    // if (h < defaultHeight) {
    //     h = defaultHeight;
    //     w = defaultWidth;
    //     resizeWin(w, h);
    //     return;
    // }

    // var ratio = w / h;
    // // console.log("RESIZE IS ", w, h, ratio)
    // if (ratio > 1.74 && ratio < 1.80) { // ratio lies between 16:9 to 4:3
    if (cc.sys.isMobile && window.screenfull.isEnabled) {
        if (window.screenfull.isFullscreen) {
            document.getElementById("swipeup").style.visibility = "hidden";
            cc.director.resume();
        } else {
            document.getElementById("swipeup").style.visibility = "visible";
            document.getElementById('swipeup').addEventListener('click', () => {
                if (window.screenfull.isEnabled) {
                    window.screenfull.request();
                }
            });
            cc.director.pause();
            window.scrollTo(0, document.body.style.height);
        }
    }
}
