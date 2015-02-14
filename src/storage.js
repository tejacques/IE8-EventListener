; (function (define) { define('storage', function (require, exports, module) {
    'use strict';
    var utils = require('storage/util');
    var _storage_key_prefix = utils.prefix;
    var _storage_keys_set = utils.sent;
    var _storage_key = utils.storageKey;
    var _storage_key_timeout = utils.timeout;

    var storageSetItem = function (key, val) {
        var oldValue = window.localStorage.getItem(key);

        if (val !== null || oldValue !== null) {
            var storageKey = _storage_key();
            window.localStorage.setItem(storageKey, JSON.stringify({
                key: key,
                oldValue: oldValue,
                newValue: val
            }));

            setTimeout(function () {
                window.localStorage.removeItem(storageKey);
            }, _storage_key_timeout);
        }
    };

    var storage = 'onstorage' in document ? {
        setItem: function (key, val) {
            storageSetItem(key, val);
            window.localStorage.setItem(key, val);
        },
        getItem: function (key) {
            return window.localStorage.getItem(key);
        },
        removeItem: function (key) {
            storageSetItem(key, null);
            window.localStorage.removeItem(key);
        }
    } : window.localStorage;

    module.exports = storage;
    
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