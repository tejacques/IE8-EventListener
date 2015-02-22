var page = require('webpage').create();
var url = "http://192.168.50.1:9000/mocha_test.html";
var log = function() {
    console.log.apply(console, arguments);
    console.log('');
};
var padRight = function (str, paddingValue, padChars) {
    var pad = paddingValue;
    while(pad.length + str.length < padChars) {
        pad += paddingValue;
    }
    return String(str + pad).slice(0, str.length + padChars);
};
var tests = {};

log('Running TrifleJS Tests');
log('');


var test = function (name, expected, actualFn) {
    var val;
    var actual;
    try {
        actual = actualFn();
        val = expected === actual;
    } catch (e) {
        actual = e;
        val = false;
    }
    tests[name] = val;
    var padded = padRight(name, ' ', 40) + ': ';
    if (val) {
        log(padded + 'pass');
    } else {
        log(padded + 'fail, expected: ' + expected + ' but was: ' + actual);
    }
};
var printTests = function () {
    var testNum = 0;
    var testPass = 0;
    for (var test in tests) {
        testNum++;
        
        if (tests[test]) {
            testPass++;
        }
    }
    log('');
    log('Passing: ' + testPass + '/' + testNum);
};

var finalize = function () {
    
    test('storage should be clear', 0, function () {
        return page.evaluate(function () {
            localStorage.clear();
            return localStorage.length;
        });
    });
    printTests();
    phantom.exit();
};
page.open(url, function (status) {
    try {
        test('page loaded successfully', 'success', function () {
            return status;
        });

        test('localStorage is object', 'object', function() {
            return page.evaluate(function() {
                return typeof window.localStorage;
            });
        });

        test('browser is IE8', 8, function () {
            return page.evaluate(function() {
                var getInternetExplorerVersion = function() {
                    // Returns the version of Internet Explorer or a -1
                    // (indicating the use of another browser).
                    var rv = -1; // Return value assumes failure.
                    if (navigator.appName == 'Microsoft Internet Explorer') {
                        var ua = navigator.userAgent;
                        var re  = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
                        if (re.exec(ua) !== null) {
                            rv = parseFloat( RegExp.$1 );
                        }
                    }
                    return rv;
                };

                return getInternetExplorerVersion();
            });
        });

        console.log('out here');
        console.log(setTimeout);
        setTimeout(function () {
            console.log('In here');
        }, 0);
    } catch (e) {
        log("error", e);
        phantom.exit();
    }
});
