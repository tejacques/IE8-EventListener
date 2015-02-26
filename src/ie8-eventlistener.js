; (function (define) { define('ie8-eventlistener', function (require, exports, module) {
    'use strict';
    var storage = require('storage');
    var util = require('storage/util');
    var _storage_key_prefix = util.prefix;
    var _storage_keys_set = util.sent;
    var _storage_key = util.storageKey;
    var _storage_key_timeout = util.timeout;

    if (typeof Element == 'undefined'
        || Element.prototype.addEventListener
        || !Element.prototype.attachEvent
        ) {
        return;
    }

    var clone = (function () {
        var Temp = function () { };
        return function (prototype) {
            if (arguments.length > 1) {
                throw Error('Second argument not supported');
            }
            if (typeof prototype != 'object') {
                throw new TypeError('Argument must be an object');
            }
            Temp.prototype = prototype;
            var result = new Temp();
            Temp.prototype = null;

            for (var k in prototype) {
                if (k in result) {
                    break;
                }
                result[k] = prototype[k];
            }
            return result;
        };
    })();

    var indexOf = function (array, element, property) {
        var index;
        var length = array.length;

        for (index = 0; index < length; index++) {
            if (index in array) {
                if ((property && array[index][property] === element)
                    || (!property && array[index] === element)
                ) {
                    return index;
                }
            }
        }

        return -1;
    };

    var binaryIndexOf = function (searchElement) {
        var minIndex = 0;
        var maxIndex = this.length - 1;
        var currentIndex;
        var currentElement;
        var resultIndex;

        while (minIndex <= maxIndex) {
            resultIndex = currentIndex = (minIndex + maxIndex) >>> 1;
            currentElement = this[currentIndex];

            if (currentElement == searchElement) {
                return currentIndex;
            }
            else if (currentElement < searchElement) {
                minIndex = currentIndex + 1;
            }
            else {
                maxIndex = currentIndex - 1;
            }
        }

        return -(minIndex + 1);
    };

    var getLocalStorageKeys = util.getLocalStorageKeys;
    var _keys = getLocalStorageKeys();
    var _last_key = _keys.length === 0 ? '' : _keys[_keys.length - 1].key;

    window.Event = Window.prototype.Event = function Event(type, eventInitDict) {
        if (typeof type == 'undefined') {
            throw new Error("Failed to construct 'Event': An event name must be provided.");
        }

        type = String(type);
        var event = document.createEventObject();

        event.type = type;
        event.bubbles = eventInitDict && eventInitDict.bubbles !== undefined ? eventInitDict.bubbles : false;
        event.cancelable = eventInitDict && eventInitDict.cancelable !== undefined ? eventInitDict.cancelable : false;

        return event;
    };

    var addToPrototype = function (name, method) {
        Window.prototype[name] = method;
        HTMLDocument.prototype[name] = method;
        Element.prototype[name] = method;
    };

    // Pulled from http://www.quirksmode.org/dom/events/index.html
    // The following events are not targetable on the window, so switch
    // the target to the document instead.
    var shouldTargetDocument = {
        "storage": 1,
        "storagecommit": 1,
        "keyup": 1,
        "keypress": 1,
        "keydown": 1,
        "textinput": 1,
        "mousedown": 1,
        "mouseup": 1,
        "mousemove": 1,
        "mouseover": 1,
        "mouseout": 1,
        "mouseenter": 1,
        "mouseleave": 1,
        "click": 1,
        "dblclick": 1
    };

    var isWindow = function(target) {
        return (target === window || target instanceof Window);
    };

    addToPrototype('addEventListener', function (type, listener) {
        if (!listener
            || typeof listener !== 'function') {
            return;
        }

        type = String(type);
        var target = this;
        var element = this;
        if (isWindow(target) && type in shouldTargetDocument) {
            target = document;
        }

        if (!element._events) {
            element._events = {};
        }

        if (!element._events[type]) {
            element._events[type] = function (event) {
                var list = element._events[event.type].list;
                var events = list.slice();
                var index = -1;
                var length = events.length;
                var eventElement;

                event.preventDefault = function preventDefault() {
                    if (event.cancelable !== false) {
                        event.returnValue = false;
                    }
                };

                event.stopPropagation = function stopPropagation() {
                    event.cancelBubble = true;
                };

                event.stopImmediatePropagation = function stopImmediatePropagation() {
                    event.cancelBubble = true;
                    event.cancelImmediate = true;
                };

                event.currentTarget = element;
                event.relatedTarget = event.fromElement || null;
                event.target = event.srcElement || element;
                event.timeStamp = new Date().getTime();

                if (event.clientX) {
                    event.pageX = event.clientX + document.documentElement.scrollLeft;
                    event.pageY = event.clientY + document.documentElement.scrollTop;
                }

                var eventList = [],
                    eventIndex;

                var callEventHandlers = function () {
                    // Copy the event object here. This first copy is
                    // more expensive because we need to traverse the
                    // structure since event is a special object
                    var eventClone = clone(event);
                    var eventLength = eventList.length;

                    for (eventIndex = 0; eventIndex < eventLength; eventIndex++) {
                        var ev = eventList[eventIndex];
                        for (index = 0; index < length && !event.cancelImmediate; index++) {
                            // Copy the copy so we can set the key/oldValue/newValue
                            // per event. This mimics the behavior of newer browsers
                            // where one event handler cannot change the values the next
                            // event handler receives. This is a faster copy since
                            // eventClone is a regular object
                            var evnt = clone(eventClone);
                            if (ev) {
                                evnt.key = ev.key;
                                evnt.oldValue = ev.oldValue;
                                evnt.newValue = ev.newValue;
                            }
                            if (index in events) {
                                eventElement = events[index];
                                var idOf = indexOf(list, eventElement);
                                if (idOf !== -1) {
                                    eventElement.call(element, evnt);
                                }
                            }
                        }
                    }
                };

                if (type === "storage" || type === "storagecommit") {

                    var setupEventList = function () {
                        var keys = getLocalStorageKeys();
                        var idx = binaryIndexOf.call(keys, _last_key);
                        // If the index is negative, bit flip it to get
                        // the insersion point. If the key is old, we'll
                        // start from the first element. If the key is new
                        // but has been removed already, we'll start at the
                        // end of the keys.
                        if (idx < 0) {
                            idx = ~idx;
                        } else {
                            idx++;
                        }
                        var i;

                        for (i = idx; i < keys.length; i++) {
                            var key = keys[i].key;
                            var item = JSON.parse(storage.getItem(key));
                            _last_key = key;
                            eventList.push(item);
                        }

                        // Clear out events
                        var now = (+new Date());
                        var THRESHOLD = (10 * 60 * 1000); // 10 minutes
                        for (i = 0;
                            i < idx && (idx > 1000 || now - keys[i].timestamp > THRESHOLD) ;
                            i++) {
                            // Raw call to localStorage since we don't ever
                            // want to generate an event for them.
                            window.localStorage.removeItem(keys[i]);
                        }

                        callEventHandlers();
                    };

                    // This setTimeout call is necessary
                    // if it were missing IE8 localStorage
                    // might not have synced across tabs
                    setTimeout(setupEventList, 0);
                } else {
                    eventList.push(null);
                    callEventHandlers();
                }
            };

            element._events[type].list = [];
            if (target.attachEvent) {
                target.attachEvent('on' + type, element._events[type]);
            }
        }

        element._events[type].list.push(listener);
    });

    addToPrototype("removeEventListener", function (type, listener) {
        if (!listener
            || typeof listener !== 'function') {
            return;
        }

        type = String(type);

        var element = this;
        var target = this;
        var index;

        if (isWindow(target) && type in shouldTargetDocument) {
            target = document;
        }

        if (element._events && element._events[type] && element._events[type].list) {
            index = indexOf(element._events[type].list, listener);

            if (index !== -1) {
                element._events[type].list.splice(index, 1);

                if (!element._events[type].list.length) {
                    if (target.detachEvent) {
                        target.detachEvent('on' + type, element._events[type]);
                    }

                    delete element._events[type];
                }
            }
        }
    });

    addToPrototype("dispatchEvent", function (event) {
        if (!arguments.length) {
            throw new Error('Not enough arguments');
        }

        if (!event || typeof event.type !== 'string') {
            throw new Error('DOM Events Exception 0');
        }

        var element = this;
        var target = this;
        var type = event.type;
        if (isWindow(target) && type in shouldTargetDocument) {
            target = document;
        }

        try {
            if (!event.bubbles) {
                event.cancelBubble = true;

                // What does this actually do?
                // Order of execution of attached events
                // isn't in the spec, so this is pointless,
                // also the event cloning method should
                // ensure cancelBubble is always set to true.
                //var cancelBubbleEvent = function (event) {
                //    event.cancelBubble = true;

                //    target.detachEvent('on' + type, cancelBubbleEvent);
                //};

                //target.attachEvent('on' + type, cancelBubbleEvent);
            }

            element.fireEvent('on' + type, event);
        } catch (error) {
            event.target = element;

            do {
                event.currentTarget = element;

                if ('_events' in element && typeof element._events[type] === 'function') {
                    element._events[type].call(element, event);
                }

                if (typeof element['on' + type] === 'function') {
                    element['on' + type].call(element, event);
                }

                element = element.nodeType === 9 ? element.parentWindow : element.parentNode;
            } while (element && !event.cancelBubble);
        }

        return true;
    });
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
