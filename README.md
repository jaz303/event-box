# event-box

`event-box` is an alternative to node's built in `EventEmitter`. It exposes a similar API but is not intended to be a drop-in replacement; some differences exist.

## Hierarchical Events

`event-box` supports hierarchical events, using `:` as a separator. If event `foo:bar:baz` is emitted, listeners for `foo:bar:baz`, `foo:bar` and `foo` will all be triggered.

## Installation

Get it:

```shell
npm install event-box
```

Require it:

```javascript
var EventBox = require('event-box');
```

## API

#### `var box = new EventBox([validEvents])`

Create a new `EventBox`. If `validEvents` is specified an error will be raised whenever an attempt is made to register a listener for an event not included in this array.

#### `box.on(ev, cb, [ctx])`

Register callback `cb` to be called when event `ev` is emitted, using optional `this` context `ctx`. Returns a callback that can later be passed `off()` to remove the listener.

#### `box.on_c(ev, cb, [ctx])`

As above but instead returns a cancellation function that can be used to remove the event listener.

#### `box.once(ev, cb, [ctx])`

Register callback `cb` to be called the next time event `ev` is emitted, using optional `this` context `ctx`. After being called once the listener is then automatically removed. Returns a callback that can later be passed `off()` to remove the listener.

#### `box.once_c(ev, cb, [ctx])`

As above but instead returns a cancellation function that can be used to remove the event listener.

#### `box.off()`

Remove all event bindings.

#### `box.off(ev)`

Remove all event bindings for event `ev`.

#### `box.off(ev, cb)`

Remove the single binding `cb` for event `ev`.

#### `box.bind(obj, [events])`

Bind all functions contained in `obj` as listeners for the events denoted by their respective keys. For example:

```javascript
box.bind({
	foo: doFoo,
	bar: doBar
});
```

is equivalent to:

```javascript
box.on('foo', doFoo, obj);
box.on('bar', doBar, obj);
```

Attached functions will be called in the context of the bound object.

The optional argument `events` can be used to specify the handlers which should be plucked from the supplied object, otherwise all functions found in the object will be attached.

#### `box.bind_c(obj, [events])`

As above but returns a cancellation function that can be used to remove the object binding.

#### `box.unbind(obj)`

Unbind all functions previously bound to this `EventBox` via call to `bind()`.

#### `box.emit(ev, args...)`

Emit event `ev` with event arguments specified as successive function arguments.

#### `box.emitArray(ev, args)`

Emit event `ev` with event arguments specified as an array.

#### `box.emitAfter(delay, ev, args...)`

Emit event `ev` after `delay` milliseconds. Event arguments are specified as successive function arguments. Returns a function that can be used to cancel the event emission before it occurs.

#### `box.emitEvery(interval, ev, args...)`

Emit event `ev` every `delay` milliseconds. Event arguments are specified as successive function arguments. Returns a function that can be used to cancel the event emission.

## Copyright &amp; License

&copy; 2014 Jason Frame [ [@jaz303](http://twitter.com/jaz303) / [jason@onehackoranother.com](mailto:jason@onehackoranother.com) ]

Released under the ISC license.