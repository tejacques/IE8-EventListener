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