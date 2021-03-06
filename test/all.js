var EventBox    = require('..'),
    test        = require('tape'),
    util        = require('util');

function createEventBox(arg) {
    var eb = function() {};
    util.inherits(eb, EventBox);
    return new eb(arg);
}

test('bind', function(a) {

    var em = createEventBox();

    var str = '';

    em.bind({
        foo: function() { str += 'foo'; },
        bar: function() { str += 'bar'; },
        baz: function() { str += 'baz'; }
    });

    em.emit('foo');
    em.emit('bar');
    em.emit('baz');

    a.equal(str, 'foobarbaz');

    a.end();

});

test('bind with specific events', function(a) {

    var em = createEventBox();

    var str = '';

    em.bind({
        foo: function() { str += 'foo'; },
        bar: function() { str += 'bar'; },
        baz: function() { str += 'baz'; }
    }, ['foo', 'baz']);

    em.emit('foo');
    em.emit('bar');
    em.emit('baz');

    a.equal(str, 'foobaz');

    a.end();

});

test('bind context', function(a) {

    var em = createEventBox();

    var str = '';

    em.bind({
        me: "tarzan",
        go: function() { str = this.me; }
    });

    em.emit('go');

    a.equal(str, 'tarzan');

    a.end();

});

test('bind_c', function(a) {

    var em = createEventBox();

    var x = 0;

    var cancel = em.bind_c({
        foo: function() { x += 1; },
        bar: function() { x += 2; }
    });

    em.emit('foo');
    em.emit('bar');

    cancel();

    em.emit('foo');
    em.emit('bar');

    a.equal(x, 3);

    a.end();

});

test('unbind', function(a) {

    var em = createEventBox();

    var str = '';

    var obj = {
        foo: function() { str += 'foo'; },
        bar: function() { str += 'bar'; },
        baz: function() { str += 'baz'; }
    };

    em.bind(obj);

    delete obj.foo;
    delete obj.bar;
    delete obj.baz;

    em.unbind(obj);

    em.emit('foo');
    em.emit('bar');
    em.emit('baz');

    a.equal(str, '');

    a.end();

});

test('on/emit', function(a) {

    var em = createEventBox();

    var i = 0;
    em.on('foo', function(v1, v2) { i += (v1 + v2); });

    em.emit('foo', 1, 2);
    em.emit('foo', 3, 4);
    em.emit('foo', 5, 6);

    a.ok(i === 21);

    a.end();

});

test('on/emit with context', function(a) {

    var em = createEventBox();
    var ctx = { a: "quux" };
    var out;

    em.on('foo', function() {
        out = this.a;
    }, ctx);

    em.emit('foo');

    a.ok(out === 'quux');

    a.end();

});

test('emit, multiple listeners', function(a) {

    var em = createEventBox();

    var x = 0, y = 0, z = 0;

    em.on('foo', function() { x++; });
    em.on('foo', function() { y++; });
    em.on('foo', function() { z++; });

    em.emit('foo');
    em.emit('foo');

    a.ok(x === 2);
    a.ok(y === 2);
    a.ok(z === 2);

    a.end();

});

test('emit, global listener', function(a) {

    var em = createEventBox();

    em.on('*', function(ev, x, y) {
        a.ok(ev === 'foo')
        a.ok(x === 1);
        a.ok(y === 2);
    });

    em.emit('foo', 1, 2);

    a.end();

});

test('emit array', function(a) {

    var em = createEventBox();

    var i = 0;
    em.on('foo', function(a, b, c) { i = a + b + c; });

    em.emitArray('foo', [10, 15, 20]);
    
    a.ok(i === 45);

    a.end();

});

test('emit array, global listener', function(a) {

    var em = createEventBox();

    em.on('*', function(ev, x, y) {
        a.ok(ev === 'foo')
        a.ok(x === 1);
        a.ok(y === 2);
    });

    em.emitArray('foo', [1, 2]);

    a.end();

});

test('emit namespaced', function(t) {

    var em = createEventBox();

    var str = '';

    em.on('a', function() { str += 'a'; });
    em.on('a:b', function() { str += 'b'; });
    em.on('a:b:c', function() { str += 'c'; });
    em.on('a:b:c:d', function() { str += 'd'; });

    em.emit('a:b:c');

    t.ok(str === 'cba');

    t.end();

});

test('on_c, cancellation', function(a) {

    var em = createEventBox();

    var i = 0;
    function cb() { i++; }

    var cancel = em.on_c('foo', cb);

    em.emit('foo');

    cancel();
    cancel();

    em.emit('foo');
    em.emit('foo');

    a.ok(i === 1);

    a.end();

});

test('once', function(a) {

    var em = createEventBox();

    var i = 0;
    em.once('foo', function(val) { i += val; });

    em.emit('foo', 1);
    em.emit('foo', 2);
    em.emit('foo', 3);

    a.ok(i === 1);

    a.end();

});

test('once, pre-off', function(a) {

    var em = createEventBox();

    var i = 0;
    var cb = em.once('foo', function(val) { i += val; });

    em.off('foo', cb);

    em.emit('foo', 1);
    em.emit('foo', 2);
    em.emit('foo', 3);

    a.ok(i === 0);

    a.end();

});

test('once, cancellation', function(a) {

    var em = createEventBox();

    var i = 0;
    em.once_c('foo', function(val) { i += val; });

    em.emit('foo', 1);
    em.emit('foo', 2);
    em.emit('foo', 3);

    a.ok(i === 1);

    a.end();

});

test('once, cancellation, pre-cancelled', function(a) {

    var em = createEventBox();

    var i = 0;
    var cancel = em.once_c('foo', function(val) { i += val; });

    cancel();

    em.emit('foo', 1);
    em.emit('foo', 2);
    em.emit('foo', 3);

    a.ok(i === 0);

    a.end();

});

test('off - single callback', function(a) {

    var em = createEventBox();

    var i = 0;
    function cb() { i++; }

    em.on('foo', cb);

    em.emit('foo');

    em.off('foo', cb);
    em.off('foo', cb);

    em.emit('foo');
    em.emit('foo');

    a.ok(i === 1);

    a.end();

});

test('off - single event', function(a) {

    var em = createEventBox();

    var x = 0;

    em.on('foo', function() {
        x += 2;
    });

    em.on('foo', function() {
        x += 2;
    });

    em.off('foo');
    em.emit('foo');

    a.ok(x === 0);

    a.end(); 

});

test('off - all events', function(a) {

    var em = createEventBox();

    var x = 0;

    em.on('foo', function() {
        x += 2;
    });

    em.on('bar', function() {
        x += 2;
    });

    em.off();

    em.emit('foo');
    em.emit('bar');

    a.ok(x === 0);

    a.end(); 

});

test('emit after', function(a) {

    a.plan(2);

    var em = createEventBox();
    var start = Date.now();

    em.on('foo', function(x) {
        a.ok(x === 5);
        a.ok(Date.now() - start >= 100);
    });

    em.emitAfter(100, 'foo', 5);

});

test('emit every', function(a) {
    
    var em = createEventBox();
    var last = Date.now();
    var count = 0;

    em.on('foo', function(x) {

        a.ok(x === 5);

        var now = Date.now();
        a.ok(now - last >= 100);
        last = now;
        
        count++;
        if (count === 3) {
            cancel();
            a.end();
        }

    });

    var cancel = em.emitEvery(100, 'foo', 5);

});
