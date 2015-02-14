; (function (define) { define('storage/util', function (require, exports, module) {
    'use strict';
    var _storage_key_prefix = '_storage_key';
    var _storage_keys_set = 0;
    var _storage_key = function () {
        return [
            _storage_key_prefix,
            (+new Date()),
            _storage_keys_set++,
            Math.random()
        ].join('-');
    };

    var _storage_key_timeout = 10 * 1000; // 10 seconds

    module.exports = {
        prefix: _storage_key_prefix,
        sent: _storage_keys_set,
        storageKey: _storage_key,
        timeout: _storage_key_timeout
    };

/*!
 * UMD/AMD/Global context Module Loader wrapper
 * based off https://gist.github.com/wilsonpage/8598603
 *
 * This wrapper will try to use a module loader with the
 * following priority:
 *
 *  1.) AMD
 *  2.) CommonJS
 *  3.) Context Variable (window in the browser)
 */
});})(typeof define == 'function' && define.amd ? define
    : (function (context) {
        'use strict';
        return typeof module == 'object' ? function (name, factory) {
            factory(require, exports, module);
        }
        : function (name, factory) {
            var module = {
                exports: {}
            };
            var require = function (n) {
                if (n === 'jquery') {
                    n = 'jQuery';
                }
                return context[n];
            };

            factory(require, module.exports, module);
            context[name] = module.exports;
        };
    })(this));