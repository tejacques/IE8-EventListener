'use strict';
var utils = require('./storage/util');
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
            window.localStorage.removeItem(storageKey)
        }, _storage_key_timeout);
    }
}

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