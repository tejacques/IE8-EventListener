var webPage = require('webpage');
var page = webPage.create();
var system = require('system');
page.onInitialized = function () {
    console.log("Initialized");
};
page.onCallback = function(data) {
    console.log('CALLBACK: ' + JSON.stringify(data));
  // Prints 'CALLBACK: { "hello": "world" }'
};
page.onConsoleMessage = function (msg) {
    console.log(msg);
};
page.evaluate(function () {
    callPhantom({ hello: 'world' });
});
//page.open('about:blank', function (status) {
//    page.evaluate(function () {
//        callPhantom({ hello: 'back' });
//    });
    
//});
page.open('http://localhost:9000/trifle_test2.html', function (status) {
    phantom.exit();
    system.stdout.write("test");
});