# IE8-EventListener
A polyfill for IE8

How can I get it?
-----------------

IE8-EventListener is available through npm and can be installed with the following command:

```
npm install ie8-eventlistener
```

What is it?
-----------

IE8-EventListener strives to add full addEventListener compliance to IE8. Specifically:

* Listeners are executed in the order in which they were added
* Modifying the event object in one listener does not affect the event object in other listeners
* Events not present on window in IE8, but that are supported on document are put on the document but triggered with the window context
* localStorage Storage Events will appear propery in IE8 with the `key`, `newValue`, and `oldValue` properties correctly set as long as `window['ie8-eventlistener/storage'].setItem` is used instead of `window.localStorage.setItem`. Currently does not support the `storageArea` and `url` properties of Storage Events, but those are rarely used.

Why does it exist?
------------------

I wanted to try to support Storage Events for use in https://github.com/tejacques/crosstab, and after scouring the web for polyfills was unable to find one which worked correctly. Using the excellent Financial Times polyfill project as a basis, I added support for Storage Events, and brought the behavior of event listeners closer to the spec.

Inspiration
-----------

* https://github.com/tejacques/crosstab
* https://github.com/Financial-Times/polyfill-service
* https://github.com/jonathantneal/EventListener

Licence
-------

Because this is based on Johnathan Neal's https://github.com/jonathantneal/EventListener and the Financial Times https://github.com/Financial-Times/polyfill-service, this version is released under the CC0 1.0 Universal License
