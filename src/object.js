import Emitter from "./emitter";

var objectId = 0;

function onDependentEvent(event, data, desc) {
  this.emit(`change:${desc.name}`, {object: this});
}

function RynoObject() {
  Object.defineProperty(this, 'objectId', {value: ++objectId});
  this.init.apply(this, arguments);
};

// Public: Creates a subclass of `Ryno.Object`.
RynoObject.extend = function(name, f) {
  var subclass = function() { RynoObject.apply(this, arguments); };

  for (let k in this) { if (this.hasOwnProperty(k)) { subclass[k] = this[k]; } }

  subclass.displayName = name;
  subclass.prototype = Object.create(this.prototype);
  subclass.prototype.constructor = subclass;
  subclass.__super__ = this.prototype;

  if (typeof f === 'function') { f.call(subclass); }

  return subclass;
};

// Public: Defines a property on the class's prototype. Properties defined with this method are
// observable using the `Ryno.Object#on` method. When changed, they emit `change:<name>` events.
// The object being changed and the old value of the property are passed along in the event.
//
// name - A string containing the name of the property.
// opts - An object containing one or more of the following keys:
//   get       - A custom property getter function.
//   set       - A custom property setter function.
//   readonly  - Makes the property readonly. Should only be used with the `get` option.
//   default   - Specify a default value for the property.
//   changesOn - An array of event names that when observed, cause the property to change. This
//               should be used with custom `get` functions in order to make the property
//               observable.
//
// Returns the receiver.
RynoObject.prop = function(name, opts = {}) {
  var descriptor = Object.assign({
    name: name,
    get: null,
    set: null,
    readonly: false,
    default: undefined,
    changesOn: []
  }, opts);

  if (!this.prototype.hasOwnProperty('__props__')) {
    this.prototype.__props__ = Object.create(this.prototype.__props__ || null);
  }

  this.prototype.__props__[name] = descriptor;

  Object.defineProperty(this.prototype, name, {
    get: function() { return this.getProp(name); },
    set: descriptor.readonly ? undefined : function(value) { this.setProp(name, value); },
    configurable: false,
    enumerable: true
  });

  return this;
};

// Public: Returns a string containing the class's name.
RynoObject.toString = function() { return this.displayName || this.name || '(Unknown)'; };

// Public: The `Ryno.Object` initializer. Sets the given props and begins observing dependent
// property events. This method should never be called directly, its called by the `Ryno.Object`
// constructor function.
//
// props - An object containing properties to set. Only properties defined via `Ryno.Object.prop`
//         are settable.
//
// Returns the receiver.
RynoObject.prototype.init = function(props = {}) {
  for (let k in props) { if (k in this) { this[k] = props[k]; } }

  for (let k in this.__props__) {
    this.__props__[k].changesOn.forEach((event) => {
      this.on(event, onDependentEvent, {context: this.__props__[k]})
    });
  }

  return this;
};

// Public: Indicates whether the receiver is equal to the given object. The default implementation
// simply does an identity comparison using the `===` operator. You'll likely want to override
// this method in your sub-types in order to perform a more meaningful comparison.
//
// o - An object to compare against the receiver.
//
// Returns a `true` if the objects are equal and `false` otherwise.
RynoObject.prototype.eq = function(other) { return this === other; };

// Internal: Returns the current value of the given property or the default value if it is not
// defined.
//
// Returns the value of the property.
// Throws `Error` if there is no property with the given name.
RynoObject.prototype.getProp = function(name) {
  var descriptor = this.__props__ && this.__props__[name], key = `__${name}`, value;

  if (!descriptor) {
    throw new Error(`Ryno.Object#getProp: unknown prop name \`${name}\``);
  }

  value = descriptor.get ? descriptor.get.call(this) : this[key];
  value = (value === undefined) ? descriptor.default : value;

  return value;
};

// Internal: Sets the value of the given property and emits a `change:<name>` event.
//
// Returns nothing.
// Throws `Error` if there is no property with the given name.
// Throws `TypeError` if the property is readonly.
RynoObject.prototype.setProp = function(name, value) {
  var descriptor = this.__props__ && this.__props__[name],
      key        = `__${name}`,
      old        = this.getProp(name);

  if (!descriptor) {
    throw new Error(`Ryno.Object#setProp: unknown prop name \`${name}\``);
  }

  if (descriptor.readonly) {
    throw new TypeError(`Ryno.Object#setProp: cannot set readonly property \`${name}\` of ${this}`);
  }

  if (descriptor.set) { descriptor.set.call(this, value); }
  else { this[key] = value; }

  this.emit(`change:${name}`, {object: this, old});
};

Object.assign(RynoObject.prototype, Emitter);

export default RynoObject;
