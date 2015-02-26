var Reporter,
    USAGE,
    config,
    fs,
    mocha,
    reporter,
    system,
    webpage,
    bind = function (fn, me) {
        return function () {
            return fn.apply(me, arguments);
        };
    },
    sysargs;

system = require('system');
var jsfileIndex;
for(var idx=0; idx < system.args.length; idx++) {
    if (/\.js/.test(system.args[idx])) {
        jsfileIndex = idx;
    }
}

sysargs = system.args.slice(jsfileIndex);
sysargs.forEach(function(arg, index) {
    console.log('arg ' + index + ': ' + arg);
});

webpage = require('webpage');

fs = require('fs');

USAGE = "Usage: triflejs mocha-triflejs.js URL REPORTER [CONFIG]";

Reporter = (function () {
    function Reporter(reporter1, config1) {
        this.reporter = reporter1;
        this.config = config1;
        this.checkStarted = bind(this.checkStarted, this);
        this.waitForRunMocha = bind(this.waitForRunMocha, this);
        this.waitForInitMocha = bind(this.waitForInitMocha, this);
        this.waitForMocha = bind(this.waitForMocha, this);
        this.url = sysargs[1];
        this.columns = parseInt(system.env.COLUMNS || 75) * 0.75 | 0;
        this.mochaStartWait = this.config.timeout || 6000;
        this.startTime = Date.now();
        this.output = this.config.file ? fs.open(this.config.file, 'w') : system.stdout;
        if (!this.url) {
            this.fail(USAGE);
        }
    }

    Reporter.prototype.run = function () {
        this.initPage();
        return this.loadPage();
    };

    Reporter.prototype.customizeMocha = function (options) {
        return (Mocha.reporters.Base.window.width = options.columns);
    };

    Reporter.prototype.customizeOptions = function () {
        return {
            columns: this.columns
        };
    };

    Reporter.prototype.fail = function (msg, errno) {
        if (this.output && this.config.file) {
            this.output.close();
        }
        if (msg) {
            console.log(msg);
        }
        return phantom.exit(errno || 1);
    };

    Reporter.prototype.finish = function () {
        if (this.config.file) {
            this.output.close();
        }
        return phantom.exit(this.page.evaluate(function () {
            return mochaPhantomJS.failures;
        }));
    };

    Reporter.prototype.initPage = function () {
        var cookie, i, len, ref;
        this.page = webpage.create({
            settings: this.config.settings
        });
        if (this.config.headers) {
            this.page.customHeaders = this.config.headers;
        }
        ref = this.config.cookies || [];
        for (i = 0, len = ref.length; i < len; i++) {
            cookie = ref[i];
            this.page.addCookie(cookie);
        }
        if (this.config.viewportSize) {
            this.page.viewportSize = this.config.viewportSize;
        }
        this.page.onConsoleMessage = function (msg) {
            return system.stdout.writeLine(msg);
        };
        this.page.onResourceError = (function (_this) {
            return function (resErr) {
                if (!_this.config.ignoreResourceErrors) {
                    return system.stdout.writeLine("Error loading resource " + resErr.url + " (" + resErr.errorCode + "). Details: " + resErr.errorString);
                }
            };
        })(this);
        this.page.onError = (function (_this) {
            return function (msg, traces) {
                var file, index, j, len1, line, ref1;
                if (_this.page.evaluate(function () {
                        return !!window.onerror;
                })) {
                    return;
                }
                for (index = j = 0, len1 = traces.length; j < len1; index = ++j) {
                    ref1 = traces[index];
                    line = ref1.line;
                    file = ref1.file;
                    traces[index] = "    " + file + ":" + line;
                }
                return _this.fail(msg + "\n\n" + (traces.join('\n')));
            };
        })(this);
        return (this.page.onInitialized = (function (_this) {
            return function () {
                console.log("adding mochaPhantomJS to page");
                return _this.page.evaluate(function (env) {
                    return (window.mochaPhantomJS = {
                        env: env,
                        failures: 0,
                        ended: false,
                        started: false,
                        run: function () {
                            mochaPhantomJS.started = true;
                            window.callPhantom({
                                'mochaPhantomJS.run': true
                            });
                            return mochaPhantomJS.runner;
                        }
                    });
                }, system.env);
            };
        })(this));
    };

    Reporter.prototype.loadPage = function () {
        console.log("loading page");
        this.page.open(this.url);
        var _this = this;
        this.page.onLoadFinished = function (status) {
            console.log('load finished');
            _this.page.onLoadFinished = function () { };
            if (status !== 'success') {
                _this.onLoadFailed();
            }
            return _this.waitForInitMocha();
        };
        return (this.page.onCallback = (function (_this) {
            return function (data) {
                console.log('received callback');
                if (data ? data.hasOwnProperty('Mocha.process.stdout.write') : void 0) {
                    _this.output.write(data['Mocha.process.stdout.write']);
                } else if (data ? data.hasOwnProperty('mochaPhantomJS.run') : void 0) {
                    if (_this.injectJS()) {
                        _this.waitForRunMocha();
                    }
                } else if (typeof (data ? data.screenshot : void 0) === "string") {
                    _this.page.render(data.screenshot + ".png");
                }
                return true;
            };
        })(this));
    };

    Reporter.prototype.onLoadFailed = function () {
        return this.fail("Failed to load the page. Check the url: " + this.url);
    };

    Reporter.prototype.injectJS = function () {
        if (this.page.evaluate(function () {
                return !!window.mocha;
        })) {
            this.page.injectJs('mocha-triflejs/core_extensions.js');
            this.page.evaluate(this.customizeMocha, this.customizeOptions());
            return true;
        } else {
            this.fail("Failed to find mocha on the page.");
            return false;
        }
    };

    Reporter.prototype.runMocha = function () {
        var base, customReporter, wrappedReporter, wrapper;
        this.page.evaluate(function (config) {
            mocha.useColors(config.useColors);
            mocha.bail(config.bail);
            if (config.grep) {
                mocha.grep(config.grep);
            }
            if (config.invert) {
                return mocha.invert();
            }
        }, this.config);
        if (typeof (base = this.config.hooks).beforeStart === "function") {
            base.beforeStart(this);
        }
        if (this.page.evaluate(this.setupReporter, this.reporter) !== true) {
            customReporter = fs.read(this.reporter);
            wrapper = function () {
                var exports, module, process, require;
                require = function (what) {
                    var r;
                    what = what.replace(/[^a-zA-Z0-9]/g, '');
                    for (r in Mocha.reporters) {
                        if (r.toLowerCase() === what) {
                            return Mocha.reporters[r];
                        }
                    }
                    throw new Error("Your custom reporter tried to require '" + what + "', but Mocha is not running in Node.js in mocha-triflejs, so Node modules cannot be required - only other reporters");
                };
                module = {};
                exports = void 0;
                process = Mocha.process;
                // customreporter
                return (Mocha.reporters.Custom = exports || module.exports);
            };
            wrappedReporter = wrapper.toString().replace("'customreporter'", "(function() {" + (customReporter.toString()) + "})()");
            this.page.evaluate(wrappedReporter);
            if (this.page.evaluate(function () {
                    return !Mocha.reporters.Custom;
            }) || this.page.evaluate(this.setupReporter) !== true) {
                this.fail("Failed to use load and use the custom reporter " + this.reporter);
            }
        }
        if (this.page.evaluate(this.runner)) {
            this.mochaRunAt = new Date().getTime();
            return this.waitForMocha();
        } else {
            return this.fail("Failed to start mocha.");
        }
    };

    Reporter.prototype.waitForMocha = function () {
        var base, ended;
        ended = this.page.evaluate(function () {
            return mochaPhantomJS.ended;
        });
        if (ended) {
            if (typeof (base = this.config.hooks).afterEnd === "function") {
                base.afterEnd(this);
            }
            return this.finish();
        } else {
            console.log('setTimeout1');
            return setTimeout(this.waitForMocha, 100);
        }
    };

    Reporter.prototype.waitForInitMocha = function () {
        if (!this.checkStarted()) {
            console.log('setTimeout2');
            return setTimeout(this.waitForInitMocha, 100);
        }
    };

    Reporter.prototype.waitForRunMocha = function () {
        if (this.checkStarted()) {
            return this.runMocha();
        } else {
            console.log('setTimeout3');
            return setTimeout(this.waitForRunMocha, 100);
        }
    };

    Reporter.prototype.checkStarted = function () {
        var started;
        started = this.page.evaluate(function () {
            return mochaPhantomJS.started;
        });
        if (!started && this.mochaStartWait && this.startTime + this.mochaStartWait < Date.now()) {
            this.fail("Failed to start mocha: Init timeout", 255);
        }
        return started;
    };

    Reporter.prototype.setupReporter = function (reporter) {
        var error;
        try {
            mocha.setup({
                reporter: reporter || Mocha.reporters.Custom
            });
            return true;
        } catch (_error) {
            error = _error;
            return error;
        }
    };

    Reporter.prototype.runner = function () {
        var cleanup, error, ref, ref1;
        try {
            mochaPhantomJS.runner = mocha.run();
            if (mochaPhantomJS.runner) {
                cleanup = function () {
                    mochaPhantomJS.failures = mochaPhantomJS.runner.failures;
                    return (mochaPhantomJS.ended = true);
                };
                if ((ref = mochaPhantomJS.runner) ? (ref1 = ref.stats) ? ref1.end : void 0 : void 0) {
                    cleanup();
                } else {
                    mochaPhantomJS.runner.on('end', cleanup);
                }
            }
            return !!mochaPhantomJS.runner;
        } catch (_error) {
            error = _error;
            return false;
        }
    };

    return Reporter;

})();

//if (phantom.version.major < 1 || (phantom.version.major === 1 && phantom.version.minor < 9)) {
//    console.log('mocha-triflejs requires PhantomJS > 1.9.1');
//    phantom.exit(-1);
//}

reporter = sysargs[2] || 'spec';

config = JSON.parse(sysargs[3] || '{}');

if (config.hooks) {
    config.hooks = require(config.hooks);
} else {
    config.hooks = {};
}

mocha = new Reporter(reporter, config);

mocha.run();
