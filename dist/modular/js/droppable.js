/*
 * Gijgo Droppable v1.6.0
 * http://gijgo.com/droppable
 *
 * Copyright 2014, 2017 gijgo.com
 * Released under the MIT license
 */
/* global window alert jQuery */
/**  */if (typeof (gj.droppable) === 'undefined') {
    gj.droppable = {};
}

gj.droppable.config = {
    /** If specified, the class will be added to the droppable while draggable is being hovered over the droppable.     */    hoverClass: undefined
};

gj.droppable.methods = {
    init: function (jsConfig) {
        var $dropEl = this;

        gj.widget.prototype.init.call(this, jsConfig, 'droppable');
        $dropEl.attr('data-droppable', 'true');
        
        gj.documentManager.subscribeForEvent('mousedown', $dropEl.data('guid'), gj.droppable.methods.createMouseDownHandler($dropEl));
        gj.documentManager.subscribeForEvent('mousemove', $dropEl.data('guid'), gj.droppable.methods.createMouseMoveHandler($dropEl));
        gj.documentManager.subscribeForEvent('mouseup', $dropEl.data('guid'), gj.droppable.methods.createMouseUpHandler($dropEl));
        
        return $dropEl;
    },

    createMouseDownHandler: function ($dropEl) {
        return function (e) {
            $dropEl.isDragging = true;
        }
    },

    createMouseMoveHandler: function ($dropEl) {
        return function (e) {
            if ($dropEl.isDragging) {
                var hoverClass = $dropEl.data('hoverClass'),
                    mousePosition = {
                        left: $dropEl.mouseX(e),
                        top: $dropEl.mouseY(e)
                    },
                    newIsOver = gj.droppable.methods.isOver($dropEl, mousePosition);
                if (newIsOver != $dropEl.isOver) {
                    if (newIsOver) {
                        if (hoverClass) {
                            $dropEl.addClass(hoverClass);
                        }
                        gj.droppable.events.over($dropEl, mousePosition);
                    } else {
                        if (hoverClass) {
                            $dropEl.removeClass(hoverClass);
                        }
                        gj.droppable.events.out($dropEl);
                    }
                }
                $dropEl.isOver = newIsOver;
            }
        }
    },

    createMouseUpHandler: function ($dropEl) {
        return function (e) {
            var mousePosition = {
                left: $dropEl.mouseX(e),
                top: $dropEl.mouseY(e)
            };
            $dropEl.isDragging = false;
            if (gj.droppable.methods.isOver($dropEl, mousePosition)) {
                gj.droppable.events.drop($dropEl);
            }
        }
    },

    isOver: function ($dropEl, mousePosition) {
        var offsetTop = $dropEl.offset().top;// + parseInt($dropEl.css("border-top-width")) + parseInt($dropEl.css("margin-top")) + parseInt($dropEl.css("padding-top")),
        offsetLeft = $dropEl.offset().left;// + parseInt($dropEl.css("border-left-width")) + parseInt($dropEl.css("margin-left")) + parseInt($dropEl.css("padding-left"));
        return mousePosition.left > offsetLeft && mousePosition.left < (offsetLeft + $dropEl.outerWidth(true))
            && mousePosition.top > offsetTop && mousePosition.top < (offsetTop + $dropEl.outerHeight(true));
    },

    destroy: function ($dropEl) {
        if ($dropEl.attr('data-droppable') === 'true') {
            gj.documentManager.unsubscribeForEvent('mousedown', $dropEl.data('guid'));
            gj.documentManager.unsubscribeForEvent('mousemove', $dropEl.data('guid'));
            gj.documentManager.unsubscribeForEvent('mouseup', $dropEl.data('guid'));
            $dropEl.removeData();
            $dropEl.removeAttr('data-guid');
            $dropEl.removeAttr('data-droppable');
            $dropEl.off('drop').off('over').off('out');
        }
        return $dropEl;
    }
};

gj.droppable.events = {
    /** Triggered when a draggable element is dropped.     */    drop: function ($dropEl, offsetX, offsetY) {
        $dropEl.trigger('drop', [{ top: offsetY, left: offsetX }]);
    },

    /** Triggered when a draggable element is dragged over the droppable.     */    over: function ($dropEl, mousePosition) {
        $dropEl.trigger('over', [mousePosition]);
    },

    /** Triggered when a draggable element is dragged out of the droppable.     */    out: function ($dropEl) {
        $dropEl.trigger('out');
    }
};

gj.droppable.widget = function ($element, jsConfig) {
    var self = this,
        methods = gj.droppable.methods;

    self.isOver = false;
    self.isDragging = false;

    /** Removes the droppable functionality.     */    self.destroy = function () {
        return methods.destroy(this);
    }

    self.isOver = function (mousePosition) {
        return methods.isOver(this, mousePosition);
    }

    $.extend($element, self);
    if ('true' !== $element.attr('data-droppable')) {
        methods.init.call($element, jsConfig);
    }

    return $element;
};

gj.droppable.widget.prototype = new gj.widget();
gj.droppable.widget.constructor = gj.droppable.widget;

(function ($) {
    if (typeof ($.fn.droppable) === "undefined") {
        $.fn.droppable = function (method) {
            var $widget;
            if (this && this.length) {
                if (typeof method === 'object' || !method) {
                    return new gj.droppable.widget(this, method);
                } else {
                    $widget = new gj.droppable.widget(this, null);
                    if ($widget[method]) {
                        return $widget[method].apply(this, Array.prototype.slice.call(arguments, 1));
                    } else {
                        throw 'Method ' + method + ' does not exist.';
                    }
                }
            }
        };
    }
})(jQuery);
