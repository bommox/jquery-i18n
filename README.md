# jQuery i18n Plugin

jQuery i18n plugin allows you to client-side translation to multiple languages.

  - Declarative translation using the `data-i18n` attribute
  - Translations stored via `.json` files
  - `$.fn.i18n` applied to jQuery selectors
  - Asyncronous translations
  - Param/text interpolation via `${key}`or array positions `${0}`  

### Usage

root.json
```json
{
  welcome: "Welcome to my website",
  greeting: "Hi ${name}!",
  order: "Take your ${0} to the ${1}"
}
```

es.json
```json
{
  welcome: "Bienvenido a mi sitio web",
  greeting: "¡Hola ${name}!"
}
```


```html
<body>
  <p data-i18n="welcome"></p>
  <p data-i18n="greeting" data-i18n-params="{'name':'Jorge'}">
  <p data-i18n="order" data-i18n-params='["brother", "party"]'>
</body>
```

```js
$("body").i18n();     //Translates to current locale (default root)
$("body").i18n("es"); //Translates to 'es' locale

$.i18n.setLocale("en");
var greetingText = $.i18n.getText("greeting", {name: "Peter"});

```