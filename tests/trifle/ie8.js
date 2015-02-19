console.log("Running TrifleJS Tests");
var page = require('webpage').create();
var url = "http://localhost:9000";
var padRight = function (str, paddingValue, padChars) {
    var pad = paddingValue;
    while(pad.length + str.length < padChars) {
        pad += paddingValue;
    }
    return String(str + pad).slice(0, str.length + padChars);
};
var tests = {};
var test = function (name, fn) {
    try {
        tests[name] = fn();
    } catch (e) {
        tests[name] = false;
    }
    var val = tests[name];
    //console.log(tests);
    //console.log(name + ': ' + val);
    console.log(padRight(name, ' ', 40) + ': ' + val);
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
    console.log('\nPassing: ' + testPass + '/' + testNum);
};
var finalize = function () {
    printTests();
    page.evaluate(function () {
        localStorage.clear();
    });
    phantom.exit();
};
page.open(url, function (status) {
    try {

        test('page loaded', function () {
            return status === 'success';
        });

        test('localStorage written correctly', function () {
            var len = page.evaluate(function () {
                localStorage.clear();
                var btn = document.getElementById('send2');
                btn.onclick();
                window.dispatchEvent(new Event('storage'));
                return localStorage.length;
            });

            //console.log('len: ' + len);
            return len == 3;
        });

        console.log('about to run setTimeout');

        setTimeout(function () {
            console.log('in setTimeout');
            //console.log("retrieving DOM");
            var numP = page.evaluate(function () {
                return document.querySelectorAll('p').length;
                // return document.body.innerHTML
            });
            //console.log('# p tags: ' + numP)
            test('storage events handled correctly', function () {
                return numP == 2;
            });
            finalize();
        }, 1000);
    } catch (e) {
        console.log("error", e);
        phantom.exit();
    }
});
