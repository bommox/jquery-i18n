/*!
 * jQuery i18n plugin
 * @requires jQuery v1.3 or later
 *
 * Licensed under the MIT license.
 * See https://github.com/bommox/jquery-i18n-plugin
 *
 * Version: <%= pkg.version %> (<%= meta.date %>)
 */
 (function($) {
     
    var i18n = {
        settings : {},
        _loadedLocales : {},
        locales : null,
        dictionary : {},
        
        init : function(/*array*/ locales, /*Object literal*/ settings) {
            if ($.isArray(locales) && locales.length > 0) {
                this.locales = locales;
                this.locales.push("root");
                
                var defaultSettings = {
                    nlsPath : "nls/",
                    lazyLoad : false,
                    selectedLocale : locales[0]
                };
                
                this.settings = $.extend(defaultSettings, settings);
                if (!this.settings.lazyLoad) {
                    this.loadLocale(this.locales);
                }
            } else {
                console.log("jQuery.i18n error - Init(locales) must be an array.");
            }
            
        },
        
        loadLocale : function(/*String|Array*/ locale) {
            if ($.isArray(locale)) {
                $.each(locale, function(pos, value) {
                   i18n.loadLocale(value); 
                });
            } else if (!this._loadedLocales[locale]){
                $.ajax(this.settings.nlsPath + locale + ".json", {
                    async : false,
                    dataType : 'json'
                }).success(function(data) {
                    i18n.dictionary[locale] = data;
                    i18n._loadedLocales[locale] = true;
                }).error(function() {
                    console.log("jquery i18n An error ocurred while loading locale: " + locale);
                });
            }
            
        },
        
        
        setLocale : function(/*String*/ locale) {
            if ($.inArray(locale, this.locales) > -1) {
                this.settings.selectedLocale = locale;
            } else {
                console.log("jquery error - Locale " + locale + " not available.");
            }
        },
        
        getText : function(/*String*/ nlsKey, /*Object literal(Optional)*/ params, /*locale (Optional)*/ locale) {
            locale = locale || this.settings.selectedLocale;
            var result = undefined;
            if ($.inArray(locale, this.locales) > -1) {
                if (!this._loadedLocales[locale]) {
                    this.loadLocale(locale);
                }
                
                result = this.dictionary[locale][nlsKey];
                
                if (!result) {
                    result = this.getText(nlsKey, 'root');
                }
                
                if (params) {
                    $.each(params, function(key) {
                       result = result.replace("${" + key + "}", params[key]); 
                    });
                }
                
            } else {
                console.log("jquery error - Locale " + locale + " not available.");
                if (this._loadedLocales["root"]) {
                    result = this.getText(nlsKey, 'root');
                } else {
                    console.log("jquery error - please load a root locale.");
                }
            }
            return result || nlsKey;
        }
    };
     
    
    $.fn.i18nParse = function(/*String (optional)*/ locale) {
        $(this).find("*[data-i18n]").each(function() {
            $(this).i18nText($(this).attr("data-i18n"), locale);
        })
    };
    
    $.fn.i18nText = function(/*String*/ nlsKey, /*String (optional)*/ locale) {
        $(this).text(i18n.getText(nlsKey, locale));
    }
    
    $.i18n = i18n;
     
 })(jQuery);