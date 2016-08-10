/*!
 * jQuery i18n plugin
 * @requires jQuery v2 or later
 *
 * Licensed under the MIT license.
 * See https://github.com/bommox/jquery-i18n-plugin
 */
 (function($, doDebug) {
     doDebug = doDebug || false;
     var log = function(msg) {
         if (doDebug) {
             console.log("i18n -> " + msg);
         }
     }
     var I18n = (function() {
         
            var ROOT = "root";
            var localePath = "nls/";
            var localeMap = {};
            var currentLocale = ROOT;
            
            
            function loadLocale(locale, async) {
                async = (async===undefined) ? true : async;
                var df = $.Deferred();
                locale = locale || currentLocale;
                log("loadLocale  " + locale);
                if (localeMap[locale] === undefined) {
                    var settings = {
                        dataType : 'json',
                        async : async
                    };
                    if (async === false) {
                        log("Load locale sync...");
                        settings.success = function() {
                            log("Success [OK]");
                            df.resolve();
                        }
                        settings.error = df.reject;
                    }
                    $.ajax(localePath + locale + ".json", settings)
                    .done(function(data) {
                        log("loadLocale " + locale + " [OK]");
                        localeMap[locale] = data;
                        df.resolve();
                    }).fail(function() {
                        log("loadLocale " + locale + " [FAIL]");
                        df.reject();  
                    });
                } else {
                    log("loadLocale " + locale + " [CACHE]");
                    df.resolve();
                }
                return df;
            }
                
            return {
                getText : function(/*String*/ nlsKey, /*Object literal(Optional)*/ params) {
                    var result = nlsKey;
                    if (localeMap[currentLocale] && localeMap[currentLocale][nlsKey] !== undefined) {                
                        result = localeMap[currentLocale][nlsKey];                
                        if (result !== undefined && ($.isPlainObject(params) || $.isArray(params))) {
                            $.each(params, function(key, value) {
                                log("  - param " + key + " : " + value);
                                result = result.replace("${" + key + "}", value); 
                            });
                        }
                        log("getText " + nlsKey + " -> " + result + " [OK]");
                    } else if (localeMap[currentLocale] === undefined) {
                        log("getText loading locale sync...");
                        var _this = this;
                        loadLocale(currentLocale, false)
                        .done(function() {
                            result = _this.getText(nlsKey, params);
                            log("getText sync [OK]");
                        })
                        .fail(function() {
                            log("getText sync [FAIL]");
                        });
                    } else {
                        log("getText " + nlsKey + " -> " + result + " [FAIL]");                        
                    }
                    // Clean ${} marks
                    result = result.replace(/\${.+}/ig,"");
                    return result;
                },
                getTextPromise : function(/*String*/ nlsKey, /*Object literal(Optional)*/ params) {
                    var resultDf = $.Deferred();
                    var _this = this;
                    loadLocale()
                        .fail(function() {
                            log("getTextPromise [FAIL]] -> " + nlsKey);
                            resultDf.resolve(nlsKey);
                        })
                        .done(function() {
                            var result = _this.getText(nlsKey, params);
                            log("getTextPromise [OK] -> " + result);
                            resultDf.resolve(result);
                        });
                    return resultDf;
                },
                setLocale : function(locale) {
                    currentLocale = locale;
                    log("setLocale " + locale + "...");
                    if (locale != ROOT) {
                        return $.when(loadLocale(locale), loadLocale(ROOT))
                            .done(function() {                                   
                                log("setLocale " + locale + " [OK]");
                                localeMap[locale] = $.extend({}, localeMap[ROOT], localeMap[locale]);
                            })
                            .fail(function() {
                                log("setLocale " + locale + " [FAIL]");
                            });            
                    } else {
                        return loadLocale();
                    }
                    
                },
                getLocale : function() {
                    return currentLocale;
                },
                setPath : function(path) {
                    localePath = path;
                }
            }
     })();
     
     
     $.fn.i18n = function(locale) {
        locale = locale || I18n.getLocale();
        var $this = $(this);
        I18n.setLocale(locale).done(function() {
            $this.find("[data-i18n]").each(function() {
                var $that = $(this),
                    params = $that.data("i18n-params");
                log("[data-i18n] -> " + $that.data("i18n") + ", params: " + params);
                if (params !== undefined && typeof params == "string") {
                    try {
                        params = JSON.parse(params);
                    } catch (e) {
                        try {
                            params = JSON.parse(params.replace(/'/ig,'"'));
                        } catch (e) {
                        }
                    }
                }
                I18n.getTextPromise($that.data("i18n"), params)
                .done(function(text) {
                    log("$.fn.i18n [OK]  -> " + $that.data("i18n") + " " + text);  
                    $that.html(text);
                })
                .fail(function() {
                    log("$.fn.i18n ha fallado. 2");  
                });              
            });
        })
        .fail(function() {
            log("$.fn.i18n ha fallado. 1");  
        });
        return $this;    
     };
     
     $.i18n = I18n;
          
 })(jQuery, true);