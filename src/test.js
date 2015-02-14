; (function (define) { define('test', function (require, exports, module) {
    'use strict';

    var storage = require('storage');
    var ie8eventListener = require('ie8-eventlistener');

    //window.storage = storage;

    var addTextToBody = function (text) {
        var node = document.createElement("p");
        var textNode = document.createTextNode(text);
        node.appendChild(textNode);
        document.body.appendChild(node);
    };

    var send = function (key, message) {
        storage.setItem(key, message);
    };

    var receive = function (e) {
        var value = e.newValue;
        addTextToBody('received Message[' + e.key + ']: ' + value);
    };

    var createButton = function (id) {
        var button = document.createElement('button');
        button.id = id;
        var textNode = document.createTextNode(id);
        button.appendChild(textNode);
        document.body.appendChild(button);

        return button;
    };


    var button = createButton('send');
    button.onclick = function () {
        send("message", "message " + (Math.random() * 1000 | 0));
    };

    var button2 = createButton('send2');
    button2.onclick = function () {
        button.onclick();
        button.onclick();
    };

    var button3 = createButton('send3');
    button3.onclick = function () {
        button.onclick();
        button.onclick();
        button.onclick();
    };

    if (window.addEventListener) {
        window.addEventListener('storage', function (e) {
            receive(e);
        });
    }

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