module.exports = EventBox;

var slice = Array.prototype.slice;

function remove(ary, item) {
    var ix;
    if (ary && (ix = ary.indexOf(item)) >= 0) {
        ary.splice(ix, 1);
    }
}

function EventBox() {
    this._eventHandlers = {};
}

EventBox.prototype.off = function(ev, cb) {

    var hnd = this._eventHandlers;
    if (!hnd) {
        return;
    }

    if (ev) {
        if (cb) {
            remove(hnd[ev], cb);
        } else {
            hnd[ev] = [];
        }
    } else {
        this._eventHandlers = {};
    }

}

EventBox.prototype.on = function(ev, cb) {
    this._on(ev, cb);
    return cb;
}

EventBox.prototype.on_c = function(ev, cb) {
    var lst = this._on(ev, cb);

    var removed = false;
    return function() {
        if (removed) return;
        remove(lst, cb);
        removed = true;
    }
}

EventBox.prototype.once = function(ev, cb) {
    function inner() { cancel(); cb.apply(null, arguments); }
    var cancel = this.on_c(ev, inner);
    return inner;
}

EventBox.prototype.once_c = function(ev, cb) {
    function inner() { cancel(); cb.apply(null, arguments); }
    var cancel = this.on_c(ev, inner);
    return cancel;
}

EventBox.prototype.emit = function(ev, arg) {

    if (arguments.length > 2) {
        return this.emitArray(ev, slice.call(arguments, 1));
    }

    var hnds = this._eventHandlers;
    if (!hnds) return;

    var lst = hnds[ev];
    if (lst) {
        for (i = lst.length - 1; i >= 0; --i) {
            lst[i].call(null, arg);
        }
    }

    lst = hnds['*'];
    if (lst) {
        for (i = lst.length - 1; i >= 0; --i) {
            lst[i].call(null, ev, arg);
        }
    }

    var cix = ev.lastIndexOf(':');
    if (cix >= 0) {
        this.emit(ev.substring(0, cix), arg);
    }

}

EventBox.prototype.emitArray = function(ev, args) {

    var hnds = this._eventHandlers;
    if (!hnds) return;
    
    var lst = hnds[ev];
    if (lst) {
        for (i = lst.length - 1; i >= 0; --i) {
            lst[i].apply(null, args);
        }
    }

    lst = hnds['*'];
    if (lst) {
        args = [ev].concat(args);
        for (i = lst.length - 1; i >= 0; --i) {
            lst[i].apply(null, args);
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

EventBox.prototype._on = function(ev, cb) {
    
    var hnds    = this._eventHandlers || (this._eventHandlers = {}),
        lst     = hnds[ev] || (hnds[ev] = []);

    lst.push(cb);

    return lst;

}
