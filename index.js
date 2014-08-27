module.exports = EventBox;

var slice = Array.prototype.slice;

function _remove(ary, item) {
    if (ary) {
        for (var ix = 0, len = ary.length; ix < len; ix += 3) {
            if (ary[ix] === item) {
                ary.splice(ix, 3);
                return true;
            }
        }
    }
    return false;
}

function EventBox(validEvents) {
    this._validEvents = validEvents || null;
    this._eventHandlers = {};
}

EventBox.prototype.bind = function(obj, events) {
    if (events) {
        for (var i = 0; i < events.length; ++i) {
            this._on(events[i], obj, obj[events[i]], obj);
        }
    } else {
        for (var k in obj) {
            var handler = obj[k];
            if (typeof handler === 'function') {
                this._on(k, obj, handler, obj);    
            }
        }
    }
}

EventBox.prototype.unbind = function(obj) {

    var hnd = this._eventHandlers;
    if (!hnd) {
        return;
    }

    for (var k in hnd) {
        var lst = hnd[k];
        var i = 1, l = lst.length;
        while (i < l) {
            if (lst[i] === obj) {
                lst.splice(i-1, 3);
                l -= 3;
            } else {
                i += 3;
            }
        }
    }

}

EventBox.prototype.off = function(ev, cb) {

    var hnd = this._eventHandlers;
    if (!hnd) {
        return;
    }

    if (ev) {
        if (cb) {
            _remove(hnd[ev], cb);
        } else {
            hnd[ev] = [];
        }
    } else {
        this._eventHandlers = {};
    }

}

EventBox.prototype.on = function(ev, cb, ctx) {
    this._on(ev, null, cb, ctx || null);
    return cb;
}

EventBox.prototype.on_c = function(ev, cb, ctx) {
    var lst = this._on(ev, null, cb, ctx || null);

    var removed = false;
    return function() {
        if (removed) return;
        _remove(lst, cb);
        removed = true;
    }
}

EventBox.prototype.once = function(ev, cb, ctx) {
    ctx = ctx || null;
    function inner() { cancel(); cb.apply(ctx, arguments); }
    var cancel = this.on_c(ev, inner);
    return inner;
}

EventBox.prototype.once_c = function(ev, cb, ctx) {
    ctx = ctx || null;
    function inner() { cancel(); cb.apply(ctx, arguments); }
    var cancel = this.on_c(ev, inner);
    return cancel;
}

EventBox.prototype.emit = function(ev, arg1, arg2) {

    if (arguments.length > 3) {
        return this.emitArray(ev, slice.call(arguments, 1));
    }

    var hnds = this._eventHandlers;
    if (!hnds) return;

    var lst = hnds[ev];
    if (lst) {
        for (i = lst.length - 3; i >= 0; i -= 3) {
            lst[i].call(lst[i+2], arg1, arg2);
        }
    }

    lst = hnds['*'];
    if (lst) {
        for (i = lst.length - 3; i >= 0; i -= 3) {
            lst[i].call(lst[i+2], ev, arg1, arg2);
        }
    }

    var cix = ev.lastIndexOf(':');
    if (cix >= 0) {
        this.emit(ev.substring(0, cix), arg1, arg2);
    }

}

EventBox.prototype.emitArray = function(ev, args) {

    var hnds = this._eventHandlers;
    if (!hnds) return;
    
    var lst = hnds[ev];
    if (lst) {
        for (i = lst.length - 3; i >= 0; i -= 3) {
            lst[i].apply(lst[i+2], args);
        }
    }

    lst = hnds['*'];
    if (lst) {
        args = [ev].concat(args);
        for (i = lst.length - 3; i >= 0; i -= 3) {
            lst[i].apply(lst[i+2], args);
        }
    }

    var cix = ev.lastIndexOf(':');
    if (cix >= 0) {
        this.emitArray(ev.substring(0, cix), args);
    }

}

EventBox.prototype.emitAfter = function(delay, ev) {

    var self    = this,
        timer   = null,
        args    = slice.call(arguments, 2);

    timer = setTimeout(function() {
        self.emitArray(ev, args);
    }, delay);

    return function() { clearTimeout(timer); }

}

EventBox.prototype.emitEvery = function(interval, ev) {

    var self    = this,
        timer   = null,
        args    = slice.call(arguments, 2);

    var timer = setInterval(function() {
        self.emitArray(ev, args);
    }, interval);

    return function() { clearInterval(timer); }

}

//
// Internal

EventBox.prototype._on = function(ev, userData, cb, ctx) {

    if (this._validEvents && this._validEvents.indexOf(ev) < 0) {
        throw new Error("no such event: " + ev);
    }
    
    var hnds    = this._eventHandlers || (this._eventHandlers = {}),
        lst     = hnds[ev] || (hnds[ev] = []);

    lst.push(cb, userData, ctx);

    return lst;

}
