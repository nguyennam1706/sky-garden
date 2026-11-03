// Loads the pinned Firebase JS SDK and exposes window.skyGardenFirebase, a promise that the
// FirebaseBridge.jslib waits on. Unity starts loading in parallel; the bridge only needs Firebase
// once C# makes its first call.
(function () {
  var SDK_VERSION = "12.19.0";
  var base = "https://www.gstatic.com/firebasejs/" + SDK_VERSION + "/";
  var env = window.SKY_GARDEN_FIREBASE_ENV || "(unset)";
  var config = window.SKY_GARDEN_FIREBASE_CONFIG;

  function hasConfig(value) {
    return !!(value && value.apiKey && value.databaseURL && value.projectId && value.appId);
  }

  var ready = hasConfig(config)
    ? Promise.all([
        import(base + "firebase-app.js"),
        import(base + "firebase-auth.js"),
        import(base + "firebase-database.js"),
      ]).then(function (modules) {
        var appModule = modules[0];
        var authModule = modules[1];
        var databaseModule = modules[2];
        var app = appModule.initializeApp(config);
        return {
          env: env,
          app: app,
          auth: authModule.getAuth(app),
          db: databaseModule.getDatabase(app),
          sdk: {
            signInAnonymously: authModule.signInAnonymously,
            ref: databaseModule.ref,
            onValue: databaseModule.onValue,
            runTransaction: databaseModule.runTransaction,
            set: databaseModule.set,
            onDisconnect: databaseModule.onDisconnect,
            serverTimestamp: databaseModule.serverTimestamp,
          },
        };
      })
    : Promise.reject(new Error("Firebase config for env '" + env + "' is missing or incomplete (firebase-config." + env + ".js)"));

  ready.catch(function (error) {
    console.error("[Firebase] " + (error && error.message ? error.message : error));
  });

  window.skyGardenFirebase = ready;
})();
