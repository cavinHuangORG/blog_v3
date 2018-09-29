"use strict";

// ---------------------------------------------------------------------------
//    使用方法
// ---------------------------------------------------------------------------
// $(".lazy_pic").lazyload({
//   effect: "fadeIn",
//   threshold: 200,
//   failurelimit: 10,
//   placeholder: "//tencent.cdn.hlzblog.top/static/img/default/pre_pic.png",
//   data_attribute: "originalSrc",
// });
// ---------------------------------------------------------------------------
//    配置参数
// ---------------------------------------------------------------------------
//    effect:
//        载入使用何种效果  effect(特效),值有show(直接显示),fadeIn(淡入),slideDown(下拉)等,常用fadeIn 
//    threshold:
//        提前开始加载 threshold,值为数字,代表页面高度.如设置为200,表示滚动条在离目标位置还有200的高度时
//    就开始加载图片,可以做到不让用户察觉
//    failurelimit:
//        图片排序混乱时 failurelimit,值为数字.lazyload默认在找到第一张不在可见区域里的图片时
//      则不再继续加载,但当HTML容器混乱的时候可能出现可见区域内图片并没加载出来的情况,
//    failurelimit:
//        意在加载N张可见区域外的图片,以避免出现这个问题.
// ---------------------------------------------------------------------------
//    目前已使用 CDN
// ---------------------------------------------------------------------------
//    https://cdn.bootcss.com/jquery_lazyload/1.9.7/jquery.lazyload.min.js
// ---------------------------------------------------------------------------

/*
 * Lazy Load - jQuery plugin for lazy loading images
 *
 * Copyright (c) 2007-2013 Mika Tuupola
 *
 * Licensed under the MIT license:
 *   http://www.opensource.org/licenses/mit-license.php
 *
 * Project home:
 *   http://www.appelsiini.net/projects/lazyload
 *
 * Version:  1.9.3
 *
 */
(function ($, window, document, undefined) {
    var $window = $(window);
    $.fn.lazyload = function (options) {
        var elements = this;
        var $container;
        var settings = {
            threshold: 0,
            failure_limit: 0,
            event: "scroll",
            effect: "show",
            container: window,
            data_attribute: "originalSrc",
            skip_invisible: true,
            appear: null,
            load: null,
            placeholder: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAANSURBVBhXYzh8+PB/AAffA0nNPuCLAAAAAElFTkSuQmCC"
        };

        function update() {
            var counter = 0;
            elements.each(function () {
                var $this = $(this);
                if(settings.skip_invisible && !$this.is(":visible")) {
                    return;
                }
                if($.abovethetop(this, settings) || $.leftofbegin(this, settings)) {
                    /* Nothing. */
                } else if(!$.belowthefold(this, settings) && !$.rightoffold(this, settings)) {
                    $this.trigger("appear");
                    /* if we found an image we'll load, reset the counter */
                    counter = 0;
                } else {
                    if(++counter > settings.failure_limit) {
                        return false;
                    }
                }
            });
        }
        if(options) {
            /* Maintain BC for a couple of versions. */
            if(undefined !== options.failurelimit) {
                options.failure_limit = options.failurelimit;
                delete options.failurelimit;
            }
            if(undefined !== options.effectspeed) {
                options.effect_speed = options.effectspeed;
                delete options.effectspeed;
            }
            $.extend(settings, options);
        }
        /* Cache container as jQuery as object. */
        $container = settings.container === undefined || settings.container === window ? $window : $(settings.container);
        /* Fire one scroll event per scroll. Not one scroll event per image. */
        if(0 === settings.event.indexOf("scroll")) {
            $container.bind(settings.event, function () {
                return update();
            });
        }
        this.each(function () {
            var self = this;
            var $self = $(self);
            self.loaded = false;
            /* If no src attribute given use data:uri. */
            if($self.attr("src") === undefined || $self.attr("src") === false) {
                if($self.is("img")) {
                    $self.attr("src", settings.placeholder);
                }
            }
            /* When appear is triggered load original image. */
            $self.one("appear", function () {
                if(!this.loaded) {
                    if(settings.appear) {
                        var elements_left = elements.length;
                        settings.appear.call(self, elements_left, settings);
                    }
                    $("<img />").bind("load", function () {
                        var original = $self.attr(settings.data_attribute);
                        $self.hide();
                        if($self.is("img")) {
                            $self.attr("src", original);
                        } else {
                            $self.css("background-image", "url('" + original + "')");
                        }
                        $self[settings.effect](settings.effect_speed);
                        self.loaded = true;
                        /* Remove image from array so it is not looped next time. */
                        var temp = $.grep(elements, function (element) {
                            return !element.loaded;
                        });
                        elements = $(temp);
                        if(settings.load) {
                            var elements_left = elements.length;
                            settings.load.call(self, elements_left, settings);
                        }
                    }).attr("src", $self.attr(settings.data_attribute));
                }
            });
            /* When wanted event is triggered load original image */
            /* by triggering appear.                              */
            if(0 !== settings.event.indexOf("scroll")) {
                $self.bind(settings.event, function () {
                    if(!self.loaded) {
                        $self.trigger("appear");
                    }
                });
            }
        });
        /* Check if something appears when window is resized. */
        $window.bind("resize", function () {
            update();
        });
        /* With IOS5 force loading images when navigating with back button. */
        /* Non optimal workaround. */
        if(/(?:iphone|ipod|ipad).*os 5/gi.test(navigator.appVersion)) {
            $window.bind("pageshow", function (event) {
                if(event.originalEvent && event.originalEvent.persisted) {
                    elements.each(function () {
                        $(this).trigger("appear");
                    });
                }
            });
        }
        /* Force initial check if images should appear. */
        $(document).ready(function () {
            update();
        });
        return this;
    };
    /* Convenience methods in jQuery namespace.           */
    /* Use as  $.belowthefold(element, {threshold : 100, container : window}) */
    $.belowthefold = function (element, settings) {
        var fold;
        if(settings.container === undefined || settings.container === window) {
            fold = (window.innerHeight ? window.innerHeight : $window.height()) + $window.scrollTop();
        } else {
            fold = $(settings.container).offset().top + $(settings.container).height();
        }
        return fold <= $(element).offset().top - settings.threshold;
    };
    $.rightoffold = function (element, settings) {
        var fold;
        if(settings.container === undefined || settings.container === window) {
            fold = $window.width() + $window.scrollLeft();
        } else {
            fold = $(settings.container).offset().left + $(settings.container).width();
        }
        return fold <= $(element).offset().left - settings.threshold;
    };
    $.abovethetop = function (element, settings) {
        var fold;
        if(settings.container === undefined || settings.container === window) {
            fold = $window.scrollTop();
        } else {
            fold = $(settings.container).offset().top;
        }
        return fold >= $(element).offset().top + settings.threshold + $(element).height();
    };
    $.leftofbegin = function (element, settings) {
        var fold;
        if(settings.container === undefined || settings.container === window) {
            fold = $window.scrollLeft();
        } else {
            fold = $(settings.container).offset().left;
        }
        return fold >= $(element).offset().left + settings.threshold + $(element).width();
    };
    $.inviewport = function (element, settings) {
        return !$.rightoffold(element, settings) && !$.leftofbegin(element, settings) && !$.belowthefold(element, settings) && !$.abovethetop(element, settings);
    };
    /* Custom selectors for your convenience.   */
    /* Use as $("img:below-the-fold").something() or */
    /* $("img").filter(":below-the-fold").something() which is faster */
    $.extend($.expr[":"], {
        "below-the-fold": function belowTheFold(a) {
            return $.belowthefold(a, { threshold: 0 });
        },
        "above-the-top": function aboveTheTop(a) {
            return !$.belowthefold(a, { threshold: 0 });
        },
        "right-of-screen": function rightOfScreen(a) {
            return $.rightoffold(a, { threshold: 0 });
        },
        "left-of-screen": function leftOfScreen(a) {
            return !$.rightoffold(a, { threshold: 0 });
        },
        "in-viewport": function inViewport(a) {
            return $.inviewport(a, { threshold: 0 });
        },
        /* Maintain BC for couple of versions. */
        "above-the-fold": function aboveTheFold(a) {
            return !$.belowthefold(a, { threshold: 0 });
        },
        "right-of-fold": function rightOfFold(a) {
            return $.rightoffold(a, { threshold: 0 });
        },
        "left-of-fold": function leftOfFold(a) {
            return !$.rightoffold(a, { threshold: 0 });
        }
    });
})(jQuery, window, document);