# event-box

`event-box` is an alternative to node's built in `EventEmitter`. It is not be a compatible API but it is in a lot of places.

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

#### `box.on(ev, cb, ctx)`

#### `box.on_c(ev, cb, ctx)`

As above but instead returns a cancellation function that can be used to remove the event listener.

#### `box.once(ev, cb, ctx)`

#### `box.once_c(ev, cb, ctx)`

As above but instead returns a cancellation function that can be used to remove the event listener.

#### `box.off([ev], [cb])`

#### `box.emit(ev, args...)`

#### `box.emitArray(ev, args)`

#### `box.emitAfter(delay, ev, args...)`

#### `box.emitEvery(interval, ev, args...)`

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
var obj = 
box.on('foo', doFoo, obj);
box.on('bar', doBar, obj);
```

Attached functions will be called in the context of the bound object.

The optional argument `events` can be used to specify the handlers which should be plucked from the supplied object, otherwise all functions found in the object will be attached.

#### `box.unbind(obj)`

Unbind all functions previously bound to this `EventBox` via call to `bind()`.
