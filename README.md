# jQuery i18n Plugin

jQuery i18n plugin allows you to client-side translation to multiple languages. Features are:

  - Programatic translation with jQuery selector
  - Parameters replacement (using ${param_key} format)
  - Declarative translation using the data-i18n attribute

### Usage

```js
//Init the plugin
$.i18n.init(["en","es"]); //First locale is the current-one

//Parse all nodes with data-i18n within the selector:
$("#container").i18nParse();

//Set text of an element:
$(".some-node").i18nText("welcome", {name: "George"});


```

### New features soon

* Params in declarative mode
* SetLocale updates everything

License
----

MIT


**Improvements and suggestions are welcome**
