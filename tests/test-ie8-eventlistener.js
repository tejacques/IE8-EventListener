; (function (define) { define('test', function (require, exports, module) {
    'use strict';

    var storageutil = require('storage/util');
    var storage = require('storage');
    var ie8eventListener = require('ie8-eventlistener');

    describe('ie8-eventlistener', function () {

        var writeFakeEvents = function (num) {
            var keys;
            var i;
            var expected = [];
            for(i = 0; i < 3; i++) {
                storage.setItem('someKey', i);
                keys = storageutil.getLocalStorageKeys();
                expect(keys).to.have.length(i+1);
            }

            keys = storageutil.getLocalStorageKeys();
            for(i = 0; i < keys.length; i++) {
                expected.push(JSON.parse(localStorage.getItem(keys[i])));
            }
            return expected;
        };

        describe('localStorage', function () {
            it('should be empty when cleared', function () {
                localStorage.clear();
                expect(localStorage).to.have.length(0);
            });

            it('should have one fake key per write', function (done) {
                localStorage.clear();
                writeFakeEvents(3);
                localStorage.clear();
                setTimeout(done, 50);
            });
        });

        describe('EventListener', function () {
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

            var isWindow = function (target) {
                return (target === window || target instanceof Window);
            };

            var assertListener = function(element, type, listener, present) {
                var index;
                try {
                    index = element._events[type].list.indexOf(listener);
                } catch (e) {
                    index = -1;
                }
                if (present) {
                    expect(index).to.be.above(-1);
                } else {
                    expect(index).to.be(-1);
                }
            };
            describe('addEventListener', function () {
                it('should add listenr to document when storage listener is added to window' , function () {
                    var listener = function() {};
                    window.addEventListener('storage', listener);
                    assertListener(window, 'storage', listener, true);
                    window.removeEventListener('storage', listener);
                });
            });

            describe('removeEventListener', function () {
                it('should remove listener from document when storage listener is removed from window', function () {
                    var listener = function() {};
                    window.addEventListener('storage', listener);
                    window.removeEventListener('storage', listener);
                    assertListener(window, 'storage', listener, false);
                });
            });

            describe('dispatchEvent', function () {
                it('should trigger one event per fake storage event', function (done) {
                    var count = 0;
                    var listener = function(e) {
                    };
                    document.attachEvent('onstorage', listener);
                    var expected_events;// = [];
                    var received_events = 0;
                    var assertions = function(ev) {
                        var i = received_events++;
                        var expected_event = expected_events[i];
                        expect(ev).to.have.property('key', 'someKey');
                        expect(ev).to.have.property('key', expected_event.key); 
                        expect(ev).to.have.property('newValue', expected_event.newValue); 
                        expect(ev).to.have.property('newValue', i.toString()); 
                        expect(ev).to.have.property('oldValue', expected_event.oldValue);
                        expect(ev).to.have.property('oldValue', i-1 < 0 ? null : (i-1).toString());

                        if (received_events === expected_events.length) {
                            window.removeEventListener('storage', assertions);
                            localStorage.clear();
                            done();
                        }
                    };

                    localStorage.clear();
                    window.addEventListener('storage', assertions);
                    assertListener(window, 'storage', assertions, true);
                    window.removeEventListener('storage', assertions);
                    assertListener(window, 'storage', assertions, false);
                    window.addEventListener('storage', assertions);
                    assertListener(window, 'storage', assertions, true);
                    expected_events = writeFakeEvents(3);
                });

                it('should trigger listener when added, removed, and added again', function () {
                    var fired = false;
                    var type = 'click';
                    var listener = function () {
                        fired = true;
                        document.removeEventListener(type, listener);
                    };
                    document.addEventListener(type, listener);
                    assertListener(document, type, listener, true);
                    document.removeEventListener(type, listener);
                    assertListener(document, type, listener, false);
                    document.addEventListener(type, listener);
                    assertListener(document, type, listener, true);

                    document.dispatchEvent(new Event(type));

                    expect(fired).to.be(true);
                });

                it('should bubble to window when fired from element', function () {
                    var shouldBubbleToWindow = [
                        //"storage",        // Only fires on document in IE
                        //"storagecommit",
                        "keyup",
                        "keypress",
                        "keydown",
                        // "textinput",     // Not available in IE8
                        "mousedown",
                        "mouseup",
                        "mousemove",
                        "mouseover",
                        "mouseout",
                        //"mouseenter",     // Can't fire with fireEvent, and doesn't bubble
                        //"mouseleave",     // Can't fire with fireEvent, and doesn't bubble
                        "click",
                        "dblclick"
                    ];
                    var testEvent = function (type) {
                        var fired = false;
                        var listener = function (e) {
                            fired = true;
                            window.removeEventListener(type, listener);
                            assertListener(window, type, listener, false);
                            document.body.removeChild(element);
                            expect(e.target).to.be(element);
                        };

                        window.addEventListener(type, listener);
                        assertListener(window, type, listener, true);
                        var element = document.createElement('div');
                        document.body.appendChild(element);

                        element.dispatchEvent(new Event(type, { bubbles: true }));

                        expect(fired).to.be(true);
                    };

                    for (var i = 0; i < shouldBubbleToWindow.length; i++) {
                        var type = shouldBubbleToWindow[i];
                        testEvent(type);
                    }
                });
            }); 
        });
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
