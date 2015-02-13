'use strict';
var storage = require('./storage');
var utils = require('./storage/util');
var _storage_key_prefix = utils.prefix;
var _storage_keys_set = utils.sent;
var _storage_key = utils.storageKey;
var _storage_key_timeout = utils.timeout;

if (typeof Element !== 'undefined'
    && !Element.prototype.addEventListener
    && !Element.prototype.attachEvent
    ) {

    var clone = (function () {
        var Temp = function () { };
        return function (prototype) {
            if (arguments.length > 1) {
                throw Error('Second argument not supported');
            }
            if (typeof prototype != 'object') {
                throw TypeError('Argument must be an object');
            }
            Temp.prototype = prototype;
            var result = new Temp();
            Temp.prototype = null;

            for (k in prototype) {
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
                    || array[index] === element) {
                    return index;
                }
            }
        }

        return -1;
    }

    var binaryIndexOf = function (searchElement) {
        'use strict';

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
    }

    var getLocalStorageKeys = function () {
        var keys = []
        for (var i = 0, len = localStorage.length; i < len; i++) {
            var key = localStorage.key(i);
            var splits = key.split('-');
            if (splits[0] === _storage_key_prefix) {
                var timestamp = parseFloat(splits[1]);
                keys.push({
                    timestamp: timestamp,
                    key: key,
                    // override valueOf function to make value comparison work for binaryIndexOf
                    valueOf: function () { return this.key; },
                    // override toString to make default sort method correct and fast
                    toString: function () { return this.key.toString(); }
                });
            }
        }

        keys.sort();
        return keys;
    }

    var _keys = getLocalStorageKeys();
    var _last_key = _keys.length === 0 ? '' : _keys[_keys.length - 1].key;

    window.Event = Window.prototype.Event = function Event(type, eventInitDict) {
        if (!type) {
            throw new Error('Not enough arguments');
        }

        var event = document.createEventObject();

        event.type = type;
        event.bubbles = eventInitDict && eventInitDict.bubbles !== undefined ? eventInitDict.bubbles : false;
        event.cancelable = eventInitDict && eventInitDict.cancelable !== undefined ? eventInitDict.cancelable : false;

        return event;
    };

    var addToPrototype = function (name, method) {
        HTMLDocument.prototype[name] = method;
        Window.prototype[name] = method;
        Element.prototype[name] = method;
    }

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

    addToPrototype('addEventListener', function (type, listener) {
        var target = this;
        var element = this;
        if (target === window && type in shouldTargetDocument) {
            target = document;
        }


        if (!target._events) {
            target._events = {};
        }

        if (!target._events[type]) {
            target._events[type] = function (event) {
                var list = target._events[event.type].list;
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
                }

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
                    }

                    // This setTimeout call is necessary
                    // if it were missing IE8 localStorage
                    // might not have synced across tabs
                    setTimeout(setupEventList, 0);
                } else {
                    eventList.push(null);
                    callEventHandlers();
                }


            };

            target._events[type].list = [];

            if (target.attachEvent) {
                target.attachEvent('on' + type, target._events[type]);
            }
        }

        target._events[type].list.push(listener);
    });

    addToPrototype("removeEventListener", function (type, listener) {
        var element = this;
        var target = this;
        var index;

        if (target === window && type in shouldTargetDocument) {
            target = document;
        }

        if (target._events && target._events[type] && target._events[type].list) {
            index = indexOf(target._events[type].list, listener);

            if (index !== -1) {
                target._events[type].list.splice(index, 1);

                if (!target._events[type].list.length) {
                    if (target.detachEvent) {
                        target.detachEvent('on' + type, target._events[type]);
                    }
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

        var element = this, type = event.type;

        try {
            if (!event.bubbles) {
                event.cancelBubble = true;

                var cancelBubbleEvent = function (event) {
                    event.cancelBubble = true;

                    (element || window).detachEvent('on' + type, cancelBubbleEvent);
                };

                this.attachEvent('on' + type, cancelBubbleEvent);
            }

            this.fireEvent('on' + type, event);
        } catch (error) {
            event.target = element;

            do {
                event.currentTarget = element;

                if ('_events' in element && typeof target._events[type] === 'function') {
                    target._events[type].call(element, event);
                }

                if (typeof element['on' + type] === 'function') {
                    element['on' + type].call(element, event);
                }

                element = element.nodeType === 9 ? element.parentWindow : element.parentNode;
            } while (element && !event.cancelBubble);
        }

        return true;
    });
}