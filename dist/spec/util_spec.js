"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { "default": obj }; };

require("es6-shim");

var util = _interopRequireWildcard(require("../util"));

var BasisObject = _interopRequire(require("../object"));

describe("type", function () {
  it("returns the string 'null' when passed `null`", function () {
    expect(util.type(null)).toBe("null");
  });

  it("returns the string 'undefined' when passed `undefined`", function () {
    expect(util.type(undefined)).toBe("undefined");
    expect(util.type(void 0)).toBe("undefined");
  });

  it("returns the string 'array' when passed an Array instance", function () {
    expect(util.type([])).toBe("array");
    expect(util.type([1, 2, 3])).toBe("array");
  });

  it("returns the string 'arguments' when passed an Arguments instance", function () {
    var args = (function () {
      return arguments;
    })();
    expect(util.type(args)).toBe("arguments");
  });

  it("returns the string 'function' when passed a Function instance", function () {
    expect(util.type(function () {})).toBe("function");
    expect(util.type(Object)).toBe("function");
  });

  it("returns the string 'string' when passed a string", function () {
    expect(util.type("")).toBe("string");
    expect(util.type("foobar")).toBe("string");
  });

  it("returns the string 'number' when passed a number", function () {
    expect(util.type(0)).toBe("number");
    expect(util.type(1.234)).toBe("number");
    expect(util.type(NaN)).toBe("number");
    expect(util.type(1 / 0)).toBe("number");
  });

  it("returns the string 'boolean' when passed `true` or `false`", function () {
    expect(util.type(true)).toBe("boolean");
    expect(util.type(false)).toBe("boolean");
  });

  it("returns the string 'date' when passed a Date instance", function () {
    expect(util.type(new Date())).toBe("date");
  });

  it("returns the string 'regexp' when passed a RegExp instance", function () {
    expect(util.type(/foo/)).toBe("regexp");
    expect(util.type(new RegExp())).toBe("regexp");
  });

  it("should return the string 'object' when passed an Object instance", function () {
    expect(util.type({})).toBe("object");
    expect(util.type({ foo: 1 })).toBe("object");
  });
});

describe("eq", function () {
  describe("given a Basis.Object as the first argument", function () {
    it("invokes `eq` on the first argument", function () {
      var a = new BasisObject(),
          b = new BasisObject();

      spyOn(a, "eq");
      util.eq(a, b);
      expect(a.eq).toHaveBeenCalledWith(b);
    });
  });

  it("returns `true` for identical objects", function () {
    var a = [1, 2],
        o = { foo: 1 },
        d = new Date(2012, 0, 29),
        r = /x/i;
    expect(util.eq(null, null)).toBe(true);
    expect(util.eq(undefined, undefined)).toBe(true);
    expect(util.eq(true, true)).toBe(true);
    expect(util.eq(false, false)).toBe(true);
    expect(util.eq(1, 1)).toBe(true);
    expect(util.eq("foo", "foo")).toBe(true);
    expect(util.eq(r, r)).toBe(true);
    expect(util.eq(d, d)).toBe(true);
    expect(util.eq(a, a)).toBe(true);
    expect(util.eq(o, o)).toBe(true);
  });

  it("returns `false` when given `null` and `undefined`", function () {
    expect(util.eq(null, undefined)).toBe(false);
    expect(util.eq(undefined, null)).toBe(false);
  });

  it("returns `true` for string primitives and their corresponding wrapper objects", function () {
    expect(util.eq("foo", "foo")).toBe(true);
    expect(util.eq("foo", new String("foo"))).toBe(true);
    expect(util.eq(new String("foo"), "foo")).toBe(true);
    expect(util.eq(new String("foo"), new String("foo"))).toBe(true);
  });

  it("returns `false` for string primitives with different values", function () {
    expect(util.eq("foo", "bar")).toBe(false);
    expect(util.eq("foo", "Foo")).toBe(false);
  });

  it("returns `false` for string objects with different values", function () {
    expect(util.eq(new String("foo"), new String("Foo"))).toBe(false);
  });

  it("returns `true` when given `0` and `-0`", function () {
    expect(util.eq(0, -0)).toBe(true);
    expect(util.eq(-0, 0)).toBe(true);
  });

  it("returns `true` for number primitives and their corresponding wrapper objects", function () {
    expect(util.eq(21, 21)).toBe(true);
    expect(util.eq(new Number(21), new Number(21))).toBe(true);
    expect(util.eq(21, new Number(21))).toBe(true);
    expect(util.eq(new Number(21), 21)).toBe(true);
  });

  it("returns `false` for number objects with different values", function () {
    expect(util.eq(new Number(21), new Number(-21))).toBe(false);
    expect(util.eq(new Number(21), 22)).toBe(false);
    expect(util.eq(23, new Number(22))).toBe(false);
    expect(util.eq(23, 23.1)).toBe(false);
  });

  it("returns `false` when both objects are `NaN`", function () {
    expect(util.eq(NaN, NaN)).toBe(false);
  });

  it("returns `false` when `NaN` is compared with any other number value", function () {
    expect(util.eq(NaN, 1)).toBe(false);
    expect(util.eq(1, NaN)).toBe(false);
    expect(util.eq(new Number(1), NaN)).toBe(false);
    expect(util.eq(NaN, new Number(2))).toBe(false);
    expect(util.eq(NaN, Infinity)).toBe(false);
    expect(util.eq(Infinity, NaN)).toBe(false);
  });

  it("returns `true` for boolean primitives and their corresponding wrapper objects", function () {
    expect(util.eq(true, true)).toBe(true);
    expect(util.eq(false, false)).toBe(true);
    expect(util.eq(true, new Boolean(true))).toBe(true);
    expect(util.eq(new Boolean(true), true)).toBe(true);
    expect(util.eq(new Boolean(true), new Boolean(true))).toBe(true);
    expect(util.eq(false, new Boolean(false))).toBe(true);
    expect(util.eq(new Boolean(false), false)).toBe(true);
    expect(util.eq(new Boolean(false), new Boolean(false))).toBe(true);
    expect(util.eq(new Boolean(), new Boolean())).toBe(true);
    expect(util.eq(new Boolean(false), new Boolean())).toBe(true);
    expect(util.eq(new Boolean(), new Boolean(false))).toBe(true);
  });

  it("returns `false` for boolean objects with different primitive objects", function () {
    expect(util.eq(true, false)).toBe(false);
    expect(util.eq(false, true)).toBe(false);
    expect(util.eq(new Boolean(false), new Boolean(true))).toBe(false);
    expect(util.eq(new Boolean(true), new Boolean(false))).toBe(false);
    expect(util.eq(false, new Boolean(true))).toBe(false);
    expect(util.eq(new Boolean(true), false)).toBe(false);
    expect(util.eq(new Boolean(true), new Boolean())).toBe(false);
  });

  it("returns `true` for date objects containing identical times and `false` otherwise", function () {
    expect(util.eq(new Date(2012, 0, 30), new Date(2012, 0, 30))).toBe(true);
    expect(util.eq(new Date(2012, 0, 30, 8, 17, 1, 1), new Date(2012, 0, 30, 8, 17, 1, 1))).toBe(true);
    expect(util.eq(new Date(2012, 1, 2), new Date(2012, 1, 3))).toBe(false);
    expect(util.eq(new Date(2012, 1, 2, 6, 36, 0, 0), new Date(2012, 1, 2, 6, 36, 0, 1))).toBe(false);
  });

  it("returns `true` when given identical function references and `false` otherwise", function () {
    var f = function f() {};

    expect(util.eq(f, f)).toBe(true);
    expect(util.eq(f, function () {})).toBe(false);
  });

  it("returns `true` for regular expressions with equal patterns and flags", function () {
    expect(util.eq(/^a*/gi, /^a*/gi)).toBe(true);
    expect(util.eq(/^a*/ig, /^a*/gi)).toBe(true);
    expect(util.eq(new RegExp("^a*", "igm"), new RegExp("^a*", "igm"))).toBe(true);
    expect(util.eq(new RegExp("^a*", "igm"), new RegExp("^a*", "mig"))).toBe(true);
    expect(util.eq(/^a*/gim, new RegExp("^a*", "mig"))).toBe(true);
  });

  it("returns `false` for regular expressions where the patterns differ", function () {
    expect(util.eq(/^a*/, /a*/)).toBe(false);
    expect(util.eq(/^a*/ig, /a*/ig)).toBe(false);
    expect(util.eq(new RegExp("^a*"), new RegExp("a*"))).toBe(false);
  });

  it("returns `false` for regular expressions where the flags differ", function () {
    expect(util.eq(/^a*/, /^a*/i)).toBe(false);
    expect(util.eq(new RegExp("^a*", "i"), new RegExp("a*", "g"))).toBe(false);
  });

  describe("with native arrays", function () {
    it("returns `false` if any corresponding elements are not equal", function () {
      expect(util.eq([], [1])).toBe(false);
      expect(util.eq([2], [1])).toBe(false);
      expect(util.eq([1, 2], [1])).toBe(false);
      expect(util.eq([1, 2], [2, 1])).toBe(false);
      expect(util.eq([/x/], [/x/i])).toBe(false);
    });

    it("returns `true` if all corresponding elements are equal", function () {
      expect(util.eq([], [])).toBe(true);
      expect(util.eq([1], [1])).toBe(true);
      expect(util.eq([1, "two", /3*/g], [1, "two", /3*/g])).toBe(true);
    });

    it("handles recursive arrays", function () {
      var a1 = [1],
          a2 = [1],
          back,
          forth,
          x;

      a1.push(a1);
      a2.push(a2);
      expect(util.eq(a1, a2)).toBe(true);

      a1.push(a1);
      a2.push(a1);
      expect(util.eq(a1, a2)).toBe(true);

      a2.push("foo");
      expect(util.eq(a1, a2)).toBe(false);

      a1 = [];
      a1.push(a1);

      expect(util.eq(a1, [a1])).toBe(true);
      expect(util.eq(a1, [[a1]])).toBe(true);
      expect(util.eq([a1], a1)).toBe(true);
      expect(util.eq([[a1]], a1)).toBe(true);

      back = [];
      forth = [back];
      back.push(forth);
      expect(util.eq(back, a1)).toBe(true);

      x = [];
      x.push(x, x);
      expect(util.eq(x, a1)).toBe(false);
      expect(util.eq(x, [a1, a1])).toBe(false);
      expect(util.eq(x, [x, a1])).toBe(false);
      expect(util.eq([x, a1], [a1, x])).toBe(false);
      expect(util.eq(x, [x, x])).toBe(true);
      expect(util.eq(x, [[x, x], [x, x]])).toBe(true);
    });

    it("handles multi-demensional arrays", function () {
      expect(util.eq([[]], [[]])).toBe(true);
      expect(util.eq([1, [2, 3]], [1, [2, 3]])).toBe(true);
      expect(util.eq([1, [2, 3]], [1, 2, [3]])).toBe(false);
    });

    it("ignores non-numeric properties", function () {
      var a1 = [1, 2, 3],
          a2 = [1, 2, 3];

      a1.foo = "bar";
      expect(util.eq(a1, a2)).toBe(true);
    });
  });

  describe("with plain objects", function () {
    it("returns `false` when the number of keys differ between the two objects", function () {
      expect(util.eq({}, { foo: 1 })).toBe(false);
      expect(util.eq({ foo: 1, bar: 2 }, { foo: 1 })).toBe(false);
    });

    it("returns `false` when there are different keys", function () {
      expect(util.eq({ foo: 1 }, { food: 1 })).toBe(false);
    });

    it("returns `false` when there are different values for the same keys", function () {
      expect(util.eq({ foo: 1 }, { foo: 2 })).toBe(false);
      expect(util.eq({ foo: 1, bar: 2 }, { foo: 2, bar: 3 })).toBe(false);
    });

    it("returns `true` when each key/value pair is equal", function () {
      expect(util.eq({}, {})).toBe(true);
      expect(util.eq({ foo: 1 }, { foo: 1 })).toBe(true);
      expect(util.eq({ foo: 1, bar: 2 }, { foo: 1, bar: 2 })).toBe(true);
      expect(util.eq({ bar: 2, foo: 1 }, { foo: 1, bar: 2 })).toBe(true);
    });

    it("handles nested objects", function () {
      expect(util.eq({ a: { b: "c" } }, { a: { b: "c" } })).toBe(true);
      expect(util.eq({ a: { b: "c" } }, { a: { b: "d" } })).toBe(false);

      expect(util.eq({ a: { b: [{ stuff: true }, 2, 3] }, foo: /y/ }, { foo: /y/, a: { b: [{ stuff: true }, 2, 3] } })).toBe(true);

      expect(util.eq({ a: { b: [{ stuff: true }, 2, 3] }, foo: /y/ }, { foo: /y/, a: { b: [{ stuff: false }, 2, 3] } })).toBe(false);
    });

    it("handles recursive objects", function () {
      var o = {};
      o.a = o;

      expect(util.eq(o, o.a)).toBe(true);
    });

    it("handles complex recursive objects", function () {
      var a = {},
          b = {},
          c = {};

      a.self = a;
      a.other = b;
      b.self = b;
      b.other = a;
      expect(util.eq(a, b)).toBe(true);

      c.other = c;
      c.self = c;
      expect(util.eq(c, a)).toBe(true);

      a.delta = a;
      c.delta = a;
      expect(util.eq(c, a)).toBe(false);

      c.delta = 42;
      expect(util.eq(c, a)).toBe(false);

      a.delta = 42;
      expect(util.eq(c, a)).toBe(false);

      b.delta = 42;
      expect(util.eq(c, a)).toBe(true);
    });

    it("handles complex recursive objects and arrays", function () {
      var x = [],
          y = [],
          z = [],
          a,
          b,
          c;

      a = { foo: x, bar: 42 };
      b = { foo: y, bar: 42 };
      c = { foo: z, bar: 42 };

      x.push(a);
      y.push(c);
      z.push(b);

      expect(util.eq(b, c)).toBe(true);
      expect(util.eq(y, z)).toBe(true);
      expect(util.eq(a, b)).toBe(true);

      expect(util.eq(x, y)).toBe(true);
      y.push(x);
      expect(util.eq(y, z)).toBe(false);
      z.push(x);
      expect(util.eq(y, z)).toBe(true);

      a.foo = a.bar;
      a.bar = a.foo;
      expect(util.eq(a, b)).toBe(false);
      b.bar = b.foo;
      expect(util.eq(b, c)).toBe(false);
    });
  });
});

describe("camelize", function () {
  it("camelizes the given string", function () {
    expect(util.camelize("foo_bar")).toBe("fooBar");
    expect(util.camelize("foo_bar_baz")).toBe("fooBarBaz");
    expect(util.camelize("foo_Bar_Baz")).toBe("fooBarBaz");
    expect(util.camelize("foobar")).toBe("foobar");
    expect(util.camelize("Foobar")).toBe("Foobar");
    expect(util.camelize("Foo_bar")).toBe("FooBar");
  });
});

describe("underscore", function () {
  it("underscores the given string", function () {
    expect(util.underscore("FooBar")).toBe("foo_bar");
    expect(util.underscore("fooBar")).toBe("foo_bar");
    expect(util.underscore("fooBarBaz")).toBe("foo_bar_baz");
    expect(util.underscore("fooBar_Baz")).toBe("foo_bar_baz");
    expect(util.underscore("Foo")).toBe("foo");
  });
});

describe("capitalize", function () {
  it("capitalizes the given string", function () {
    expect(util.capitalize("foo")).toBe("Foo");
    expect(util.capitalize("fooBar")).toBe("FooBar");
    expect(util.capitalize("FOO")).toBe("FOO");
    expect(util.capitalize("Foo")).toBe("Foo");
  });
});