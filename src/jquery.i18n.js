/*!
 * jQuery i18n plugin
 * @requires jQuery v1.3 or later
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
            
            
            function loadLocale(locale) {
                var df = $.Deferred();
                locale = locale || currentLocale;
                log("loadLocale  " + locale);
                if (localeMap[locale] === undefined) {
                    $.ajax(localePath + locale + ".json", {
                        dataType : 'json'
                    }).done(function(data) {
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
                                result = result.replace("${" + key + "}", result); 
                            });
                        }
                        log("getText " + nlsKey + " -> " + result + " [OK]");
                    } else {
                        log("getText " + nlsKey + " -> " + result + " [FAIL]");                        
                    }
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
                            resultDf.resolve();
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
                var $that = $(this);
                log("[data-i18n] -> " + $that.data("i18n"));
                I18n.getTextPromise($that.data("i18n"))
                .done(function(text) {
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
     };
     
     $.i18n = I18n;
          
 })(jQuery, true);