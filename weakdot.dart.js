function $defProp(obj, prop, value) {
  Object.defineProperty(obj, prop,
      {value: value, enumerable: false, writable: true, configurable: true});
}
function $throw(e) {
  // If e is not a value, we can use V8's captureStackTrace utility method.
  // TODO(jmesserly): capture the stack trace on other JS engines.
  if (e && (typeof e == 'object') && Error.captureStackTrace) {
    // TODO(jmesserly): this will clobber the e.stack property
    Error.captureStackTrace(e, $throw);
  }
  throw e;
}
$defProp(Object.prototype, '$index', function(i) {
  $throw(new NoSuchMethodException(this, "operator []", [i]));
});
$defProp(Array.prototype, '$index', function(index) {
  var i = index | 0;
  if (i !== index) {
    throw new IllegalArgumentException('index is not int');
  } else if (i < 0 || i >= this.length) {
    throw new IndexOutOfRangeException(index);
  }
  return this[i];
});
$defProp(String.prototype, '$index', function(i) {
  return this[i];
});
$defProp(Object.prototype, '$setindex', function(i, value) {
  $throw(new NoSuchMethodException(this, "operator []=", [i, value]));
});
$defProp(Array.prototype, '$setindex', function(index, value) {
  var i = index | 0;
  if (i !== index) {
    throw new IllegalArgumentException('index is not int');
  } else if (i < 0 || i >= this.length) {
    throw new IndexOutOfRangeException(index);
  }
  return this[i] = value;
});
function $wrap_call$0(fn) { return fn; }
function $wrap_call$1(fn) { return fn; };
function $wrap_call$2(fn) { return fn; };
function $add$complex$(x, y) {
  if (typeof(x) == 'number') {
    $throw(new IllegalArgumentException(y));
  } else if (typeof(x) == 'string') {
    var str = (y == null) ? 'null' : y.toString();
    if (typeof(str) != 'string') {
      throw new Error("calling toString() on right hand operand of operator " +
      "+ did not return a String");
    }
    return x + str;
  } else if (typeof(x) == 'object') {
    return x.$add(y);
  } else {
    $throw(new NoSuchMethodException(x, "operator +", [y]));
  }
}

function $add$(x, y) {
  if (typeof(x) == 'number' && typeof(y) == 'number') return x + y;
  return $add$complex$(x, y);
}
function $eq$(x, y) {
  if (x == null) return y == null;
  return (typeof(x) != 'object') ? x === y : x.$eq(y);
}
// TODO(jimhug): Should this or should it not match equals?
$defProp(Object.prototype, '$eq', function(other) {
  return this === other;
});
function $ne$(x, y) {
  if (x == null) return y != null;
  return (typeof(x) != 'object') ? x !== y : !x.$eq(y);
}
function $truncdiv$(x, y) {
  if (typeof(x) == 'number') {
    if (typeof(y) == 'number') {
      if (y == 0) $throw(new IntegerDivisionByZeroException());
      var tmp = x / y;
      return (tmp < 0) ? Math.ceil(tmp) : Math.floor(tmp);
    } else {
      $throw(new IllegalArgumentException(y));
    }
  } else if (typeof(x) == 'object') {
    return x.$truncdiv(y);
  } else {
    $throw(new NoSuchMethodException(x, "operator ~/", [y]));
  }
}
$defProp(Object.prototype, '$typeNameOf', (function() {
  function constructorNameWithFallback(obj) {
    var constructor = obj.constructor;
    if (typeof(constructor) == 'function') {
      // The constructor isn't null or undefined at this point. Try
      // to grab hold of its name.
      var name = constructor.name;
      // If the name is a non-empty string, we use that as the type
      // name of this object. On Firefox, we often get 'Object' as
      // the constructor name even for more specialized objects so
      // we have to fall through to the toString() based implementation
      // below in that case.
      if (typeof(name) == 'string' && name && name != 'Object') return name;
    }
    var string = Object.prototype.toString.call(obj);
    return string.substring(8, string.length - 1);
  }

  function chrome$typeNameOf() {
    var name = this.constructor.name;
    if (name == 'Window') return 'DOMWindow';
    if (name == 'CanvasPixelArray') return 'Uint8ClampedArray';
    return name;
  }

  function firefox$typeNameOf() {
    var name = constructorNameWithFallback(this);
    if (name == 'Window') return 'DOMWindow';
    if (name == 'Document') return 'HTMLDocument';
    if (name == 'XMLDocument') return 'Document';
    if (name == 'WorkerMessageEvent') return 'MessageEvent';
    return name;
  }

  function ie$typeNameOf() {
    var name = constructorNameWithFallback(this);
    if (name == 'Window') return 'DOMWindow';
    // IE calls both HTML and XML documents 'Document', so we check for the
    // xmlVersion property, which is the empty string on HTML documents.
    if (name == 'Document' && this.xmlVersion) return 'Document';
    if (name == 'Document') return 'HTMLDocument';
    if (name == 'HTMLTableDataCellElement') return 'HTMLTableCellElement';
    if (name == 'HTMLTableHeaderCellElement') return 'HTMLTableCellElement';
    if (name == 'MSStyleCSSProperties') return 'CSSStyleDeclaration';
    return name;
  }

  // If we're not in the browser, we're almost certainly running on v8.
  if (typeof(navigator) != 'object') return chrome$typeNameOf;

  var userAgent = navigator.userAgent;
  if (/Chrome|DumpRenderTree/.test(userAgent)) return chrome$typeNameOf;
  if (/Firefox/.test(userAgent)) return firefox$typeNameOf;
  if (/MSIE/.test(userAgent)) return ie$typeNameOf;
  return function() { return constructorNameWithFallback(this); };
})());
$defProp(Object.prototype, "get$typeName", Object.prototype.$typeNameOf);
/** Implements extends for Dart classes on JavaScript prototypes. */
function $inherits(child, parent) {
  if (child.prototype.__proto__) {
    child.prototype.__proto__ = parent.prototype;
  } else {
    function tmp() {};
    tmp.prototype = parent.prototype;
    child.prototype = new tmp();
    child.prototype.constructor = child;
  }
}
function $dynamic(name) {
  var f = Object.prototype[name];
  if (f && f.methods) return f.methods;

  var methods = {};
  if (f) methods.Object = f;
  function $dynamicBind() {
    // Find the target method
    var obj = this;
    var tag = obj.$typeNameOf();
    var method = methods[tag];
    if (!method) {
      var table = $dynamicMetadata;
      for (var i = 0; i < table.length; i++) {
        var entry = table[i];
        if (entry.map.hasOwnProperty(tag)) {
          method = methods[entry.tag];
          if (method) break;
        }
      }
    }
    method = method || methods.Object;

    var proto = Object.getPrototypeOf(obj);

    if (method == null) {
      // Trampoline to throw NoSuchMethodException (TODO: call noSuchMethod).
      method = function(){
        // Exact type check to prevent this code shadowing the dispatcher from a
        // subclass.
        if (Object.getPrototypeOf(this) === proto) {
          // TODO(sra): 'name' is the jsname, should be the Dart name.
          $throw(new NoSuchMethodException(
              obj, name, Array.prototype.slice.call(arguments)));
        }
        return Object.prototype[name].apply(this, arguments);
      };
    }

    if (!proto.hasOwnProperty(name)) {
      $defProp(proto, name, method);
    }

    return method.apply(this, Array.prototype.slice.call(arguments));
  };
  $dynamicBind.methods = methods;
  $defProp(Object.prototype, name, $dynamicBind);
  return methods;
}
if (typeof $dynamicMetadata == 'undefined') $dynamicMetadata = [];
Function.prototype.bind = Function.prototype.bind ||
  function(thisObj) {
    var func = this;
    var funcLength = func.$length || func.length;
    var argsLength = arguments.length;
    if (argsLength > 1) {
      var boundArgs = Array.prototype.slice.call(arguments, 1);
      var bound = function() {
        // Prepend the bound arguments to the current arguments.
        var newArgs = Array.prototype.slice.call(arguments);
        Array.prototype.unshift.apply(newArgs, boundArgs);
        return func.apply(thisObj, newArgs);
      };
      bound.$length = Math.max(0, funcLength - (argsLength - 1));
      return bound;
    } else {
      var bound = function() {
        return func.apply(thisObj, arguments);
      };
      bound.$length = funcLength;
      return bound;
    }
  };
function $dynamicSetMetadata(inputTable) {
  // TODO: Deal with light isolates.
  var table = [];
  for (var i = 0; i < inputTable.length; i++) {
    var tag = inputTable[i][0];
    var tags = inputTable[i][1];
    var map = {};
    var tagNames = tags.split('|');
    for (var j = 0; j < tagNames.length; j++) {
      map[tagNames[j]] = true;
    }
    table.push({tag: tag, tags: tags, map: map});
  }
  $dynamicMetadata = table;
}
$defProp(Object.prototype, "get$dynamic", function() {
  "use strict"; return this;
});
$defProp(Object.prototype, "noSuchMethod", function(name, args) {
  $throw(new NoSuchMethodException(this, name, args));
});
$defProp(Object.prototype, "$dom_addEventListener$3", function($0, $1, $2) {
  return this.noSuchMethod("$dom_addEventListener", [$0, $1, $2]);
});
$defProp(Object.prototype, "$dom_removeEventListener$3", function($0, $1, $2) {
  return this.noSuchMethod("$dom_removeEventListener", [$0, $1, $2]);
});
$defProp(Object.prototype, "accept$1", function($0) {
  return this.noSuchMethod("accept", [$0]);
});
$defProp(Object.prototype, "add$1", function($0) {
  return this.noSuchMethod("add", [$0]);
});
$defProp(Object.prototype, "clear$0", function() {
  return this.noSuchMethod("clear", []);
});
$defProp(Object.prototype, "close$2", function($0, $1) {
  return this.noSuchMethod("close", [$0, $1]);
});
$defProp(Object.prototype, "contains$1", function($0) {
  return this.noSuchMethod("contains", [$0]);
});
$defProp(Object.prototype, "end$0", function() {
  return this.noSuchMethod("end", []);
});
$defProp(Object.prototype, "filter$1", function($0) {
  return this.noSuchMethod("filter", [$0]);
});
$defProp(Object.prototype, "forEach$1", function($0) {
  return this.noSuchMethod("forEach", [$0]);
});
$defProp(Object.prototype, "indexOf$1", function($0) {
  return this.noSuchMethod("indexOf", [$0]);
});
$defProp(Object.prototype, "is$Collection", function() {
  return false;
});
$defProp(Object.prototype, "is$List", function() {
  return false;
});
$defProp(Object.prototype, "is$Map", function() {
  return false;
});
$defProp(Object.prototype, "is$Map_dart_core_String$Dynamic", function() {
  return false;
});
$defProp(Object.prototype, "is$RegExp", function() {
  return false;
});
$defProp(Object.prototype, "is$html_Element", function() {
  return false;
});
$defProp(Object.prototype, "parse$1", function($0) {
  return this.noSuchMethod("parse", [$0]);
});
$defProp(Object.prototype, "query$1", function($0) {
  return this.noSuchMethod("query", [$0]);
});
$defProp(Object.prototype, "remove$0", function() {
  return this.noSuchMethod("remove", []);
});
$defProp(Object.prototype, "remove$1", function($0) {
  return this.noSuchMethod("remove", [$0]);
});
$defProp(Object.prototype, "some$1", function($0) {
  return this.noSuchMethod("some", [$0]);
});
$defProp(Object.prototype, "sort$1", function($0) {
  return this.noSuchMethod("sort", [$0]);
});
$defProp(Object.prototype, "start$0", function() {
  return this.noSuchMethod("start", []);
});
function IndexOutOfRangeException(_index) {
  this._index = _index;
}
IndexOutOfRangeException.prototype.is$IndexOutOfRangeException = function(){return true};
IndexOutOfRangeException.prototype.toString = function() {
  return ("IndexOutOfRangeException: " + this._index);
}
function IllegalAccessException() {

}
IllegalAccessException.prototype.toString = function() {
  return "Attempt to modify an immutable object";
}
function NoSuchMethodException(_receiver, _functionName, _arguments, _existingArgumentNames) {
  this._receiver = _receiver;
  this._functionName = _functionName;
  this._arguments = _arguments;
  this._existingArgumentNames = _existingArgumentNames;
}
NoSuchMethodException.prototype.is$NoSuchMethodException = function(){return true};
NoSuchMethodException.prototype.toString = function() {
  var sb = new StringBufferImpl("");
  for (var i = (0);
   i < this._arguments.get$length(); i++) {
    if (i > (0)) {
      sb.add(", ");
    }
    sb.add(this._arguments.$index(i));
  }
  if (null == this._existingArgumentNames) {
    return (("NoSuchMethodException : method not found: '" + this._functionName + "'\n") + ("Receiver: " + this._receiver + "\n") + ("Arguments: [" + sb + "]"));
  }
  else {
    var actualParameters = sb.toString();
    sb = new StringBufferImpl("");
    for (var i = (0);
     i < this._existingArgumentNames.get$length(); i++) {
      if (i > (0)) {
        sb.add(", ");
      }
      sb.add(this._existingArgumentNames.$index(i));
    }
    var formalParameters = sb.toString();
    return ("NoSuchMethodException: incorrect number of arguments passed to " + ("method named '" + this._functionName + "'\nReceiver: " + this._receiver + "\n") + ("Tried calling: " + this._functionName + "(" + actualParameters + ")\n") + ("Found: " + this._functionName + "(" + formalParameters + ")"));
  }
}
function ClosureArgumentMismatchException() {

}
ClosureArgumentMismatchException.prototype.toString = function() {
  return "Closure argument mismatch";
}
function ObjectNotClosureException() {

}
ObjectNotClosureException.prototype.toString = function() {
  return "Object is not closure";
}
function IllegalArgumentException(arg) {
  this._arg = arg;
}
IllegalArgumentException.prototype.is$IllegalArgumentException = function(){return true};
IllegalArgumentException.prototype.toString = function() {
  return ("Illegal argument(s): " + this._arg);
}
function StackOverflowException() {

}
StackOverflowException.prototype.toString = function() {
  return "Stack Overflow";
}
function BadNumberFormatException(_s) {
  this._s = _s;
}
BadNumberFormatException.prototype.toString = function() {
  return ("BadNumberFormatException: '" + this._s + "'");
}
function NullPointerException(functionName, arguments) {
  this.functionName = functionName;
  this.arguments = arguments;
}
NullPointerException.prototype.toString = function() {
  if (this.functionName == null) {
    return this.get$exceptionName();
  }
  else {
    return (("" + this.get$exceptionName() + " : method: '" + this.functionName + "'\n") + "Receiver: null\n" + ("Arguments: " + this.arguments));
  }
}
NullPointerException.prototype.get$exceptionName = function() {
  return "NullPointerException";
}
function NoMoreElementsException() {

}
NoMoreElementsException.prototype.toString = function() {
  return "NoMoreElementsException";
}
function EmptyQueueException() {

}
EmptyQueueException.prototype.toString = function() {
  return "EmptyQueueException";
}
function UnsupportedOperationException(_message) {
  this._message = _message;
}
UnsupportedOperationException.prototype.toString = function() {
  return ("UnsupportedOperationException: " + this._message);
}
function NotImplementedException() {

}
NotImplementedException.prototype.toString = function() {
  return "NotImplementedException";
}
function IntegerDivisionByZeroException() {

}
IntegerDivisionByZeroException.prototype.is$IntegerDivisionByZeroException = function(){return true};
IntegerDivisionByZeroException.prototype.toString = function() {
  return "IntegerDivisionByZeroException";
}
Function.prototype.to$call$0 = function() {
  this.call$0 = this._genStub(0);
  this.to$call$0 = function() { return this.call$0; };
  return this.call$0;
};
Function.prototype.call$0 = function() {
  return this.to$call$0()();
};
function to$call$0(f) { return f && f.to$call$0(); }
Function.prototype.to$call$1 = function() {
  this.call$1 = this._genStub(1);
  this.to$call$1 = function() { return this.call$1; };
  return this.call$1;
};
Function.prototype.call$1 = function($0) {
  return this.to$call$1()($0);
};
function to$call$1(f) { return f && f.to$call$1(); }
Function.prototype.to$call$2 = function() {
  this.call$2 = this._genStub(2);
  this.to$call$2 = function() { return this.call$2; };
  return this.call$2;
};
Function.prototype.call$2 = function($0, $1) {
  return this.to$call$2()($0, $1);
};
function to$call$2(f) { return f && f.to$call$2(); }
function FutureNotCompleteException() {

}
FutureNotCompleteException.prototype.toString = function() {
  return "Exception: future has not been completed";
}
function FutureAlreadyCompleteException() {

}
FutureAlreadyCompleteException.prototype.toString = function() {
  return "Exception: future already completed";
}
Math.parseInt = function(str) {
    var match = /^\s*[+-]?(?:(0[xX][abcdefABCDEF0-9]+)|\d+)\s*$/.exec(str);
    if (!match) $throw(new BadNumberFormatException(str));
    var isHex = !!match[1];
    var ret = parseInt(str, isHex ? 16 : 10);
    if (isNaN(ret)) $throw(new BadNumberFormatException(str));
    return ret;
}
Math.max = function(a, b) {
  return (a >= b) ? a : b;
}
function Strings() {}
Strings.join = function(strings, separator) {
  return StringBase.join(strings, separator);
}
function print$(obj) {
  return _print(obj);
}
function _print(obj) {
  if (typeof console == 'object') {
    if (obj) obj = obj.toString();
    console.log(obj);
  } else if (typeof write === 'function') {
    write(obj);
    write('\n');
  }
}
function _toDartException(e) {
  function attachStack(dartEx) {
    // TODO(jmesserly): setting the stack property is not a long term solution.
    var stack = e.stack;
    // The stack contains the error message, and the stack is all that is
    // printed (the exception's toString() is never called).  Make the Dart
    // exception's toString() be the dominant message.
    if (typeof stack == 'string') {
      var message = dartEx.toString();
      if (/^(Type|Range)Error:/.test(stack)) {
        // Indent JS message (it can be helpful) so new message stands out.
        stack = '    (' + stack.substring(0, stack.indexOf('\n')) + ')\n' +
                stack.substring(stack.indexOf('\n') + 1);
      }
      stack = message + '\n' + stack;
    }
    dartEx.stack = stack;
    return dartEx;
  }

  if (e instanceof TypeError) {
    switch(e.type) {
      case 'property_not_function':
      case 'called_non_callable':
        if (e.arguments[0] == null) {
          return attachStack(new NullPointerException(null, []));
        } else {
          return attachStack(new ObjectNotClosureException());
        }
        break;
      case 'non_object_property_call':
      case 'non_object_property_load':
        return attachStack(new NullPointerException(null, []));
        break;
      case 'undefined_method':
        var mname = e.arguments[0];
        if (typeof(mname) == 'string' && (mname.indexOf('call$') == 0
            || mname == 'call' || mname == 'apply')) {
          return attachStack(new ObjectNotClosureException());
        } else {
          // TODO(jmesserly): fix noSuchMethod on operators so we don't hit this
          return attachStack(new NoSuchMethodException('', e.arguments[0], []));
        }
        break;
    }
  } else if (e instanceof RangeError) {
    if (e.message.indexOf('call stack') >= 0) {
      return attachStack(new StackOverflowException());
    }
  }
  return e;
}
var ListFactory = Array;
$defProp(ListFactory.prototype, "is$List", function(){return true});
$defProp(ListFactory.prototype, "is$Collection", function(){return true});
ListFactory.ListFactory$from$factory = function(other) {
  var list = [];
  for (var $$i = other.iterator(); $$i.hasNext(); ) {
    var e = $$i.next();
    list.add$1(e);
  }
  return list;
}
$defProp(ListFactory.prototype, "get$length", function() { return this.length; });
$defProp(ListFactory.prototype, "set$length", function(value) { return this.length = value; });
$defProp(ListFactory.prototype, "add", function(value) {
  this.push(value);
});
$defProp(ListFactory.prototype, "addAll", function(collection) {
  for (var $$i = collection.iterator(); $$i.hasNext(); ) {
    var item = $$i.next();
    this.add(item);
  }
});
$defProp(ListFactory.prototype, "clear$_", function() {
  this.set$length((0));
});
$defProp(ListFactory.prototype, "removeLast", function() {
  return this.pop();
});
$defProp(ListFactory.prototype, "last", function() {
  return this.$index(this.get$length() - (1));
});
$defProp(ListFactory.prototype, "getRange", function(start, rangeLength) {
  if (rangeLength == (0)) return [];
  if (rangeLength < (0)) $throw(new IllegalArgumentException("length"));
  if (start < (0) || start + rangeLength > this.get$length()) $throw(new IndexOutOfRangeException(start));
  return this.slice(start, start + rangeLength);
});
$defProp(ListFactory.prototype, "removeRange", function(start, rangeLength) {
  if (rangeLength == (0)) return;
  if (rangeLength < (0)) $throw(new IllegalArgumentException("length"));
  if (start < (0) || start + rangeLength > this.get$length()) $throw(new IndexOutOfRangeException(start));
  this.splice(start, rangeLength);
});
$defProp(ListFactory.prototype, "iterator", function() {
  return new ListIterator(this);
});
$defProp(ListFactory.prototype, "toString", function() {
  return Collections.collectionToString(this);
});
$defProp(ListFactory.prototype, "add$1", ListFactory.prototype.add);
$defProp(ListFactory.prototype, "clear$0", ListFactory.prototype.clear$_);
$defProp(ListFactory.prototype, "filter$1", function($0) {
  return this.filter(to$call$1($0));
});
$defProp(ListFactory.prototype, "forEach$1", function($0) {
  return this.forEach(to$call$1($0));
});
$defProp(ListFactory.prototype, "indexOf$1", ListFactory.prototype.indexOf);
$defProp(ListFactory.prototype, "some$1", function($0) {
  return this.some(to$call$1($0));
});
$defProp(ListFactory.prototype, "sort$1", function($0) {
  return this.sort(to$call$2($0));
});
function ListIterator(array) {
  this._array = array;
  this._pos = (0);
}
ListIterator.prototype.hasNext = function() {
  return this._array.get$length() > this._pos;
}
ListIterator.prototype.next = function() {
  if (!this.hasNext()) {
    $throw(const$0001);
  }
  return this._array.$index(this._pos++);
}
$inherits(ImmutableList, ListFactory);
function ImmutableList(length) {
  Array.call(this, length);
}
ImmutableList.ImmutableList$from$factory = function(other) {
  return _constList(other);
}
ImmutableList.prototype.get$length = function() {
  return this.length;
}
ImmutableList.prototype.set$length = function(length) {
  $throw(const$0015);
}
ImmutableList.prototype.$setindex = function(index, value) {
  $throw(const$0015);
}
ImmutableList.prototype.removeRange = function(start, length) {
  $throw(const$0015);
}
ImmutableList.prototype.sort = function(compare) {
  $throw(const$0015);
}
ImmutableList.prototype.add = function(element) {
  $throw(const$0015);
}
ImmutableList.prototype.addAll = function(elements) {
  $throw(const$0015);
}
ImmutableList.prototype.clear$_ = function() {
  $throw(const$0015);
}
ImmutableList.prototype.removeLast = function() {
  $throw(const$0015);
}
ImmutableList.prototype.toString = function() {
  return Collections.collectionToString(this);
}
ImmutableList.prototype.add$1 = ImmutableList.prototype.add;
ImmutableList.prototype.clear$0 = ImmutableList.prototype.clear$_;
ImmutableList.prototype.sort$1 = function($0) {
  return this.sort(to$call$2($0));
};
function ImmutableMap(keyValuePairs) {
  this._internal = _map(keyValuePairs);
}
ImmutableMap.prototype.is$Map = function(){return true};
ImmutableMap.prototype.is$Map_dart_core_String$Dynamic = function(){return true};
ImmutableMap.prototype.$index = function(key) {
  return this._internal.$index(key);
}
ImmutableMap.prototype.get$length = function() {
  return this._internal.get$length();
}
ImmutableMap.prototype.forEach = function(f) {
  this._internal.forEach$1(f);
}
ImmutableMap.prototype.getKeys = function() {
  return this._internal.getKeys();
}
ImmutableMap.prototype.containsKey = function(key) {
  return this._internal.containsKey(key);
}
ImmutableMap.prototype.$setindex = function(key, value) {
  $throw(const$0015);
}
ImmutableMap.prototype.clear$_ = function() {
  $throw(const$0015);
}
ImmutableMap.prototype.remove = function(key) {
  $throw(const$0015);
}
ImmutableMap.prototype.toString = function() {
  return Maps.mapToString(this);
}
ImmutableMap.prototype.clear$0 = ImmutableMap.prototype.clear$_;
ImmutableMap.prototype.forEach$1 = function($0) {
  return this.forEach(to$call$2($0));
};
ImmutableMap.prototype.remove$1 = ImmutableMap.prototype.remove;
function JSSyntaxRegExp(pattern, multiLine, ignoreCase) {
  JSSyntaxRegExp._create$ctor.call(this, pattern, $add$(($eq$(multiLine, true) ? "m" : ""), ($eq$(ignoreCase, true) ? "i" : "")));
}
JSSyntaxRegExp._create$ctor = function(pattern, flags) {
  this.re = new RegExp(pattern, flags);
      this.pattern = pattern;
      this.multiLine = this.re.multiline;
      this.ignoreCase = this.re.ignoreCase;
}
JSSyntaxRegExp._create$ctor.prototype = JSSyntaxRegExp.prototype;
JSSyntaxRegExp.prototype.is$RegExp = function(){return true};
JSSyntaxRegExp.prototype.firstMatch = function(str) {
  var m = this._exec(str);
  return m == null ? null : new MatchImplementation(this.pattern, str, this._matchStart(m), this.get$_lastIndex(), m);
}
JSSyntaxRegExp.prototype._exec = function(str) {
  return this.re.exec(str);
}
JSSyntaxRegExp.prototype._matchStart = function(m) {
  return m.index;
}
JSSyntaxRegExp.prototype.get$_lastIndex = function() {
  return this.re.lastIndex;
}
JSSyntaxRegExp.prototype.hasMatch = function(str) {
  return this.re.test(str);
}
JSSyntaxRegExp.prototype.allMatches = function(str) {
  return new _AllMatchesIterable(this, str);
}
JSSyntaxRegExp.prototype.get$_global = function() {
  return new JSSyntaxRegExp._create$ctor(this.pattern, $add$($add$("g", (this.multiLine ? "m" : "")), (this.ignoreCase ? "i" : "")));
}
function MatchImplementation(pattern, str, _start, _end, _groups) {
  this.pattern = pattern;
  this.str = str;
  this._start = _start;
  this._end = _end;
  this._groups = _groups;
}
MatchImplementation.prototype.start = function() {
  return this._start;
}
MatchImplementation.prototype.end = function() {
  return this._end;
}
MatchImplementation.prototype.group = function(groupIndex) {
  return this._groups.$index(groupIndex);
}
MatchImplementation.prototype.$index = function(groupIndex) {
  return this._groups.$index(groupIndex);
}
MatchImplementation.prototype.end$0 = MatchImplementation.prototype.end;
MatchImplementation.prototype.start$0 = MatchImplementation.prototype.start;
function _AllMatchesIterable(_re, _str) {
  this._re = _re;
  this._str = _str;
}
_AllMatchesIterable.prototype.iterator = function() {
  return new _AllMatchesIterator(this._re, this._str);
}
function _AllMatchesIterator(re, _str) {
  this._str = _str;
  this._done = false;
  this._re = re.get$_global();
}
_AllMatchesIterator.prototype.next = function() {
  if (!this.hasNext()) {
    $throw(const$0001);
  }
  var result = this._next;
  this._next = null;
  return result;
}
_AllMatchesIterator.prototype.hasNext = function() {
  if (this._done) {
    return false;
  }
  else if (this._next != null) {
    return true;
  }
  this._next = this._re.firstMatch(this._str);
  if (this._next == null) {
    this._done = true;
    return false;
  }
  else {
    return true;
  }
}
var NumImplementation = Number;
NumImplementation.prototype.isNaN = function() {
  'use strict'; return isNaN(this);
}
NumImplementation.prototype.isNegative = function() {
  'use strict'; return this == 0 ? (1 / this) < 0 : this < 0;
}
NumImplementation.prototype.hashCode = function() {
  'use strict'; return this & 0x1FFFFFFF;
}
NumImplementation.prototype.toDouble = function() {
  'use strict'; return this + 0;
}
NumImplementation.prototype.compareTo = function(other) {
  var thisValue = this.toDouble();
  if (thisValue < other) {
    return (-1);
  }
  else if (thisValue > other) {
    return (1);
  }
  else if (thisValue == other) {
    if (thisValue == (0)) {
      var thisIsNegative = this.isNegative();
      var otherIsNegative = other.isNegative();
      if ($eq$(thisIsNegative, otherIsNegative)) return (0);
      if (thisIsNegative) return (-1);
      return (1);
    }
    return (0);
  }
  else if (this.isNaN()) {
    if (other.isNaN()) {
      return (0);
    }
    return (1);
  }
  else {
    return (-1);
  }
}
function Collections() {}
Collections.collectionToString = function(c) {
  var result = new StringBufferImpl("");
  Collections._emitCollection(c, result, new Array());
  return result.toString();
}
Collections._emitCollection = function(c, result, visiting) {
  visiting.add(c);
  var isList = !!(c && c.is$List());
  result.add(isList ? "[" : "{");
  var first = true;
  for (var $$i = c.iterator(); $$i.hasNext(); ) {
    var e = $$i.next();
    if (!first) {
      result.add(", ");
    }
    first = false;
    Collections._emitObject(e, result, visiting);
  }
  result.add(isList ? "]" : "}");
  visiting.removeLast();
}
Collections._emitObject = function(o, result, visiting) {
  if (!!(o && o.is$Collection())) {
    if (Collections._containsRef(visiting, o)) {
      result.add(!!(o && o.is$List()) ? "[...]" : "{...}");
    }
    else {
      Collections._emitCollection(o, result, visiting);
    }
  }
  else if (!!(o && o.is$Map())) {
    if (Collections._containsRef(visiting, o)) {
      result.add("{...}");
    }
    else {
      Maps._emitMap(o, result, visiting);
    }
  }
  else {
    result.add($eq$(o) ? "null" : o);
  }
}
Collections._containsRef = function(c, ref) {
  for (var $$i = c.iterator(); $$i.hasNext(); ) {
    var e = $$i.next();
    if ((null == e ? null == (ref) : e === ref)) return true;
  }
  return false;
}
function FutureImpl() {
  this._isComplete = false;
  this._exceptionHandled = false;
  this._listeners = [];
  this._exceptionHandlers = [];
}
FutureImpl.prototype.get$value = function() {
  if (!this.get$isComplete()) {
    $throw(new FutureNotCompleteException());
  }
  if (null != this._exception) {
    $throw(this._exception);
  }
  return this._value;
}
FutureImpl.prototype.get$isComplete = function() {
  return this._isComplete;
}
FutureImpl.prototype.get$hasValue = function() {
  return this.get$isComplete() && null == this._exception;
}
FutureImpl.prototype.then = function(onComplete) {
  if (this.get$hasValue()) {
    onComplete(this.get$value());
  }
  else if (!this.get$isComplete()) {
    this._listeners.add(onComplete);
  }
  else if (!this._exceptionHandled) {
    $throw(this._exception);
  }
}
FutureImpl.prototype._complete = function() {
  this._isComplete = true;
  if (null != this._exception) {
    var $$list = this._exceptionHandlers;
    for (var $$i = $$list.iterator(); $$i.hasNext(); ) {
      var handler = $$i.next();
      if ($eq$(handler.call$1(this._exception), true)) {
        this._exceptionHandled = true;
        break;
      }
    }
  }
  if (this.get$hasValue()) {
    var $$list = this._listeners;
    for (var $$i = $$list.iterator(); $$i.hasNext(); ) {
      var listener = $$i.next();
      listener.call$1(this.get$value());
    }
  }
  else {
    if (!this._exceptionHandled && this._listeners.get$length() > (0)) {
      $throw(this._exception);
    }
  }
}
FutureImpl.prototype._setValue = function(value) {
  if (this._isComplete) {
    $throw(new FutureAlreadyCompleteException());
  }
  this._value = value;
  this._complete();
}
FutureImpl.prototype._setException = function(exception) {
  if (null == exception) {
    $throw(new IllegalArgumentException(null));
  }
  if (this._isComplete) {
    $throw(new FutureAlreadyCompleteException());
  }
  this._exception = exception;
  this._complete();
}
function CompleterImpl() {}
CompleterImpl.prototype.get$future = function() {
  return this._futureImpl;
}
CompleterImpl.prototype.complete = function(value) {
  this._futureImpl._setValue(value);
}
CompleterImpl.prototype.completeException = function(exception) {
  this._futureImpl._setException(exception);
}
$inherits(CompleterImpl_ElementRect, CompleterImpl);
function CompleterImpl_ElementRect() {
  this._futureImpl = new FutureImpl();
}
function HashMapImplementation() {
  this._numberOfEntries = (0);
  this._numberOfDeleted = (0);
  this._loadLimit = HashMapImplementation._computeLoadLimit((8));
  this._keys = new Array((8));
  this._values = new Array((8));
}
HashMapImplementation.prototype.is$Map = function(){return true};
HashMapImplementation.prototype.is$Map_dart_core_String$Dynamic = function(){return true};
HashMapImplementation._computeLoadLimit = function(capacity) {
  return $truncdiv$((capacity * (3)), (4));
}
HashMapImplementation._firstProbe = function(hashCode, length) {
  return hashCode & (length - (1));
}
HashMapImplementation._nextProbe = function(currentProbe, numberOfProbes, length) {
  return (currentProbe + numberOfProbes) & (length - (1));
}
HashMapImplementation.prototype._probeForAdding = function(key) {
  var hash = HashMapImplementation._firstProbe(key.hashCode(), this._keys.get$length());
  var numberOfProbes = (1);
  var initialHash = hash;
  var insertionIndex = (-1);
  while (true) {
    var existingKey = this._keys.$index(hash);
    if (null == existingKey) {
      if (insertionIndex < (0)) return hash;
      return insertionIndex;
    }
    else if ($eq$(existingKey, key)) {
      return hash;
    }
    else if ((insertionIndex < (0)) && ((null == const$0000 ? null == (existingKey) : const$0000 === existingKey))) {
      insertionIndex = hash;
    }
    hash = HashMapImplementation._nextProbe(hash, numberOfProbes++, this._keys.get$length());
  }
}
HashMapImplementation.prototype._probeForLookup = function(key) {
  var hash = HashMapImplementation._firstProbe(key.hashCode(), this._keys.get$length());
  var numberOfProbes = (1);
  var initialHash = hash;
  while (true) {
    var existingKey = this._keys.$index(hash);
    if (null == existingKey) return (-1);
    if ($eq$(existingKey, key)) return hash;
    hash = HashMapImplementation._nextProbe(hash, numberOfProbes++, this._keys.get$length());
  }
}
HashMapImplementation.prototype._ensureCapacity = function() {
  var newNumberOfEntries = this._numberOfEntries + (1);
  if (newNumberOfEntries >= this._loadLimit) {
    this._grow(this._keys.get$length() * (2));
    return;
  }
  var capacity = this._keys.get$length();
  var numberOfFreeOrDeleted = capacity - newNumberOfEntries;
  var numberOfFree = numberOfFreeOrDeleted - this._numberOfDeleted;
  if (this._numberOfDeleted > numberOfFree) {
    this._grow(this._keys.get$length());
  }
}
HashMapImplementation._isPowerOfTwo = function(x) {
  return ((x & (x - (1))) == (0));
}
HashMapImplementation.prototype._grow = function(newCapacity) {
  var capacity = this._keys.get$length();
  this._loadLimit = HashMapImplementation._computeLoadLimit(newCapacity);
  var oldKeys = this._keys;
  var oldValues = this._values;
  this._keys = new Array(newCapacity);
  this._values = new Array(newCapacity);
  for (var i = (0);
   i < capacity; i++) {
    var key = oldKeys.$index(i);
    if (null == key || (null == key ? null == (const$0000) : key === const$0000)) {
      continue;
    }
    var value = oldValues.$index(i);
    var newIndex = this._probeForAdding(key);
    this._keys.$setindex(newIndex, key);
    this._values.$setindex(newIndex, value);
  }
  this._numberOfDeleted = (0);
}
HashMapImplementation.prototype.clear$_ = function() {
  this._numberOfEntries = (0);
  this._numberOfDeleted = (0);
  var length = this._keys.get$length();
  for (var i = (0);
   i < length; i++) {
    this._keys.$setindex(i);
    this._values.$setindex(i);
  }
}
HashMapImplementation.prototype.$setindex = function(key, value) {
  var $0;
  this._ensureCapacity();
  var index = this._probeForAdding(key);
  if ((null == this._keys.$index(index)) || ((($0 = this._keys.$index(index)) == null ? null == (const$0000) : $0 === const$0000))) {
    this._numberOfEntries++;
  }
  this._keys.$setindex(index, key);
  this._values.$setindex(index, value);
}
HashMapImplementation.prototype.$index = function(key) {
  var index = this._probeForLookup(key);
  if (index < (0)) return null;
  return this._values.$index(index);
}
HashMapImplementation.prototype.remove = function(key) {
  var index = this._probeForLookup(key);
  if (index >= (0)) {
    this._numberOfEntries--;
    var value = this._values.$index(index);
    this._values.$setindex(index);
    this._keys.$setindex(index, const$0000);
    this._numberOfDeleted++;
    return value;
  }
  return null;
}
HashMapImplementation.prototype.get$length = function() {
  return this._numberOfEntries;
}
HashMapImplementation.prototype.forEach = function(f) {
  var length = this._keys.get$length();
  for (var i = (0);
   i < length; i++) {
    var key = this._keys.$index(i);
    if ((null != key) && ((null == key ? null != (const$0000) : key !== const$0000))) {
      f(key, this._values.$index(i));
    }
  }
}
HashMapImplementation.prototype.getKeys = function() {
  var list = new Array(this.get$length());
  var i = (0);
  this.forEach(function _(key, value) {
    list.$setindex(i++, key);
  }
  );
  return list;
}
HashMapImplementation.prototype.containsKey = function(key) {
  return (this._probeForLookup(key) != (-1));
}
HashMapImplementation.prototype.toString = function() {
  return Maps.mapToString(this);
}
HashMapImplementation.prototype.clear$0 = HashMapImplementation.prototype.clear$_;
HashMapImplementation.prototype.forEach$1 = function($0) {
  return this.forEach(to$call$2($0));
};
HashMapImplementation.prototype.remove$1 = HashMapImplementation.prototype.remove;
$inherits(HashMapImplementation_Dynamic$DoubleLinkedQueueEntry_KeyValuePair, HashMapImplementation);
function HashMapImplementation_Dynamic$DoubleLinkedQueueEntry_KeyValuePair() {
  this._numberOfEntries = (0);
  this._numberOfDeleted = (0);
  this._loadLimit = HashMapImplementation._computeLoadLimit((8));
  this._keys = new Array((8));
  this._values = new Array((8));
}
HashMapImplementation_Dynamic$DoubleLinkedQueueEntry_KeyValuePair.prototype.clear$0 = HashMapImplementation_Dynamic$DoubleLinkedQueueEntry_KeyValuePair.prototype.clear$_;
HashMapImplementation_Dynamic$DoubleLinkedQueueEntry_KeyValuePair.prototype.forEach$1 = function($0) {
  return this.forEach(to$call$2($0));
};
HashMapImplementation_Dynamic$DoubleLinkedQueueEntry_KeyValuePair.prototype.remove$1 = HashMapImplementation_Dynamic$DoubleLinkedQueueEntry_KeyValuePair.prototype.remove;
$inherits(HashMapImplementation_dart_core_String$dart_core_String, HashMapImplementation);
function HashMapImplementation_dart_core_String$dart_core_String() {
  this._numberOfEntries = (0);
  this._numberOfDeleted = (0);
  this._loadLimit = HashMapImplementation._computeLoadLimit((8));
  this._keys = new Array((8));
  this._values = new Array((8));
}
HashMapImplementation_dart_core_String$dart_core_String.prototype.clear$0 = HashMapImplementation_dart_core_String$dart_core_String.prototype.clear$_;
HashMapImplementation_dart_core_String$dart_core_String.prototype.forEach$1 = function($0) {
  return this.forEach(to$call$2($0));
};
HashMapImplementation_dart_core_String$dart_core_String.prototype.remove$1 = HashMapImplementation_dart_core_String$dart_core_String.prototype.remove;
function HashSetImplementation() {
  this._backingMap = new HashMapImplementation();
}
HashSetImplementation.prototype.is$Collection = function(){return true};
HashSetImplementation.HashSetImplementation$from$factory = function(other) {
  var set = new HashSetImplementation();
  for (var $$i = other.iterator(); $$i.hasNext(); ) {
    var e = $$i.next();
    set.add(e);
  }
  return set;
}
HashSetImplementation.prototype.clear$_ = function() {
  this._backingMap.clear$_();
}
HashSetImplementation.prototype.add = function(value) {
  this._backingMap.$setindex(value, value);
}
HashSetImplementation.prototype.contains = function(value) {
  return this._backingMap.containsKey(value);
}
HashSetImplementation.prototype.remove = function(value) {
  if (!this._backingMap.containsKey(value)) return false;
  this._backingMap.remove(value);
  return true;
}
HashSetImplementation.prototype.addAll = function(collection) {
  var $this = this;
  collection.forEach$1(function _(value) {
    $this.add(value);
  }
  );
}
HashSetImplementation.prototype.forEach = function(f) {
  this._backingMap.forEach(function _(key, value) {
    f(key);
  }
  );
}
HashSetImplementation.prototype.filter = function(f) {
  var result = new HashSetImplementation();
  this._backingMap.forEach(function _(key, value) {
    if (f(key)) result.add(key);
  }
  );
  return result;
}
HashSetImplementation.prototype.some = function(f) {
  var keys = this._backingMap.getKeys();
  return keys.some$1(f);
}
HashSetImplementation.prototype.get$length = function() {
  return this._backingMap.get$length();
}
HashSetImplementation.prototype.iterator = function() {
  return new HashSetIterator(this);
}
HashSetImplementation.prototype.toString = function() {
  return Collections.collectionToString(this);
}
HashSetImplementation.prototype.add$1 = HashSetImplementation.prototype.add;
HashSetImplementation.prototype.clear$0 = HashSetImplementation.prototype.clear$_;
HashSetImplementation.prototype.contains$1 = HashSetImplementation.prototype.contains;
HashSetImplementation.prototype.filter$1 = function($0) {
  return this.filter(to$call$1($0));
};
HashSetImplementation.prototype.forEach$1 = function($0) {
  return this.forEach(to$call$1($0));
};
HashSetImplementation.prototype.remove$1 = HashSetImplementation.prototype.remove;
HashSetImplementation.prototype.some$1 = function($0) {
  return this.some(to$call$1($0));
};
$inherits(HashSetImplementation_dart_core_String, HashSetImplementation);
function HashSetImplementation_dart_core_String() {
  this._backingMap = new HashMapImplementation_dart_core_String$dart_core_String();
}
HashSetImplementation_dart_core_String.prototype.add$1 = HashSetImplementation_dart_core_String.prototype.add;
HashSetImplementation_dart_core_String.prototype.contains$1 = HashSetImplementation_dart_core_String.prototype.contains;
HashSetImplementation_dart_core_String.prototype.remove$1 = HashSetImplementation_dart_core_String.prototype.remove;
HashSetImplementation_dart_core_String.prototype.some$1 = function($0) {
  return this.some(to$call$1($0));
};
function HashSetIterator(set_) {
  this._nextValidIndex = (-1);
  this._entries = set_._backingMap._keys;
  this._advance();
}
HashSetIterator.prototype.hasNext = function() {
  var $0;
  if (this._nextValidIndex >= this._entries.get$length()) return false;
  if ((($0 = this._entries.$index(this._nextValidIndex)) == null ? null == (const$0000) : $0 === const$0000)) {
    this._advance();
  }
  return this._nextValidIndex < this._entries.get$length();
}
HashSetIterator.prototype.next = function() {
  if (!this.hasNext()) {
    $throw(const$0001);
  }
  var res = this._entries.$index(this._nextValidIndex);
  this._advance();
  return res;
}
HashSetIterator.prototype._advance = function() {
  var length = this._entries.get$length();
  var entry;
  var deletedKey = const$0000;
  do {
    if (++this._nextValidIndex >= length) break;
    entry = this._entries.$index(this._nextValidIndex);
  }
  while ((null == entry) || ((null == entry ? null == (deletedKey) : entry === deletedKey)))
}
function _DeletedKeySentinel() {

}
function KeyValuePair(key, value) {
  this.key$_ = key;
  this.value = value;
}
KeyValuePair.prototype.get$value = function() { return this.value; };
KeyValuePair.prototype.set$value = function(value) { return this.value = value; };
function LinkedHashMapImplementation() {
  this._map = new HashMapImplementation_Dynamic$DoubleLinkedQueueEntry_KeyValuePair();
  this._list = new DoubleLinkedQueue_KeyValuePair();
}
LinkedHashMapImplementation.prototype.is$Map = function(){return true};
LinkedHashMapImplementation.prototype.is$Map_dart_core_String$Dynamic = function(){return true};
LinkedHashMapImplementation.prototype.$setindex = function(key, value) {
  if (this._map.containsKey(key)) {
    this._map.$index(key).get$element().set$value(value);
  }
  else {
    this._list.addLast(new KeyValuePair(key, value));
    this._map.$setindex(key, this._list.lastEntry());
  }
}
LinkedHashMapImplementation.prototype.$index = function(key) {
  var entry = this._map.$index(key);
  if (null == entry) return null;
  return entry.get$element().get$value();
}
LinkedHashMapImplementation.prototype.remove = function(key) {
  var entry = this._map.remove(key);
  if (null == entry) return null;
  entry.remove();
  return entry.get$element().get$value();
}
LinkedHashMapImplementation.prototype.getKeys = function() {
  var list = new Array(this.get$length());
  var index = (0);
  this._list.forEach(function _(entry) {
    list.$setindex(index++, entry.key$_);
  }
  );
  return list;
}
LinkedHashMapImplementation.prototype.forEach = function(f) {
  this._list.forEach(function _(entry) {
    f(entry.key$_, entry.value);
  }
  );
}
LinkedHashMapImplementation.prototype.containsKey = function(key) {
  return this._map.containsKey(key);
}
LinkedHashMapImplementation.prototype.get$length = function() {
  return this._map.get$length();
}
LinkedHashMapImplementation.prototype.clear$_ = function() {
  this._map.clear$_();
  this._list.clear$_();
}
LinkedHashMapImplementation.prototype.toString = function() {
  return Maps.mapToString(this);
}
LinkedHashMapImplementation.prototype.clear$0 = LinkedHashMapImplementation.prototype.clear$_;
LinkedHashMapImplementation.prototype.forEach$1 = function($0) {
  return this.forEach(to$call$2($0));
};
LinkedHashMapImplementation.prototype.remove$1 = LinkedHashMapImplementation.prototype.remove;
function Maps() {}
Maps.mapToString = function(m) {
  var result = new StringBufferImpl("");
  Maps._emitMap(m, result, new Array());
  return result.toString();
}
Maps._emitMap = function(m, result, visiting) {
  visiting.add(m);
  result.add("{");
  var first = true;
  m.forEach$1((function (k, v) {
    if (!first) {
      result.add(", ");
    }
    first = false;
    Collections._emitObject(k, result, visiting);
    result.add(": ");
    Collections._emitObject(v, result, visiting);
  })
  );
  result.add("}");
  visiting.removeLast();
}
function DoubleLinkedQueueEntry(e) {
  this._element = e;
}
DoubleLinkedQueueEntry.prototype._link = function(p, n) {
  this._next = n;
  this._previous = p;
  p._next = this;
  n._previous = this;
}
DoubleLinkedQueueEntry.prototype.prepend = function(e) {
  new DoubleLinkedQueueEntry(e)._link(this._previous, this);
}
DoubleLinkedQueueEntry.prototype.remove = function() {
  this._previous._next = this._next;
  this._next._previous = this._previous;
  this._next = null;
  this._previous = null;
  return this._element;
}
DoubleLinkedQueueEntry.prototype._asNonSentinelEntry = function() {
  return this;
}
DoubleLinkedQueueEntry.prototype.previousEntry = function() {
  return this._previous._asNonSentinelEntry();
}
DoubleLinkedQueueEntry.prototype.get$element = function() {
  return this._element;
}
DoubleLinkedQueueEntry.prototype.remove$0 = DoubleLinkedQueueEntry.prototype.remove;
$inherits(DoubleLinkedQueueEntry_KeyValuePair, DoubleLinkedQueueEntry);
function DoubleLinkedQueueEntry_KeyValuePair(e) {
  this._element = e;
}
DoubleLinkedQueueEntry_KeyValuePair.prototype.remove$0 = DoubleLinkedQueueEntry_KeyValuePair.prototype.remove;
$inherits(_DoubleLinkedQueueEntrySentinel, DoubleLinkedQueueEntry);
function _DoubleLinkedQueueEntrySentinel() {
  DoubleLinkedQueueEntry.call(this, null);
  this._link(this, this);
}
_DoubleLinkedQueueEntrySentinel.prototype.remove = function() {
  $throw(const$0002);
}
_DoubleLinkedQueueEntrySentinel.prototype._asNonSentinelEntry = function() {
  return null;
}
_DoubleLinkedQueueEntrySentinel.prototype.get$element = function() {
  $throw(const$0002);
}
_DoubleLinkedQueueEntrySentinel.prototype.remove$0 = _DoubleLinkedQueueEntrySentinel.prototype.remove;
$inherits(_DoubleLinkedQueueEntrySentinel_KeyValuePair, _DoubleLinkedQueueEntrySentinel);
function _DoubleLinkedQueueEntrySentinel_KeyValuePair() {
  DoubleLinkedQueueEntry_KeyValuePair.call(this, null);
  this._link(this, this);
}
function DoubleLinkedQueue() {
  this._sentinel = new _DoubleLinkedQueueEntrySentinel();
}
DoubleLinkedQueue.prototype.is$Collection = function(){return true};
DoubleLinkedQueue.prototype.addLast = function(value) {
  this._sentinel.prepend(value);
}
DoubleLinkedQueue.prototype.add = function(value) {
  this.addLast(value);
}
DoubleLinkedQueue.prototype.addAll = function(collection) {
  for (var $$i = collection.iterator(); $$i.hasNext(); ) {
    var e = $$i.next();
    this.add(e);
  }
}
DoubleLinkedQueue.prototype.last = function() {
  return this._sentinel._previous.get$element();
}
DoubleLinkedQueue.prototype.lastEntry = function() {
  return this._sentinel.previousEntry();
}
DoubleLinkedQueue.prototype.get$length = function() {
  var counter = (0);
  this.forEach(function _(element) {
    counter++;
  }
  );
  return counter;
}
DoubleLinkedQueue.prototype.clear$_ = function() {
  this._sentinel._next = this._sentinel;
  this._sentinel._previous = this._sentinel;
}
DoubleLinkedQueue.prototype.forEach = function(f) {
  var entry = this._sentinel._next;
  while ((null == entry ? null != (this._sentinel) : entry !== this._sentinel)) {
    var nextEntry = entry._next;
    f(entry._element);
    entry = nextEntry;
  }
}
DoubleLinkedQueue.prototype.some = function(f) {
  var entry = this._sentinel._next;
  while ((null == entry ? null != (this._sentinel) : entry !== this._sentinel)) {
    var nextEntry = entry._next;
    if (f(entry._element)) return true;
    entry = nextEntry;
  }
  return false;
}
DoubleLinkedQueue.prototype.filter = function(f) {
  var other = new DoubleLinkedQueue();
  var entry = this._sentinel._next;
  while ((null == entry ? null != (this._sentinel) : entry !== this._sentinel)) {
    var nextEntry = entry._next;
    if (f(entry._element)) other.addLast(entry._element);
    entry = nextEntry;
  }
  return other;
}
DoubleLinkedQueue.prototype.iterator = function() {
  return new _DoubleLinkedQueueIterator(this._sentinel);
}
DoubleLinkedQueue.prototype.toString = function() {
  return Collections.collectionToString(this);
}
DoubleLinkedQueue.prototype.add$1 = DoubleLinkedQueue.prototype.add;
DoubleLinkedQueue.prototype.clear$0 = DoubleLinkedQueue.prototype.clear$_;
DoubleLinkedQueue.prototype.filter$1 = function($0) {
  return this.filter(to$call$1($0));
};
DoubleLinkedQueue.prototype.forEach$1 = function($0) {
  return this.forEach(to$call$1($0));
};
DoubleLinkedQueue.prototype.some$1 = function($0) {
  return this.some(to$call$1($0));
};
$inherits(DoubleLinkedQueue_KeyValuePair, DoubleLinkedQueue);
function DoubleLinkedQueue_KeyValuePair() {
  this._sentinel = new _DoubleLinkedQueueEntrySentinel_KeyValuePair();
}
DoubleLinkedQueue_KeyValuePair.prototype.clear$0 = DoubleLinkedQueue_KeyValuePair.prototype.clear$_;
DoubleLinkedQueue_KeyValuePair.prototype.some$1 = function($0) {
  return this.some(to$call$1($0));
};
function _DoubleLinkedQueueIterator(_sentinel) {
  this._sentinel = _sentinel;
  this._currentEntry = this._sentinel;
}
_DoubleLinkedQueueIterator.prototype.hasNext = function() {
  var $0;
  return (($0 = this._currentEntry._next) == null ? null != (this._sentinel) : $0 !== this._sentinel);
}
_DoubleLinkedQueueIterator.prototype.next = function() {
  if (!this.hasNext()) {
    $throw(const$0001);
  }
  this._currentEntry = this._currentEntry._next;
  return this._currentEntry.get$element();
}
function StringBufferImpl(content) {
  this.clear$_();
  this.add(content);
}
StringBufferImpl.prototype.get$length = function() {
  return this._length;
}
StringBufferImpl.prototype.isEmpty = function() {
  return this._length == (0);
}
StringBufferImpl.prototype.add = function(obj) {
  var str = obj.toString();
  if (null == str || str.isEmpty()) return this;
  this._buffer.add(str);
  this._length = this._length + str.length;
  return this;
}
StringBufferImpl.prototype.addAll = function(objects) {
  for (var $$i = objects.iterator(); $$i.hasNext(); ) {
    var obj = $$i.next();
    this.add(obj);
  }
  return this;
}
StringBufferImpl.prototype.clear$_ = function() {
  this._buffer = new Array();
  this._length = (0);
  return this;
}
StringBufferImpl.prototype.toString = function() {
  if (this._buffer.get$length() == (0)) return "";
  if (this._buffer.get$length() == (1)) return this._buffer.$index((0));
  var result = StringBase.concatAll(this._buffer);
  this._buffer.clear$_();
  this._buffer.add(result);
  return result;
}
StringBufferImpl.prototype.add$1 = StringBufferImpl.prototype.add;
StringBufferImpl.prototype.clear$0 = StringBufferImpl.prototype.clear$_;
function StringBase() {}
StringBase.join = function(strings, separator) {
  if (strings.get$length() == (0)) return "";
  var s = strings.$index((0));
  for (var i = (1);
   i < strings.get$length(); i++) {
    s = $add$($add$(s, separator), strings.$index(i));
  }
  return s;
}
StringBase.concatAll = function(strings) {
  return StringBase.join(strings, "");
}
var StringImplementation = String;
StringImplementation.prototype.get$length = function() { return this.length; };
StringImplementation.prototype.endsWith = function(other) {
    'use strict';
    if (other.length > this.length) return false;
    return other == this.substring(this.length - other.length);
}
StringImplementation.prototype.startsWith = function(other) {
    'use strict';
    if (other.length > this.length) return false;
    return other == this.substring(0, other.length);
}
StringImplementation.prototype.isEmpty = function() {
  return this.length == (0);
}
StringImplementation.prototype.contains = function(pattern, startIndex) {
  'use strict'; return this.indexOf(pattern, startIndex) >= 0;
}
StringImplementation.prototype._replaceRegExp = function(from, to) {
  'use strict';return this.replace(from.re, to);
}
StringImplementation.prototype._replaceAll = function(from, to) {
  'use strict';
  from = new RegExp(from.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"), 'g');
  to = to.replace(/\$/g, '$$$$'); // Escape sequences are fun!
  return this.replace(from, to);
}
StringImplementation.prototype.replaceAll = function(from, to) {
  if ((typeof(from) == 'string')) return this._replaceAll(from, to);
  if (!!(from && from.is$RegExp())) return this._replaceRegExp(from.get$dynamic().get$_global(), to);
  var buffer = new StringBufferImpl("");
  var lastMatchEnd = (0);
  var $$list = from.allMatches(this);
  for (var $$i = $$list.iterator(); $$i.hasNext(); ) {
    var match = $$i.next();
    buffer.add$1(this.substring(lastMatchEnd, match.start$0()));
    buffer.add$1(to);
    lastMatchEnd = match.end$0();
  }
  buffer.add$1(this.substring(lastMatchEnd));
}
StringImplementation.prototype.split$_ = function(pattern) {
  if ((typeof(pattern) == 'string')) return this._split(pattern);
  if (!!(pattern && pattern.is$RegExp())) return this._splitRegExp(pattern);
  $throw("String.split(Pattern) unimplemented.");
}
StringImplementation.prototype._split = function(pattern) {
  'use strict'; return this.split(pattern);
}
StringImplementation.prototype._splitRegExp = function(pattern) {
  'use strict'; return this.split(pattern.re);
}
StringImplementation.prototype.allMatches = function(str) {
  $throw("String.allMatches(String str) unimplemented.");
}
StringImplementation.prototype.hashCode = function() {
      'use strict';
      var hash = 0;
      for (var i = 0; i < this.length; i++) {
        hash = 0x1fffffff & (hash + this.charCodeAt(i));
        hash = 0x1fffffff & (hash + ((0x0007ffff & hash) << 10));
        hash ^= hash >> 6;
      }

      hash = 0x1fffffff & (hash + ((0x03ffffff & hash) << 3));
      hash ^= hash >> 11;
      return 0x1fffffff & (hash + ((0x00003fff & hash) << 15));
}
StringImplementation.prototype.compareTo = function(other) {
  'use strict'; return this == other ? 0 : this < other ? -1 : 1;
}
StringImplementation.prototype.contains$1 = StringImplementation.prototype.contains;
StringImplementation.prototype.indexOf$1 = StringImplementation.prototype.indexOf;
$inherits(_ArgumentMismatchException, ClosureArgumentMismatchException);
function _ArgumentMismatchException(_message) {
  this._dart_coreimpl_message = _message;
  ClosureArgumentMismatchException.call(this);
}
_ArgumentMismatchException.prototype.toString = function() {
  return ("Closure argument mismatch: " + this._dart_coreimpl_message);
}
var _FunctionImplementation = Function;
_FunctionImplementation.prototype._genStub = function(argsLength, names) {
      // Fast path #1: if no named arguments and arg count matches.
      var thisLength = this.$length || this.length;
      if (thisLength == argsLength && !names) {
        return this;
      }

      var paramsNamed = this.$optional ? (this.$optional.length / 2) : 0;
      var paramsBare = thisLength - paramsNamed;
      var argsNamed = names ? names.length : 0;
      var argsBare = argsLength - argsNamed;

      // Check we got the right number of arguments
      if (argsBare < paramsBare || argsLength > thisLength ||
          argsNamed > paramsNamed) {
        return function() {
          $throw(new _ArgumentMismatchException(
            'Wrong number of arguments to function. Expected ' + paramsBare +
            ' positional arguments and at most ' + paramsNamed +
            ' named arguments, but got ' + argsBare +
            ' positional arguments and ' + argsNamed + ' named arguments.'));
        };
      }

      // First, fill in all of the default values
      var p = new Array(paramsBare);
      if (paramsNamed) {
        p = p.concat(this.$optional.slice(paramsNamed));
      }
      // Fill in positional args
      var a = new Array(argsLength);
      for (var i = 0; i < argsBare; i++) {
        p[i] = a[i] = '$' + i;
      }
      // Then overwrite with supplied values for optional args
      var lastParameterIndex;
      var namesInOrder = true;
      for (var i = 0; i < argsNamed; i++) {
        var name = names[i];
        a[i + argsBare] = name;
        var j = this.$optional.indexOf(name);
        if (j < 0 || j >= paramsNamed) {
          return function() {
            $throw(new _ArgumentMismatchException(
              'Named argument "' + name + '" was not expected by function.' +
              ' Did you forget to mark the function parameter [optional]?'));
          };
        } else if (lastParameterIndex && lastParameterIndex > j) {
          namesInOrder = false;
        }
        p[j + paramsBare] = name;
        lastParameterIndex = j;
      }

      if (thisLength == argsLength && namesInOrder) {
        // Fast path #2: named arguments, but they're in order and all supplied.
        return this;
      }

      // Note: using Function instead of 'eval' to get a clean scope.
      // TODO(jmesserly): evaluate the performance of these stubs.
      var f = 'function(' + a.join(',') + '){return $f(' + p.join(',') + ');}';
      return new Function('$f', 'return ' + f + '').call(null, this);
    
}
function _constList(other) {
  
    other.__proto__ = ImmutableList.prototype;
    return other;
}
function _map(itemsAndKeys) {
  var ret = new LinkedHashMapImplementation();
  for (var i = (0);
   i < itemsAndKeys.get$length(); ) {
    ret.$setindex(itemsAndKeys.$index(i++), itemsAndKeys.$index(i++));
  }
  return ret;
}
function _constMap(itemsAndKeys) {
  return new ImmutableMap(itemsAndKeys);
}
$dynamic("get$on").EventTarget = function() {
  return new _EventsImpl(this);
}
$dynamic("$dom_addEventListener$3").EventTarget = function($0, $1, $2) {
  if (Object.getPrototypeOf(this).hasOwnProperty("$dom_addEventListener$3")) {
    return this.addEventListener($0, $wrap_call$1(to$call$1($1)), $2);
  }
  return Object.prototype.$dom_addEventListener$3.call(this, $0, $1, $2);
};
$dynamic("$dom_removeEventListener$3").EventTarget = function($0, $1, $2) {
  if (Object.getPrototypeOf(this).hasOwnProperty("$dom_removeEventListener$3")) {
    return this.removeEventListener($0, $wrap_call$1(to$call$1($1)), $2);
  }
  return Object.prototype.$dom_removeEventListener$3.call(this, $0, $1, $2);
};
$dynamic("get$nodes").Node = function() {
  return new _ChildNodeListLazy(this);
}
$dynamic("remove").Node = function() {
  if ($ne$(this.get$parent())) {
    var parent = this.get$parent();
    parent.removeChild(this);
  }
  return this;
}
$dynamic("replaceWith").Node = function(otherNode) {
  try {
    var parent = this.get$parent();
    parent.replaceChild(otherNode, this);
  } catch (e) {
    e = _toDartException(e);
  }
  ;
  return this;
}
$dynamic("get$$$dom_attributes").Node = function() {
  return this.attributes;
}
$dynamic("get$$$dom_childNodes").Node = function() {
  return this.childNodes;
}
$dynamic("get$parent").Node = function() {
  return this.parentNode;
}
$dynamic("get$text").Node = function() {
  return this.textContent;
}
$dynamic("set$text").Node = function(value) {
  this.textContent = value;
}
$dynamic("contains$1").Node = function($0) {
  return this.contains($0);
};
$dynamic("remove$0").Node = function() {
  return this.remove();
};
$dynamic("is$html_Element").Element = function(){return true};
$dynamic("get$attributes").Element = function() {
  return new _ElementAttributeMap(this);
}
$dynamic("get$elements").Element = function() {
  return new _ChildrenElementList._wrap$ctor(this);
}
$dynamic("queryAll").Element = function(selectors) {
  return new _FrozenElementList._wrap$ctor(this.querySelectorAll(selectors));
}
$dynamic("get$classes").Element = function() {
  return new _CssClassSet(this);
}
$dynamic("get$rect").Element = function() {
  var $this = this;
  return _createMeasurementFuture((function () {
    return new _ElementRectImpl($this);
  })
  , new CompleterImpl_ElementRect());
}
$dynamic("get$on").Element = function() {
  return new _ElementEventsImpl(this);
}
$dynamic("get$$$dom_children").Element = function() {
  return this.children;
}
$dynamic("get$$$dom_className").Element = function() {
  return this.className;
}
$dynamic("set$$$dom_className").Element = function(value) {
  this.className = value;
}
$dynamic("get$$$dom_clientHeight").Element = function() {
  return this.clientHeight;
}
$dynamic("get$$$dom_clientLeft").Element = function() {
  return this.clientLeft;
}
$dynamic("get$$$dom_clientTop").Element = function() {
  return this.clientTop;
}
$dynamic("get$$$dom_clientWidth").Element = function() {
  return this.clientWidth;
}
$dynamic("get$$$dom_firstElementChild").Element = function() {
  return this.firstElementChild;
}
$dynamic("set$innerHTML").Element = function(value) { return this.innerHTML = value; };
$dynamic("get$$$dom_lastElementChild").Element = function() {
  return this.lastElementChild;
}
$dynamic("get$nextElementSibling").Element = function() { return this.nextElementSibling; };
$dynamic("get$$$dom_offsetHeight").Element = function() {
  return this.offsetHeight;
}
$dynamic("get$$$dom_offsetLeft").Element = function() {
  return this.offsetLeft;
}
$dynamic("get$$$dom_offsetTop").Element = function() {
  return this.offsetTop;
}
$dynamic("get$$$dom_offsetWidth").Element = function() {
  return this.offsetWidth;
}
$dynamic("get$previousElementSibling").Element = function() { return this.previousElementSibling; };
$dynamic("get$$$dom_scrollHeight").Element = function() {
  return this.scrollHeight;
}
$dynamic("get$$$dom_scrollLeft").Element = function() {
  return this.scrollLeft;
}
$dynamic("get$$$dom_scrollTop").Element = function() {
  return this.scrollTop;
}
$dynamic("set$$$dom_scrollTop").Element = function(value) {
  this.scrollTop = value;
}
$dynamic("get$$$dom_scrollWidth").Element = function() {
  return this.scrollWidth;
}
$dynamic("get$title").Element = function() { return this.title; };
$dynamic("get$click").Element = function() {
  return this.click.bind(this);
}
$dynamic("query$1").Element = function($0) {
  return this.querySelector($0);
};
$dynamic("get$on").AbstractWorker = function() {
  return new _AbstractWorkerEventsImpl(this);
}
$dynamic("$dom_addEventListener$3").AbstractWorker = function($0, $1, $2) {
  return this.addEventListener($0, $wrap_call$1(to$call$1($1)), $2);
};
$dynamic("$dom_removeEventListener$3").AbstractWorker = function($0, $1, $2) {
  return this.removeEventListener($0, $wrap_call$1(to$call$1($1)), $2);
};
function _EventsImpl(_ptr) {
  this._ptr = _ptr;
}
_EventsImpl.prototype.get$_ptr = function() { return this._ptr; };
_EventsImpl.prototype.$index = function(type) {
  return this._get(type.toLowerCase());
}
_EventsImpl.prototype._get = function(type) {
  return new _EventListenerListImpl(this._ptr, type);
}
$inherits(_AbstractWorkerEventsImpl, _EventsImpl);
function _AbstractWorkerEventsImpl(_ptr) {
  _EventsImpl.call(this, _ptr);
}
$dynamic("get$name").HTMLAnchorElement = function() { return this.name; };
$dynamic("get$name").WebKitAnimation = function() { return this.name; };
$dynamic("get$length").WebKitAnimationList = function() { return this.length; };
$dynamic("get$name").HTMLAppletElement = function() { return this.name; };
$dynamic("get$name").Attr = function() { return this.name; };
$dynamic("get$value").Attr = function() { return this.value; };
$dynamic("set$value").Attr = function(value) { return this.value = value; };
$dynamic("get$length").AudioBuffer = function() { return this.length; };
$dynamic("get$on").AudioContext = function() {
  return new _AudioContextEventsImpl(this);
}
$inherits(_AudioContextEventsImpl, _EventsImpl);
function _AudioContextEventsImpl(_ptr) {
  _EventsImpl.call(this, _ptr);
}
$dynamic("get$on").HTMLMediaElement = function() {
  return new _MediaElementEventsImpl(this);
}
$dynamic("get$name").AudioParam = function() { return this.name; };
$dynamic("get$value").AudioParam = function() { return this.value; };
$dynamic("set$value").AudioParam = function(value) { return this.value = value; };
$dynamic("get$on").BatteryManager = function() {
  return new _BatteryManagerEventsImpl(this);
}
$dynamic("$dom_addEventListener$3").BatteryManager = function($0, $1, $2) {
  return this.addEventListener($0, $wrap_call$1(to$call$1($1)), $2);
};
$dynamic("$dom_removeEventListener$3").BatteryManager = function($0, $1, $2) {
  return this.removeEventListener($0, $wrap_call$1(to$call$1($1)), $2);
};
$inherits(_BatteryManagerEventsImpl, _EventsImpl);
function _BatteryManagerEventsImpl(_ptr) {
  _EventsImpl.call(this, _ptr);
}
$dynamic("get$url").BeforeLoadEvent = function() { return this.url; };
$dynamic("get$on").HTMLBodyElement = function() {
  return new _BodyElementEventsImpl(this);
}
$inherits(_ElementEventsImpl, _EventsImpl);
function _ElementEventsImpl(_ptr) {
  _EventsImpl.call(this, _ptr);
}
_ElementEventsImpl.prototype.get$change = function() {
  return this._get("change");
}
_ElementEventsImpl.prototype.get$click = function() {
  return this._get("click");
}
_ElementEventsImpl.prototype.get$keyUp = function() {
  return this._get("keyup");
}
$inherits(_BodyElementEventsImpl, _ElementEventsImpl);
function _BodyElementEventsImpl(_ptr) {
  _ElementEventsImpl.call(this, _ptr);
}
$dynamic("get$name").HTMLButtonElement = function() { return this.name; };
$dynamic("get$value").HTMLButtonElement = function() { return this.value; };
$dynamic("set$value").HTMLButtonElement = function(value) { return this.value = value; };
$dynamic("get$length").CharacterData = function() { return this.length; };
$dynamic("get$name").WebKitCSSKeyframesRule = function() { return this.name; };
$dynamic("get$length").CSSRuleList = function() { return this.length; };
$dynamic("get$length").CSSStyleDeclaration = function() { return this.length; };
$dynamic("set$transform").CSSStyleDeclaration = function(value) {
  this.setProperty(("" + get$$_browserPrefix() + "transform"), value, "");
}
$dynamic("get$title").StyleSheet = function() { return this.title; };
$dynamic("get$length").CSSValueList = function() { return this.length; };
$dynamic("get$length").ClientRectList = function() { return this.length; };
var _ConsoleImpl = (typeof console == 'undefined' ? {} : console);
$dynamic("get$on").DOMApplicationCache = function() {
  return new _DOMApplicationCacheEventsImpl(this);
}
$dynamic("$dom_addEventListener$3").DOMApplicationCache = function($0, $1, $2) {
  return this.addEventListener($0, $wrap_call$1(to$call$1($1)), $2);
};
$dynamic("$dom_removeEventListener$3").DOMApplicationCache = function($0, $1, $2) {
  return this.removeEventListener($0, $wrap_call$1(to$call$1($1)), $2);
};
$inherits(_DOMApplicationCacheEventsImpl, _EventsImpl);
function _DOMApplicationCacheEventsImpl(_ptr) {
  _EventsImpl.call(this, _ptr);
}
$dynamic("get$name").DOMException = function() { return this.name; };
$dynamic("get$name").DOMFileSystem = function() { return this.name; };
$dynamic("get$name").DOMFileSystemSync = function() { return this.name; };
$dynamic("get$length").DOMMimeTypeArray = function() { return this.length; };
$dynamic("get$length").DOMPlugin = function() { return this.length; };
$dynamic("get$name").DOMPlugin = function() { return this.name; };
$dynamic("get$length").DOMPluginArray = function() { return this.length; };
$dynamic("get$length").DOMTokenList = function() { return this.length; };
$dynamic("add$1").DOMTokenList = function($0) {
  return this.add($0);
};
$dynamic("contains$1").DOMTokenList = function($0) {
  return this.contains($0);
};
$dynamic("remove$1").DOMTokenList = function($0) {
  return this.remove($0);
};
$dynamic("get$value").DOMSettableTokenList = function() { return this.value; };
$dynamic("set$value").DOMSettableTokenList = function(value) { return this.value = value; };
$dynamic("is$List").DOMStringList = function(){return true};
$dynamic("is$Collection").DOMStringList = function(){return true};
$dynamic("get$length").DOMStringList = function() { return this.length; };
$dynamic("$index").DOMStringList = function(index) {
  return this[index];
}
$dynamic("$setindex").DOMStringList = function(index, value) {
  $throw(new UnsupportedOperationException("Cannot assign element of immutable List."));
}
$dynamic("iterator").DOMStringList = function() {
  return new _FixedSizeListIterator_dart_core_String(this);
}
$dynamic("add").DOMStringList = function(value) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("addAll").DOMStringList = function(collection) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("forEach").DOMStringList = function(f) {
  return _Collections.forEach(this, f);
}
$dynamic("filter").DOMStringList = function(f) {
  return _Collections.filter(this, [], f);
}
$dynamic("some").DOMStringList = function(f) {
  return _Collections.some(this, f);
}
$dynamic("sort").DOMStringList = function(compare) {
  $throw(new UnsupportedOperationException("Cannot sort immutable List."));
}
$dynamic("indexOf").DOMStringList = function(element, start) {
  return _Lists.indexOf(this, element, start, this.length);
}
$dynamic("last").DOMStringList = function() {
  return this.$index(this.length - (1));
}
$dynamic("removeLast").DOMStringList = function() {
  $throw(new UnsupportedOperationException("Cannot removeLast on immutable List."));
}
$dynamic("removeRange").DOMStringList = function(start, rangeLength) {
  $throw(new UnsupportedOperationException("Cannot removeRange on immutable List."));
}
$dynamic("getRange").DOMStringList = function(start, rangeLength) {
  return _Lists.getRange(this, start, rangeLength, []);
}
$dynamic("add$1").DOMStringList = function($0) {
  return this.add($0);
};
$dynamic("contains$1").DOMStringList = function($0) {
  return this.contains($0);
};
$dynamic("filter$1").DOMStringList = function($0) {
  return this.filter($wrap_call$1(to$call$1($0)));
};
$dynamic("forEach$1").DOMStringList = function($0) {
  return this.forEach($wrap_call$1(to$call$1($0)));
};
$dynamic("indexOf$1").DOMStringList = function($0) {
  return this.indexOf($0, (0));
};
$dynamic("some$1").DOMStringList = function($0) {
  return this.some($wrap_call$1(to$call$1($0)));
};
$dynamic("sort$1").DOMStringList = function($0) {
  return this.sort($wrap_call$2(to$call$2($0)));
};
$dynamic("get$length").DataTransferItemList = function() { return this.length; };
$dynamic("add$1").DataTransferItemList = function($0) {
  return this.add($0);
};
$dynamic("clear$0").DataTransferItemList = function() {
  return this.clear();
};
$dynamic("get$on").WorkerContext = function() {
  return new _WorkerContextEventsImpl(this);
}
$dynamic("$dom_addEventListener$3").WorkerContext = function($0, $1, $2) {
  return this.addEventListener($0, $wrap_call$1(to$call$1($1)), $2);
};
$dynamic("$dom_removeEventListener$3").WorkerContext = function($0, $1, $2) {
  return this.removeEventListener($0, $wrap_call$1(to$call$1($1)), $2);
};
$dynamic("get$on").DedicatedWorkerContext = function() {
  return new _DedicatedWorkerContextEventsImpl(this);
}
$inherits(_WorkerContextEventsImpl, _EventsImpl);
function _WorkerContextEventsImpl(_ptr) {
  _EventsImpl.call(this, _ptr);
}
$inherits(_DedicatedWorkerContextEventsImpl, _WorkerContextEventsImpl);
function _DedicatedWorkerContextEventsImpl(_ptr) {
  _WorkerContextEventsImpl.call(this, _ptr);
}
$dynamic("get$on").DeprecatedPeerConnection = function() {
  return new _DeprecatedPeerConnectionEventsImpl(this);
}
$dynamic("$dom_addEventListener$3").DeprecatedPeerConnection = function($0, $1, $2) {
  return this.addEventListener($0, $wrap_call$1(to$call$1($1)), $2);
};
$dynamic("$dom_removeEventListener$3").DeprecatedPeerConnection = function($0, $1, $2) {
  return this.removeEventListener($0, $wrap_call$1(to$call$1($1)), $2);
};
$inherits(_DeprecatedPeerConnectionEventsImpl, _EventsImpl);
function _DeprecatedPeerConnectionEventsImpl(_ptr) {
  _EventsImpl.call(this, _ptr);
}
$dynamic("get$name").Entry = function() { return this.name; };
$dynamic("remove$1").Entry = function($0) {
  return this.remove($wrap_call$0(to$call$0($0)), $wrap_call$1(to$call$1(null)));
};
$dynamic("get$name").EntrySync = function() { return this.name; };
$dynamic("remove$0").EntrySync = function() {
  return this.remove();
};
$dynamic("is$html_Element").HTMLDocument = function(){return true};
$dynamic("get$on").HTMLDocument = function() {
  return new _DocumentEventsImpl(this);
}
$dynamic("get$window").HTMLDocument = function() {
  return this.defaultView;
}
$dynamic("get$title").HTMLDocument = function() { return this.title; };
$dynamic("query").HTMLDocument = function(selectors) {
  if (const$0004.hasMatch(selectors)) {
    return this.getElementById(selectors.substring((1)));
  }
  return this.$dom_querySelector(selectors);
}
$dynamic("$dom_querySelector").HTMLDocument = function(selectors) {
  return this.querySelector(selectors);
}
$dynamic("queryAll").HTMLDocument = function(selectors) {
  if (const$0020.hasMatch(selectors)) {
    var mutableMatches = this.getElementsByName(selectors.substring((7), selectors.length - (2)));
    var len = mutableMatches.get$length();
    var copyOfMatches = new Array(len);
    for (var i = (0);
     i < len; ++i) {
      copyOfMatches.$setindex(i, mutableMatches.$index(i));
    }
    return new _FrozenElementList._wrap$ctor(copyOfMatches);
  }
  else if (const$0021.hasMatch(selectors)) {
    var mutableMatches = this.getElementsByTagName(selectors);
    var len = mutableMatches.get$length();
    var copyOfMatches = new Array(len);
    for (var i = (0);
     i < len; ++i) {
      copyOfMatches.$setindex(i, mutableMatches.$index(i));
    }
    return new _FrozenElementList._wrap$ctor(copyOfMatches);
  }
  else {
    return new _FrozenElementList._wrap$ctor(this.querySelectorAll(selectors));
  }
}
$dynamic("query$1").HTMLDocument = function($0) {
  return this.query($0);
};
$inherits(_DocumentEventsImpl, _ElementEventsImpl);
function _DocumentEventsImpl(_ptr) {
  _ElementEventsImpl.call(this, _ptr);
}
_DocumentEventsImpl.prototype.get$change = function() {
  return this._get("change");
}
_DocumentEventsImpl.prototype.get$click = function() {
  return this._get("click");
}
_DocumentEventsImpl.prototype.get$keyDown = function() {
  return this._get("keydown");
}
_DocumentEventsImpl.prototype.get$keyUp = function() {
  return this._get("keyup");
}
function FilteredElementList(node) {
  this._childNodes = node.get$nodes();
  this._node = node;
}
FilteredElementList.prototype.is$List = function(){return true};
FilteredElementList.prototype.is$Collection = function(){return true};
FilteredElementList.prototype.get$_filtered = function() {
  return ListFactory.ListFactory$from$factory(this._childNodes.filter$1((function (n) {
    return !!(n && n.is$html_Element());
  })
  ));
}
FilteredElementList.prototype.get$first = function() {
  var $$list = this._childNodes;
  for (var $$i = $$list.iterator(); $$i.hasNext(); ) {
    var node = $$i.next();
    if (!!(node && node.is$html_Element())) {
      return node;
    }
  }
  return null;
}
FilteredElementList.prototype.forEach = function(f) {
  this.get$_filtered().forEach$1(f);
}
FilteredElementList.prototype.$setindex = function(index, value) {
  this.$index(index).replaceWith(value);
}
FilteredElementList.prototype.add = function(value) {
  this._childNodes.add(value);
}
FilteredElementList.prototype.get$add = function() {
  return this.add.bind(this);
}
FilteredElementList.prototype.addAll = function(collection) {
  collection.forEach$1(this.get$add());
}
FilteredElementList.prototype.sort = function(compare) {
  $throw(const$0019);
}
FilteredElementList.prototype.removeRange = function(start, rangeLength) {
  this.get$_filtered().getRange(start, rangeLength).forEach$1((function (el) {
    return el.remove$0();
  })
  );
}
FilteredElementList.prototype.clear$_ = function() {
  this._childNodes.clear$_();
}
FilteredElementList.prototype.removeLast = function() {
  var result = this.last();
  if ($ne$(result)) {
    result.remove$0();
  }
  return result;
}
FilteredElementList.prototype.filter = function(f) {
  return this.get$_filtered().filter$1(f);
}
FilteredElementList.prototype.some = function(f) {
  return this.get$_filtered().some$1(f);
}
FilteredElementList.prototype.get$length = function() {
  return this.get$_filtered().get$length();
}
FilteredElementList.prototype.$index = function(index) {
  return this.get$_filtered().$index(index);
}
FilteredElementList.prototype.iterator = function() {
  return this.get$_filtered().iterator();
}
FilteredElementList.prototype.getRange = function(start, rangeLength) {
  return this.get$_filtered().getRange(start, rangeLength);
}
FilteredElementList.prototype.indexOf = function(element, start) {
  return this.get$_filtered().indexOf(element, start);
}
FilteredElementList.prototype.last = function() {
  return this.get$_filtered().last();
}
FilteredElementList.prototype.add$1 = FilteredElementList.prototype.add;
FilteredElementList.prototype.clear$0 = FilteredElementList.prototype.clear$_;
FilteredElementList.prototype.filter$1 = function($0) {
  return this.filter($wrap_call$1(to$call$1($0)));
};
FilteredElementList.prototype.forEach$1 = function($0) {
  return this.forEach($wrap_call$1(to$call$1($0)));
};
FilteredElementList.prototype.indexOf$1 = function($0) {
  return this.indexOf($0, (0));
};
FilteredElementList.prototype.some$1 = function($0) {
  return this.some($wrap_call$1(to$call$1($0)));
};
FilteredElementList.prototype.sort$1 = function($0) {
  return this.sort($wrap_call$2(to$call$2($0)));
};
function EmptyElementRect() {}
$dynamic("is$html_Element").DocumentFragment = function(){return true};
$dynamic("get$elements").DocumentFragment = function() {
  if (this._elements == null) {
    this._elements = new FilteredElementList(this);
  }
  return this._elements;
}
$dynamic("queryAll").DocumentFragment = function(selectors) {
  return new _FrozenElementList._wrap$ctor(this.querySelectorAll(selectors));
}
$dynamic("set$innerHTML").DocumentFragment = function(value) {
  this.get$nodes().clear$_();
  var e = _ElementFactoryProvider.Element$tag$factory("div");
  e.set$innerHTML(value);
  var nodes = ListFactory.ListFactory$from$factory(e.get$nodes());
  this.get$nodes().addAll(nodes);
}
$dynamic("get$title").DocumentFragment = function() {
  return "";
}
$dynamic("get$nextElementSibling").DocumentFragment = function() {
  return null;
}
$dynamic("get$previousElementSibling").DocumentFragment = function() {
  return null;
}
$dynamic("get$parent").DocumentFragment = function() {
  return null;
}
$dynamic("get$attributes").DocumentFragment = function() {
  return const$0016;
}
$dynamic("get$classes").DocumentFragment = function() {
  return new HashSetImplementation_dart_core_String();
}
$dynamic("click").DocumentFragment = function() {

}
$dynamic("get$click").DocumentFragment = function() {
  return this.click.bind(this);
}
$dynamic("get$on").DocumentFragment = function() {
  return new _ElementEventsImpl(this);
}
$dynamic("query$1").DocumentFragment = function($0) {
  return this.querySelector($0);
};
$dynamic("get$name").DocumentType = function() { return this.name; };
_ChildrenElementList._wrap$ctor = function(element) {
  this._childElements = element.get$$$dom_children();
  this._html_element = element;
}
_ChildrenElementList._wrap$ctor.prototype = _ChildrenElementList.prototype;
function _ChildrenElementList() {}
_ChildrenElementList.prototype.is$List = function(){return true};
_ChildrenElementList.prototype.is$Collection = function(){return true};
_ChildrenElementList.prototype._toList = function() {
  var output = new Array(this._childElements.get$length());
  for (var i = (0), len = this._childElements.get$length();
   i < len; i++) {
    output.$setindex(i, this._childElements.$index(i));
  }
  return output;
}
_ChildrenElementList.prototype.get$first = function() {
  return this._html_element.get$$$dom_firstElementChild();
}
_ChildrenElementList.prototype.forEach = function(f) {
  var $$list = this._childElements;
  for (var $$i = $$list.iterator(); $$i.hasNext(); ) {
    var element = $$i.next();
    f(element);
  }
}
_ChildrenElementList.prototype.filter = function(f) {
  var output = [];
  this.forEach((function (element) {
    if (f(element)) {
      output.add$1(element);
    }
  })
  );
  return new _FrozenElementList._wrap$ctor(output);
}
_ChildrenElementList.prototype.some = function(f) {
  for (var $$i = this.iterator(); $$i.hasNext(); ) {
    var element = $$i.next();
    if (f(element)) {
      return true;
    }
  }
  ;
  return false;
}
_ChildrenElementList.prototype.get$length = function() {
  return this._childElements.get$length();
}
_ChildrenElementList.prototype.$index = function(index) {
  return this._childElements.$index(index);
}
_ChildrenElementList.prototype.$setindex = function(index, value) {
  this._html_element.replaceChild(value, this._childElements.$index(index));
}
_ChildrenElementList.prototype.add = function(value) {
  this._html_element.appendChild(value);
  return value;
}
_ChildrenElementList.prototype.iterator = function() {
  return this._toList().iterator();
}
_ChildrenElementList.prototype.addAll = function(collection) {
  for (var $$i = collection.iterator(); $$i.hasNext(); ) {
    var element = $$i.next();
    this._html_element.appendChild(element);
  }
}
_ChildrenElementList.prototype.sort = function(compare) {
  $throw(const$0019);
}
_ChildrenElementList.prototype.removeRange = function(start, rangeLength) {
  $throw(const$0014);
}
_ChildrenElementList.prototype.getRange = function(start, rangeLength) {
  return new _FrozenElementList._wrap$ctor(_Lists.getRange(this, start, rangeLength, []));
}
_ChildrenElementList.prototype.indexOf = function(element, start) {
  return _Lists.indexOf(this, element, start, this.get$length());
}
_ChildrenElementList.prototype.clear$_ = function() {
  this._html_element.set$text("");
}
_ChildrenElementList.prototype.removeLast = function() {
  var result = this.last();
  if ($ne$(result)) {
    this._html_element.removeChild(result);
  }
  return result;
}
_ChildrenElementList.prototype.last = function() {
  return this._html_element.get$$$dom_lastElementChild();
}
_ChildrenElementList.prototype.add$1 = _ChildrenElementList.prototype.add;
_ChildrenElementList.prototype.clear$0 = _ChildrenElementList.prototype.clear$_;
_ChildrenElementList.prototype.filter$1 = function($0) {
  return this.filter($wrap_call$1(to$call$1($0)));
};
_ChildrenElementList.prototype.forEach$1 = function($0) {
  return this.forEach($wrap_call$1(to$call$1($0)));
};
_ChildrenElementList.prototype.indexOf$1 = function($0) {
  return this.indexOf($0, (0));
};
_ChildrenElementList.prototype.some$1 = function($0) {
  return this.some($wrap_call$1(to$call$1($0)));
};
_ChildrenElementList.prototype.sort$1 = function($0) {
  return this.sort($wrap_call$2(to$call$2($0)));
};
_FrozenElementList._wrap$ctor = function(_nodeList) {
  this._nodeList = _nodeList;
}
_FrozenElementList._wrap$ctor.prototype = _FrozenElementList.prototype;
function _FrozenElementList() {}
_FrozenElementList.prototype.is$List = function(){return true};
_FrozenElementList.prototype.is$Collection = function(){return true};
_FrozenElementList.prototype.get$first = function() {
  return this._nodeList.$index((0));
}
_FrozenElementList.prototype.forEach = function(f) {
  for (var $$i = this.iterator(); $$i.hasNext(); ) {
    var el = $$i.next();
    f(el);
  }
}
_FrozenElementList.prototype.filter = function(f) {
  var out = new _ElementList([]);
  for (var $$i = this.iterator(); $$i.hasNext(); ) {
    var el = $$i.next();
    if (f(el)) out.add$1(el);
  }
  return out;
}
_FrozenElementList.prototype.some = function(f) {
  for (var $$i = this.iterator(); $$i.hasNext(); ) {
    var element = $$i.next();
    if (f(element)) {
      return true;
    }
  }
  ;
  return false;
}
_FrozenElementList.prototype.get$length = function() {
  return this._nodeList.get$length();
}
_FrozenElementList.prototype.$index = function(index) {
  return this._nodeList.$index(index);
}
_FrozenElementList.prototype.$setindex = function(index, value) {
  $throw(const$0003);
}
_FrozenElementList.prototype.add = function(value) {
  $throw(const$0003);
}
_FrozenElementList.prototype.iterator = function() {
  return new _FrozenElementListIterator(this);
}
_FrozenElementList.prototype.addAll = function(collection) {
  $throw(const$0003);
}
_FrozenElementList.prototype.sort = function(compare) {
  $throw(const$0003);
}
_FrozenElementList.prototype.removeRange = function(start, rangeLength) {
  $throw(const$0003);
}
_FrozenElementList.prototype.getRange = function(start, rangeLength) {
  return new _FrozenElementList._wrap$ctor(this._nodeList.getRange(start, rangeLength));
}
_FrozenElementList.prototype.indexOf = function(element, start) {
  return this._nodeList.indexOf(element, start);
}
_FrozenElementList.prototype.clear$_ = function() {
  $throw(const$0003);
}
_FrozenElementList.prototype.removeLast = function() {
  $throw(const$0003);
}
_FrozenElementList.prototype.last = function() {
  return this._nodeList.last();
}
_FrozenElementList.prototype.add$1 = _FrozenElementList.prototype.add;
_FrozenElementList.prototype.clear$0 = _FrozenElementList.prototype.clear$_;
_FrozenElementList.prototype.filter$1 = function($0) {
  return this.filter($wrap_call$1(to$call$1($0)));
};
_FrozenElementList.prototype.forEach$1 = function($0) {
  return this.forEach($wrap_call$1(to$call$1($0)));
};
_FrozenElementList.prototype.indexOf$1 = function($0) {
  return this.indexOf($0, (0));
};
_FrozenElementList.prototype.some$1 = function($0) {
  return this.some($wrap_call$1(to$call$1($0)));
};
_FrozenElementList.prototype.sort$1 = function($0) {
  return this.sort($wrap_call$2(to$call$2($0)));
};
function _FrozenElementListIterator(_list) {
  this._html_index = (0);
  this._html_list = _list;
}
_FrozenElementListIterator.prototype.next = function() {
  if (!this.hasNext()) {
    $throw(const$0001);
  }
  return this._html_list.$index(this._html_index++);
}
_FrozenElementListIterator.prototype.hasNext = function() {
  return this._html_index < this._html_list.get$length();
}
function _ListWrapper() {}
_ListWrapper.prototype.is$List = function(){return true};
_ListWrapper.prototype.is$Collection = function(){return true};
_ListWrapper.prototype.iterator = function() {
  return this._html_list.iterator();
}
_ListWrapper.prototype.forEach = function(f) {
  return this._html_list.forEach$1(f);
}
_ListWrapper.prototype.filter = function(f) {
  return this._html_list.filter$1(f);
}
_ListWrapper.prototype.some = function(f) {
  return this._html_list.some$1(f);
}
_ListWrapper.prototype.get$length = function() {
  return this._html_list.get$length();
}
_ListWrapper.prototype.$index = function(index) {
  return this._html_list.$index(index);
}
_ListWrapper.prototype.$setindex = function(index, value) {
  this._html_list.$setindex(index, value);
}
_ListWrapper.prototype.add = function(value) {
  return this._html_list.add(value);
}
_ListWrapper.prototype.addAll = function(collection) {
  return this._html_list.addAll(collection);
}
_ListWrapper.prototype.sort = function(compare) {
  return this._html_list.sort$1(compare);
}
_ListWrapper.prototype.indexOf = function(element, start) {
  return this._html_list.indexOf(element, start);
}
_ListWrapper.prototype.clear$_ = function() {
  return this._html_list.clear$_();
}
_ListWrapper.prototype.removeLast = function() {
  return this._html_list.removeLast();
}
_ListWrapper.prototype.last = function() {
  return this._html_list.last();
}
_ListWrapper.prototype.getRange = function(start, rangeLength) {
  return this._html_list.getRange(start, rangeLength);
}
_ListWrapper.prototype.removeRange = function(start, rangeLength) {
  return this._html_list.removeRange(start, rangeLength);
}
_ListWrapper.prototype.get$first = function() {
  return this._html_list.$index((0));
}
_ListWrapper.prototype.add$1 = _ListWrapper.prototype.add;
_ListWrapper.prototype.clear$0 = _ListWrapper.prototype.clear$_;
_ListWrapper.prototype.filter$1 = function($0) {
  return this.filter($wrap_call$1(to$call$1($0)));
};
_ListWrapper.prototype.forEach$1 = function($0) {
  return this.forEach($wrap_call$1(to$call$1($0)));
};
_ListWrapper.prototype.indexOf$1 = function($0) {
  return this.indexOf($0, (0));
};
_ListWrapper.prototype.some$1 = function($0) {
  return this.some($wrap_call$1(to$call$1($0)));
};
_ListWrapper.prototype.sort$1 = function($0) {
  return this.sort($wrap_call$2(to$call$2($0)));
};
$inherits(_ListWrapper_Element, _ListWrapper);
function _ListWrapper_Element(_list) {
  this._html_list = _list;
}
_ListWrapper_Element.prototype.add$1 = _ListWrapper_Element.prototype.add;
_ListWrapper_Element.prototype.clear$0 = _ListWrapper_Element.prototype.clear$_;
_ListWrapper_Element.prototype.indexOf$1 = function($0) {
  return this.indexOf($0, (0));
};
_ListWrapper_Element.prototype.some$1 = function($0) {
  return this.some($wrap_call$1(to$call$1($0)));
};
_ListWrapper_Element.prototype.sort$1 = function($0) {
  return this.sort($wrap_call$2(to$call$2($0)));
};
$inherits(_ElementList, _ListWrapper_Element);
function _ElementList(list) {
  _ListWrapper_Element.call(this, list);
}
_ElementList.prototype.filter = function(f) {
  return new _ElementList(_ListWrapper_Element.prototype.filter.call(this, f));
}
_ElementList.prototype.getRange = function(start, rangeLength) {
  return new _ElementList(_ListWrapper_Element.prototype.getRange.call(this, start, rangeLength));
}
_ElementList.prototype.filter$1 = function($0) {
  return this.filter($wrap_call$1(to$call$1($0)));
};
function _ElementAttributeMap(_element) {
  this._html_element = _element;
}
_ElementAttributeMap.prototype.is$Map = function(){return true};
_ElementAttributeMap.prototype.is$Map_dart_core_String$Dynamic = function(){return true};
_ElementAttributeMap.prototype.containsKey = function(key) {
  return this._html_element.hasAttribute(key);
}
_ElementAttributeMap.prototype.$index = function(key) {
  return this._html_element.getAttribute(key);
}
_ElementAttributeMap.prototype.$setindex = function(key, value) {
  this._html_element.setAttribute(key, ("" + value));
}
_ElementAttributeMap.prototype.remove = function(key) {
  var value = this._html_element.getAttribute(key);
  this._html_element.removeAttribute(key);
  return value;
}
_ElementAttributeMap.prototype.clear$_ = function() {
  var attributes = this._html_element.get$$$dom_attributes();
  for (var i = attributes.get$length() - (1);
   i >= (0); i--) {
    this.remove(attributes.$index(i).get$name());
  }
}
_ElementAttributeMap.prototype.forEach = function(f) {
  var attributes = this._html_element.get$$$dom_attributes();
  for (var i = (0), len = attributes.get$length();
   i < len; i++) {
    var item = attributes.$index(i);
    f(item.get$name(), item.get$value());
  }
}
_ElementAttributeMap.prototype.getKeys = function() {
  var attributes = this._html_element.get$$$dom_attributes();
  var keys = new Array(attributes.get$length());
  for (var i = (0), len = attributes.get$length();
   i < len; i++) {
    keys.$setindex(i, attributes.$index(i).get$name());
  }
  return keys;
}
_ElementAttributeMap.prototype.get$length = function() {
  return this._html_element.get$$$dom_attributes().length;
}
_ElementAttributeMap.prototype.clear$0 = _ElementAttributeMap.prototype.clear$_;
_ElementAttributeMap.prototype.forEach$1 = function($0) {
  return this.forEach($wrap_call$2(to$call$2($0)));
};
_ElementAttributeMap.prototype.remove$1 = _ElementAttributeMap.prototype.remove;
function _DataAttributeMap() {}
_DataAttributeMap.prototype.is$Map = function(){return true};
_DataAttributeMap.prototype.is$Map_dart_core_String$Dynamic = function(){return true};
_DataAttributeMap.prototype.containsKey = function(key) {
  return this.$$dom_attributes.containsKey(this._attr(key));
}
_DataAttributeMap.prototype.$index = function(key) {
  return this.$$dom_attributes.$index(this._attr(key));
}
_DataAttributeMap.prototype.$setindex = function(key, value) {
  this.$$dom_attributes.$setindex(this._attr(key), ("" + value));
}
_DataAttributeMap.prototype.remove = function(key) {
  return this.$$dom_attributes.remove(this._attr(key));
}
_DataAttributeMap.prototype.clear$_ = function() {
  var $$list = this.getKeys();
  for (var $$i = $$list.iterator(); $$i.hasNext(); ) {
    var key = $$i.next();
    this.remove(key);
  }
}
_DataAttributeMap.prototype.forEach = function(f) {
  var $this = this;
  this.$$dom_attributes.forEach$1((function (key, value) {
    if ($this._matches(key)) {
      f($this._strip(key), value);
    }
  })
  );
}
_DataAttributeMap.prototype.getKeys = function() {
  var $this = this;
  var keys = new Array();
  this.$$dom_attributes.forEach$1((function (key, value) {
    if ($this._matches(key)) {
      keys.add$1($this._strip(key));
    }
  })
  );
  return keys;
}
_DataAttributeMap.prototype.get$length = function() {
  return this.getKeys().get$length();
}
_DataAttributeMap.prototype._attr = function(key) {
  return ("data-" + key);
}
_DataAttributeMap.prototype._matches = function(key) {
  return key.startsWith("data-");
}
_DataAttributeMap.prototype._strip = function(key) {
  return key.substring((5));
}
_DataAttributeMap.prototype.clear$0 = _DataAttributeMap.prototype.clear$_;
_DataAttributeMap.prototype.forEach$1 = function($0) {
  return this.forEach($wrap_call$2(to$call$2($0)));
};
_DataAttributeMap.prototype.remove$1 = _DataAttributeMap.prototype.remove;
function _CssClassSet(_element) {
  this._html_element = _element;
}
_CssClassSet.prototype.is$Collection = function(){return true};
_CssClassSet.prototype.toString = function() {
  return this._formatSet(this._read());
}
_CssClassSet.prototype.iterator = function() {
  return this._read().iterator();
}
_CssClassSet.prototype.forEach = function(f) {
  this._read().forEach$1(f);
}
_CssClassSet.prototype.filter = function(f) {
  return this._read().filter$1(f);
}
_CssClassSet.prototype.some = function(f) {
  return this._read().some$1(f);
}
_CssClassSet.prototype.get$length = function() {
  return this._read().get$length();
}
_CssClassSet.prototype.contains = function(value) {
  return this._read().contains(value);
}
_CssClassSet.prototype.add = function(value) {
  this._modify((function (s) {
    return s.add$1(value);
  })
  );
}
_CssClassSet.prototype.remove = function(value) {
  var s = this._read();
  var result = s.remove(value);
  this._write(s);
  return result;
}
_CssClassSet.prototype.addAll = function(collection) {
  this._modify((function (s) {
    return s.addAll(collection);
  })
  );
}
_CssClassSet.prototype.clear$_ = function() {
  this._modify((function (s) {
    return s.clear$0();
  })
  );
}
_CssClassSet.prototype._modify = function(f) {
  var s = this._read();
  f(s);
  this._write(s);
}
_CssClassSet.prototype._read = function() {
  var s = new HashSetImplementation_dart_core_String();
  var $$list = this._classname().split$_(" ");
  for (var $$i = $$list.iterator(); $$i.hasNext(); ) {
    var name = $$i.next();
    var trimmed = name.trim();
    if (!trimmed.isEmpty()) {
      s.add(trimmed);
    }
  }
  return s;
}
_CssClassSet.prototype._classname = function() {
  return this._html_element.get$$$dom_className();
}
_CssClassSet.prototype._write = function(s) {
  this._html_element.set$$$dom_className(this._formatSet(s));
}
_CssClassSet.prototype._formatSet = function(s) {
  var list = ListFactory.ListFactory$from$factory(s);
  return Strings.join(list, " ");
}
_CssClassSet.prototype.add$1 = _CssClassSet.prototype.add;
_CssClassSet.prototype.clear$0 = _CssClassSet.prototype.clear$_;
_CssClassSet.prototype.contains$1 = _CssClassSet.prototype.contains;
_CssClassSet.prototype.filter$1 = function($0) {
  return this.filter($wrap_call$1(to$call$1($0)));
};
_CssClassSet.prototype.forEach$1 = function($0) {
  return this.forEach($wrap_call$1(to$call$1($0)));
};
_CssClassSet.prototype.remove$1 = _CssClassSet.prototype.remove;
_CssClassSet.prototype.some$1 = function($0) {
  return this.some($wrap_call$1(to$call$1($0)));
};
function _SimpleClientRect(left, top, width, height) {
  this.left = left;
  this.top = top;
  this.width = width;
  this.height = height;
}
_SimpleClientRect.prototype.$eq = function(other) {
  return null != other && this.left == other.left && this.top == other.top && this.width == other.width && this.height == other.height;
}
_SimpleClientRect.prototype.toString = function() {
  return ("(" + this.left + ", " + this.top + ", " + this.width + ", " + this.height + ")");
}
function _ElementRectImpl(element) {
  this.client = new _SimpleClientRect(element.get$$$dom_clientLeft(), element.get$$$dom_clientTop(), element.get$$$dom_clientWidth(), element.get$$$dom_clientHeight());
  this.offset = new _SimpleClientRect(element.get$$$dom_offsetLeft(), element.get$$$dom_offsetTop(), element.get$$$dom_offsetWidth(), element.get$$$dom_offsetHeight());
  this.scroll = new _SimpleClientRect(element.get$$$dom_scrollLeft(), element.get$$$dom_scrollTop(), element.get$$$dom_scrollWidth(), element.get$$$dom_scrollHeight());
  this._boundingClientRect = element.getBoundingClientRect();
  this._clientRects = element.getClientRects();
}
function _ElementFactoryProvider() {}
_ElementFactoryProvider.Element$html$factory = function(html) {
  var parentTag = "div";
  var tag;
  var match = const$0024.firstMatch(html);
  if (null != match) {
    tag = match.group((1)).toLowerCase();
    if (const$0025.containsKey(tag)) {
      parentTag = const$0025.$index(tag);
    }
  }
  var temp = _ElementFactoryProvider.Element$tag$factory(parentTag);
  temp.set$innerHTML(html);
  var element;
  if (temp.get$elements().get$length() == (1)) {
    element = temp.get$elements().get$first();
  }
  else if (parentTag == "html" && temp.get$elements().get$length() == (2)) {
    element = temp.get$elements().$index(tag == "head" ? (0) : (1));
  }
  else {
    $throw(new IllegalArgumentException($add$(("HTML had " + temp.get$elements().get$length() + " "), "top level elements but 1 expected")));
  }
  element.remove();
  return element;
}
_ElementFactoryProvider.Element$tag$factory = function(tag) {
  return document.createElement(tag)
}
$dynamic("get$name").HTMLEmbedElement = function() { return this.name; };
$dynamic("get$length").EntryArray = function() { return this.length; };
$dynamic("get$length").EntryArraySync = function() { return this.length; };
$dynamic("get$name").EventException = function() { return this.name; };
$dynamic("get$on").EventSource = function() {
  return new _EventSourceEventsImpl(this);
}
$dynamic("get$url").EventSource = function() { return this.url; };
$dynamic("$dom_addEventListener$3").EventSource = function($0, $1, $2) {
  return this.addEventListener($0, $wrap_call$1(to$call$1($1)), $2);
};
$dynamic("$dom_removeEventListener$3").EventSource = function($0, $1, $2) {
  return this.removeEventListener($0, $wrap_call$1(to$call$1($1)), $2);
};
$inherits(_EventSourceEventsImpl, _EventsImpl);
function _EventSourceEventsImpl(_ptr) {
  _EventsImpl.call(this, _ptr);
}
function _EventListenerListImpl(_ptr, _type) {
  this._ptr = _ptr;
  this._type = _type;
}
_EventListenerListImpl.prototype.get$_ptr = function() { return this._ptr; };
_EventListenerListImpl.prototype.add = function(listener, useCapture) {
  this._add(listener, useCapture);
  return this;
}
_EventListenerListImpl.prototype.remove = function(listener, useCapture) {
  this._remove(listener, useCapture);
  return this;
}
_EventListenerListImpl.prototype._add = function(listener, useCapture) {
  this._ptr.$dom_addEventListener$3(this._type, listener, useCapture);
}
_EventListenerListImpl.prototype._remove = function(listener, useCapture) {
  this._ptr.$dom_removeEventListener$3(this._type, listener, useCapture);
}
_EventListenerListImpl.prototype.add$1 = function($0) {
  return this.add($wrap_call$1(to$call$1($0)), false);
};
_EventListenerListImpl.prototype.remove$1 = function($0) {
  return this.remove($wrap_call$1(to$call$1($0)), false);
};
$dynamic("get$name").HTMLFieldSetElement = function() { return this.name; };
$dynamic("get$name").File = function() { return this.name; };
$dynamic("get$name").FileException = function() { return this.name; };
$dynamic("get$length").FileList = function() { return this.length; };
$dynamic("get$on").FileReader = function() {
  return new _FileReaderEventsImpl(this);
}
$dynamic("$dom_addEventListener$3").FileReader = function($0, $1, $2) {
  return this.addEventListener($0, $wrap_call$1(to$call$1($1)), $2);
};
$dynamic("$dom_removeEventListener$3").FileReader = function($0, $1, $2) {
  return this.removeEventListener($0, $wrap_call$1(to$call$1($1)), $2);
};
$inherits(_FileReaderEventsImpl, _EventsImpl);
function _FileReaderEventsImpl(_ptr) {
  _EventsImpl.call(this, _ptr);
}
$dynamic("get$on").FileWriter = function() {
  return new _FileWriterEventsImpl(this);
}
$dynamic("get$length").FileWriter = function() { return this.length; };
$dynamic("$dom_addEventListener$3").FileWriter = function($0, $1, $2) {
  return this.addEventListener($0, $wrap_call$1(to$call$1($1)), $2);
};
$dynamic("$dom_removeEventListener$3").FileWriter = function($0, $1, $2) {
  return this.removeEventListener($0, $wrap_call$1(to$call$1($1)), $2);
};
$inherits(_FileWriterEventsImpl, _EventsImpl);
function _FileWriterEventsImpl(_ptr) {
  _EventsImpl.call(this, _ptr);
}
$dynamic("get$length").FileWriterSync = function() { return this.length; };
$dynamic("is$List").Float32Array = function(){return true};
$dynamic("is$Collection").Float32Array = function(){return true};
$dynamic("get$length").Float32Array = function() { return this.length; };
$dynamic("$index").Float32Array = function(index) {
  return this[index];
}
$dynamic("$setindex").Float32Array = function(index, value) {
  this[index] = value
}
$dynamic("iterator").Float32Array = function() {
  return new _FixedSizeListIterator_num(this);
}
$dynamic("add").Float32Array = function(value) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("addAll").Float32Array = function(collection) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("forEach").Float32Array = function(f) {
  return _Collections.forEach(this, f);
}
$dynamic("filter").Float32Array = function(f) {
  return _Collections.filter(this, [], f);
}
$dynamic("some").Float32Array = function(f) {
  return _Collections.some(this, f);
}
$dynamic("sort").Float32Array = function(compare) {
  $throw(new UnsupportedOperationException("Cannot sort immutable List."));
}
$dynamic("indexOf").Float32Array = function(element, start) {
  return _Lists.indexOf(this, element, start, this.length);
}
$dynamic("last").Float32Array = function() {
  return this.$index(this.length - (1));
}
$dynamic("removeLast").Float32Array = function() {
  $throw(new UnsupportedOperationException("Cannot removeLast on immutable List."));
}
$dynamic("removeRange").Float32Array = function(start, rangeLength) {
  $throw(new UnsupportedOperationException("Cannot removeRange on immutable List."));
}
$dynamic("getRange").Float32Array = function(start, rangeLength) {
  return _Lists.getRange(this, start, rangeLength, []);
}
$dynamic("add$1").Float32Array = function($0) {
  return this.add($0);
};
$dynamic("filter$1").Float32Array = function($0) {
  return this.filter($wrap_call$1(to$call$1($0)));
};
$dynamic("forEach$1").Float32Array = function($0) {
  return this.forEach($wrap_call$1(to$call$1($0)));
};
$dynamic("indexOf$1").Float32Array = function($0) {
  return this.indexOf($0, (0));
};
$dynamic("some$1").Float32Array = function($0) {
  return this.some($wrap_call$1(to$call$1($0)));
};
$dynamic("sort$1").Float32Array = function($0) {
  return this.sort($wrap_call$2(to$call$2($0)));
};
$dynamic("is$List").Float64Array = function(){return true};
$dynamic("is$Collection").Float64Array = function(){return true};
$dynamic("get$length").Float64Array = function() { return this.length; };
$dynamic("$index").Float64Array = function(index) {
  return this[index];
}
$dynamic("$setindex").Float64Array = function(index, value) {
  this[index] = value
}
$dynamic("iterator").Float64Array = function() {
  return new _FixedSizeListIterator_num(this);
}
$dynamic("add").Float64Array = function(value) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("addAll").Float64Array = function(collection) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("forEach").Float64Array = function(f) {
  return _Collections.forEach(this, f);
}
$dynamic("filter").Float64Array = function(f) {
  return _Collections.filter(this, [], f);
}
$dynamic("some").Float64Array = function(f) {
  return _Collections.some(this, f);
}
$dynamic("sort").Float64Array = function(compare) {
  $throw(new UnsupportedOperationException("Cannot sort immutable List."));
}
$dynamic("indexOf").Float64Array = function(element, start) {
  return _Lists.indexOf(this, element, start, this.length);
}
$dynamic("last").Float64Array = function() {
  return this.$index(this.length - (1));
}
$dynamic("removeLast").Float64Array = function() {
  $throw(new UnsupportedOperationException("Cannot removeLast on immutable List."));
}
$dynamic("removeRange").Float64Array = function(start, rangeLength) {
  $throw(new UnsupportedOperationException("Cannot removeRange on immutable List."));
}
$dynamic("getRange").Float64Array = function(start, rangeLength) {
  return _Lists.getRange(this, start, rangeLength, []);
}
$dynamic("add$1").Float64Array = function($0) {
  return this.add($0);
};
$dynamic("filter$1").Float64Array = function($0) {
  return this.filter($wrap_call$1(to$call$1($0)));
};
$dynamic("forEach$1").Float64Array = function($0) {
  return this.forEach($wrap_call$1(to$call$1($0)));
};
$dynamic("indexOf$1").Float64Array = function($0) {
  return this.indexOf($0, (0));
};
$dynamic("some$1").Float64Array = function($0) {
  return this.some($wrap_call$1(to$call$1($0)));
};
$dynamic("sort$1").Float64Array = function($0) {
  return this.sort($wrap_call$2(to$call$2($0)));
};
$dynamic("get$length").HTMLFormElement = function() { return this.length; };
$dynamic("get$name").HTMLFormElement = function() { return this.name; };
$dynamic("get$name").HTMLFrameElement = function() { return this.name; };
$dynamic("get$on").HTMLFrameSetElement = function() {
  return new _FrameSetElementEventsImpl(this);
}
$inherits(_FrameSetElementEventsImpl, _ElementEventsImpl);
function _FrameSetElementEventsImpl(_ptr) {
  _ElementEventsImpl.call(this, _ptr);
}
$dynamic("get$length").HTMLAllCollection = function() { return this.length; };
$dynamic("is$List").HTMLCollection = function(){return true};
$dynamic("is$Collection").HTMLCollection = function(){return true};
$dynamic("get$length").HTMLCollection = function() { return this.length; };
$dynamic("$index").HTMLCollection = function(index) {
  return this[index];
}
$dynamic("$setindex").HTMLCollection = function(index, value) {
  $throw(new UnsupportedOperationException("Cannot assign element of immutable List."));
}
$dynamic("iterator").HTMLCollection = function() {
  return new _FixedSizeListIterator_html_Node(this);
}
$dynamic("add").HTMLCollection = function(value) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("addAll").HTMLCollection = function(collection) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("forEach").HTMLCollection = function(f) {
  return _Collections.forEach(this, f);
}
$dynamic("filter").HTMLCollection = function(f) {
  return _Collections.filter(this, [], f);
}
$dynamic("some").HTMLCollection = function(f) {
  return _Collections.some(this, f);
}
$dynamic("sort").HTMLCollection = function(compare) {
  $throw(new UnsupportedOperationException("Cannot sort immutable List."));
}
$dynamic("indexOf").HTMLCollection = function(element, start) {
  return _Lists.indexOf(this, element, start, this.get$length());
}
$dynamic("last").HTMLCollection = function() {
  return this.$index(this.get$length() - (1));
}
$dynamic("removeLast").HTMLCollection = function() {
  $throw(new UnsupportedOperationException("Cannot removeLast on immutable List."));
}
$dynamic("removeRange").HTMLCollection = function(start, rangeLength) {
  $throw(new UnsupportedOperationException("Cannot removeRange on immutable List."));
}
$dynamic("getRange").HTMLCollection = function(start, rangeLength) {
  return _Lists.getRange(this, start, rangeLength, []);
}
$dynamic("add$1").HTMLCollection = function($0) {
  return this.add($0);
};
$dynamic("filter$1").HTMLCollection = function($0) {
  return this.filter($wrap_call$1(to$call$1($0)));
};
$dynamic("forEach$1").HTMLCollection = function($0) {
  return this.forEach($wrap_call$1(to$call$1($0)));
};
$dynamic("indexOf$1").HTMLCollection = function($0) {
  return this.indexOf($0, (0));
};
$dynamic("some$1").HTMLCollection = function($0) {
  return this.some($wrap_call$1(to$call$1($0)));
};
$dynamic("sort$1").HTMLCollection = function($0) {
  return this.sort($wrap_call$2(to$call$2($0)));
};
$dynamic("get$length").HTMLOptionsCollection = function() {
  return this.length;
}
$dynamic("remove$1").HTMLOptionsCollection = function($0) {
  return this.remove($0);
};
$dynamic("get$length").History = function() { return this.length; };
$dynamic("get$value").IDBCursorWithValue = function() { return this.value; };
$dynamic("get$on").IDBDatabase = function() {
  return new _IDBDatabaseEventsImpl(this);
}
$dynamic("get$name").IDBDatabase = function() { return this.name; };
$dynamic("$dom_addEventListener$3").IDBDatabase = function($0, $1, $2) {
  return this.addEventListener($0, $wrap_call$1(to$call$1($1)), $2);
};
$dynamic("$dom_removeEventListener$3").IDBDatabase = function($0, $1, $2) {
  return this.removeEventListener($0, $wrap_call$1(to$call$1($1)), $2);
};
$inherits(_IDBDatabaseEventsImpl, _EventsImpl);
function _IDBDatabaseEventsImpl(_ptr) {
  _EventsImpl.call(this, _ptr);
}
$dynamic("get$name").IDBDatabaseException = function() { return this.name; };
$dynamic("get$name").IDBIndex = function() { return this.name; };
$dynamic("get$name").IDBObjectStore = function() { return this.name; };
$dynamic("add$1").IDBObjectStore = function($0) {
  return this.add($0);
};
$dynamic("clear$0").IDBObjectStore = function() {
  return this.clear();
};
$dynamic("get$on").IDBRequest = function() {
  return new _IDBRequestEventsImpl(this);
}
$dynamic("$dom_addEventListener$3").IDBRequest = function($0, $1, $2) {
  if (Object.getPrototypeOf(this).hasOwnProperty("$dom_addEventListener$3")) {
    return this.addEventListener($0, $wrap_call$1(to$call$1($1)), $2);
  }
  return Object.prototype.$dom_addEventListener$3.call(this, $0, $1, $2);
};
$dynamic("$dom_removeEventListener$3").IDBRequest = function($0, $1, $2) {
  if (Object.getPrototypeOf(this).hasOwnProperty("$dom_removeEventListener$3")) {
    return this.removeEventListener($0, $wrap_call$1(to$call$1($1)), $2);
  }
  return Object.prototype.$dom_removeEventListener$3.call(this, $0, $1, $2);
};
$inherits(_IDBRequestEventsImpl, _EventsImpl);
function _IDBRequestEventsImpl(_ptr) {
  _EventsImpl.call(this, _ptr);
}
$dynamic("get$on").IDBTransaction = function() {
  return new _IDBTransactionEventsImpl(this);
}
$dynamic("$dom_addEventListener$3").IDBTransaction = function($0, $1, $2) {
  return this.addEventListener($0, $wrap_call$1(to$call$1($1)), $2);
};
$dynamic("$dom_removeEventListener$3").IDBTransaction = function($0, $1, $2) {
  return this.removeEventListener($0, $wrap_call$1(to$call$1($1)), $2);
};
$inherits(_IDBTransactionEventsImpl, _EventsImpl);
function _IDBTransactionEventsImpl(_ptr) {
  _EventsImpl.call(this, _ptr);
}
$dynamic("get$on").IDBVersionChangeRequest = function() {
  return new _IDBVersionChangeRequestEventsImpl(this);
}
$dynamic("$dom_addEventListener$3").IDBVersionChangeRequest = function($0, $1, $2) {
  return this.addEventListener($0, $wrap_call$1(to$call$1($1)), $2);
};
$dynamic("$dom_removeEventListener$3").IDBVersionChangeRequest = function($0, $1, $2) {
  return this.removeEventListener($0, $wrap_call$1(to$call$1($1)), $2);
};
$inherits(_IDBVersionChangeRequestEventsImpl, _IDBRequestEventsImpl);
function _IDBVersionChangeRequestEventsImpl(_ptr) {
  _IDBRequestEventsImpl.call(this, _ptr);
}
$dynamic("get$name").HTMLIFrameElement = function() { return this.name; };
$dynamic("get$name").HTMLImageElement = function() { return this.name; };
$dynamic("get$on").HTMLInputElement = function() {
  return new _InputElementEventsImpl(this);
}
$dynamic("get$name").HTMLInputElement = function() { return this.name; };
$dynamic("get$value").HTMLInputElement = function() { return this.value; };
$dynamic("set$value").HTMLInputElement = function(value) { return this.value = value; };
$inherits(_InputElementEventsImpl, _ElementEventsImpl);
function _InputElementEventsImpl(_ptr) {
  _ElementEventsImpl.call(this, _ptr);
}
$dynamic("is$List").Int16Array = function(){return true};
$dynamic("is$Collection").Int16Array = function(){return true};
$dynamic("get$length").Int16Array = function() { return this.length; };
$dynamic("$index").Int16Array = function(index) {
  return this[index];
}
$dynamic("$setindex").Int16Array = function(index, value) {
  this[index] = value
}
$dynamic("iterator").Int16Array = function() {
  return new _FixedSizeListIterator_int(this);
}
$dynamic("add").Int16Array = function(value) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("addAll").Int16Array = function(collection) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("forEach").Int16Array = function(f) {
  return _Collections.forEach(this, f);
}
$dynamic("filter").Int16Array = function(f) {
  return _Collections.filter(this, [], f);
}
$dynamic("some").Int16Array = function(f) {
  return _Collections.some(this, f);
}
$dynamic("sort").Int16Array = function(compare) {
  $throw(new UnsupportedOperationException("Cannot sort immutable List."));
}
$dynamic("indexOf").Int16Array = function(element, start) {
  return _Lists.indexOf(this, element, start, this.length);
}
$dynamic("last").Int16Array = function() {
  return this.$index(this.length - (1));
}
$dynamic("removeLast").Int16Array = function() {
  $throw(new UnsupportedOperationException("Cannot removeLast on immutable List."));
}
$dynamic("removeRange").Int16Array = function(start, rangeLength) {
  $throw(new UnsupportedOperationException("Cannot removeRange on immutable List."));
}
$dynamic("getRange").Int16Array = function(start, rangeLength) {
  return _Lists.getRange(this, start, rangeLength, []);
}
$dynamic("add$1").Int16Array = function($0) {
  return this.add($0);
};
$dynamic("filter$1").Int16Array = function($0) {
  return this.filter($wrap_call$1(to$call$1($0)));
};
$dynamic("forEach$1").Int16Array = function($0) {
  return this.forEach($wrap_call$1(to$call$1($0)));
};
$dynamic("indexOf$1").Int16Array = function($0) {
  return this.indexOf($0, (0));
};
$dynamic("some$1").Int16Array = function($0) {
  return this.some($wrap_call$1(to$call$1($0)));
};
$dynamic("sort$1").Int16Array = function($0) {
  return this.sort($wrap_call$2(to$call$2($0)));
};
$dynamic("is$List").Int32Array = function(){return true};
$dynamic("is$Collection").Int32Array = function(){return true};
$dynamic("get$length").Int32Array = function() { return this.length; };
$dynamic("$index").Int32Array = function(index) {
  return this[index];
}
$dynamic("$setindex").Int32Array = function(index, value) {
  this[index] = value
}
$dynamic("iterator").Int32Array = function() {
  return new _FixedSizeListIterator_int(this);
}
$dynamic("add").Int32Array = function(value) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("addAll").Int32Array = function(collection) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("forEach").Int32Array = function(f) {
  return _Collections.forEach(this, f);
}
$dynamic("filter").Int32Array = function(f) {
  return _Collections.filter(this, [], f);
}
$dynamic("some").Int32Array = function(f) {
  return _Collections.some(this, f);
}
$dynamic("sort").Int32Array = function(compare) {
  $throw(new UnsupportedOperationException("Cannot sort immutable List."));
}
$dynamic("indexOf").Int32Array = function(element, start) {
  return _Lists.indexOf(this, element, start, this.length);
}
$dynamic("last").Int32Array = function() {
  return this.$index(this.length - (1));
}
$dynamic("removeLast").Int32Array = function() {
  $throw(new UnsupportedOperationException("Cannot removeLast on immutable List."));
}
$dynamic("removeRange").Int32Array = function(start, rangeLength) {
  $throw(new UnsupportedOperationException("Cannot removeRange on immutable List."));
}
$dynamic("getRange").Int32Array = function(start, rangeLength) {
  return _Lists.getRange(this, start, rangeLength, []);
}
$dynamic("add$1").Int32Array = function($0) {
  return this.add($0);
};
$dynamic("filter$1").Int32Array = function($0) {
  return this.filter($wrap_call$1(to$call$1($0)));
};
$dynamic("forEach$1").Int32Array = function($0) {
  return this.forEach($wrap_call$1(to$call$1($0)));
};
$dynamic("indexOf$1").Int32Array = function($0) {
  return this.indexOf($0, (0));
};
$dynamic("some$1").Int32Array = function($0) {
  return this.some($wrap_call$1(to$call$1($0)));
};
$dynamic("sort$1").Int32Array = function($0) {
  return this.sort($wrap_call$2(to$call$2($0)));
};
$dynamic("is$List").Int8Array = function(){return true};
$dynamic("is$Collection").Int8Array = function(){return true};
$dynamic("get$length").Int8Array = function() { return this.length; };
$dynamic("$index").Int8Array = function(index) {
  return this[index];
}
$dynamic("$setindex").Int8Array = function(index, value) {
  this[index] = value
}
$dynamic("iterator").Int8Array = function() {
  return new _FixedSizeListIterator_int(this);
}
$dynamic("add").Int8Array = function(value) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("addAll").Int8Array = function(collection) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("forEach").Int8Array = function(f) {
  return _Collections.forEach(this, f);
}
$dynamic("filter").Int8Array = function(f) {
  return _Collections.filter(this, [], f);
}
$dynamic("some").Int8Array = function(f) {
  return _Collections.some(this, f);
}
$dynamic("sort").Int8Array = function(compare) {
  $throw(new UnsupportedOperationException("Cannot sort immutable List."));
}
$dynamic("indexOf").Int8Array = function(element, start) {
  return _Lists.indexOf(this, element, start, this.length);
}
$dynamic("last").Int8Array = function() {
  return this.$index(this.length - (1));
}
$dynamic("removeLast").Int8Array = function() {
  $throw(new UnsupportedOperationException("Cannot removeLast on immutable List."));
}
$dynamic("removeRange").Int8Array = function(start, rangeLength) {
  $throw(new UnsupportedOperationException("Cannot removeRange on immutable List."));
}
$dynamic("getRange").Int8Array = function(start, rangeLength) {
  return _Lists.getRange(this, start, rangeLength, []);
}
$dynamic("add$1").Int8Array = function($0) {
  return this.add($0);
};
$dynamic("filter$1").Int8Array = function($0) {
  return this.filter($wrap_call$1(to$call$1($0)));
};
$dynamic("forEach$1").Int8Array = function($0) {
  return this.forEach($wrap_call$1(to$call$1($0)));
};
$dynamic("indexOf$1").Int8Array = function($0) {
  return this.indexOf($0, (0));
};
$dynamic("some$1").Int8Array = function($0) {
  return this.some($wrap_call$1(to$call$1($0)));
};
$dynamic("sort$1").Int8Array = function($0) {
  return this.sort($wrap_call$2(to$call$2($0)));
};
$dynamic("get$on").JavaScriptAudioNode = function() {
  return new _JavaScriptAudioNodeEventsImpl(this);
}
$dynamic("$dom_addEventListener$3").JavaScriptAudioNode = function($0, $1, $2) {
  return this.addEventListener($0, $wrap_call$1(to$call$1($1)), $2);
};
$dynamic("$dom_removeEventListener$3").JavaScriptAudioNode = function($0, $1, $2) {
  return this.removeEventListener($0, $wrap_call$1(to$call$1($1)), $2);
};
$inherits(_JavaScriptAudioNodeEventsImpl, _EventsImpl);
function _JavaScriptAudioNodeEventsImpl(_ptr) {
  _EventsImpl.call(this, _ptr);
}
$dynamic("get$name").HTMLKeygenElement = function() { return this.name; };
$dynamic("get$value").HTMLLIElement = function() { return this.value; };
$dynamic("set$value").HTMLLIElement = function(value) { return this.value = value; };
$dynamic("get$on").MediaStream = function() {
  return new _MediaStreamEventsImpl(this);
}
$dynamic("$dom_addEventListener$3").MediaStream = function($0, $1, $2) {
  return this.addEventListener($0, $wrap_call$1(to$call$1($1)), $2);
};
$dynamic("$dom_removeEventListener$3").MediaStream = function($0, $1, $2) {
  return this.removeEventListener($0, $wrap_call$1(to$call$1($1)), $2);
};
$dynamic("get$name").HTMLMapElement = function() { return this.name; };
$dynamic("start$0").HTMLMarqueeElement = function() {
  return this.start();
};
$dynamic("$dom_addEventListener$3").MediaController = function($0, $1, $2) {
  return this.addEventListener($0, $wrap_call$1(to$call$1($1)), $2);
};
$dynamic("$dom_removeEventListener$3").MediaController = function($0, $1, $2) {
  return this.removeEventListener($0, $wrap_call$1(to$call$1($1)), $2);
};
$inherits(_MediaElementEventsImpl, _ElementEventsImpl);
function _MediaElementEventsImpl(_ptr) {
  _ElementEventsImpl.call(this, _ptr);
}
$dynamic("is$List").MediaList = function(){return true};
$dynamic("is$Collection").MediaList = function(){return true};
$dynamic("get$length").MediaList = function() { return this.length; };
$dynamic("$index").MediaList = function(index) {
  return this[index];
}
$dynamic("$setindex").MediaList = function(index, value) {
  $throw(new UnsupportedOperationException("Cannot assign element of immutable List."));
}
$dynamic("iterator").MediaList = function() {
  return new _FixedSizeListIterator_dart_core_String(this);
}
$dynamic("add").MediaList = function(value) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("addAll").MediaList = function(collection) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("forEach").MediaList = function(f) {
  return _Collections.forEach(this, f);
}
$dynamic("filter").MediaList = function(f) {
  return _Collections.filter(this, [], f);
}
$dynamic("some").MediaList = function(f) {
  return _Collections.some(this, f);
}
$dynamic("sort").MediaList = function(compare) {
  $throw(new UnsupportedOperationException("Cannot sort immutable List."));
}
$dynamic("indexOf").MediaList = function(element, start) {
  return _Lists.indexOf(this, element, start, this.length);
}
$dynamic("last").MediaList = function() {
  return this.$index(this.length - (1));
}
$dynamic("removeLast").MediaList = function() {
  $throw(new UnsupportedOperationException("Cannot removeLast on immutable List."));
}
$dynamic("removeRange").MediaList = function(start, rangeLength) {
  $throw(new UnsupportedOperationException("Cannot removeRange on immutable List."));
}
$dynamic("getRange").MediaList = function(start, rangeLength) {
  return _Lists.getRange(this, start, rangeLength, []);
}
$dynamic("add$1").MediaList = function($0) {
  return this.add($0);
};
$dynamic("filter$1").MediaList = function($0) {
  return this.filter($wrap_call$1(to$call$1($0)));
};
$dynamic("forEach$1").MediaList = function($0) {
  return this.forEach($wrap_call$1(to$call$1($0)));
};
$dynamic("indexOf$1").MediaList = function($0) {
  return this.indexOf($0, (0));
};
$dynamic("some$1").MediaList = function($0) {
  return this.some($wrap_call$1(to$call$1($0)));
};
$dynamic("sort$1").MediaList = function($0) {
  return this.sort($wrap_call$2(to$call$2($0)));
};
$inherits(_MediaStreamEventsImpl, _EventsImpl);
function _MediaStreamEventsImpl(_ptr) {
  _EventsImpl.call(this, _ptr);
}
$dynamic("get$length").MediaStreamList = function() { return this.length; };
$dynamic("get$length").MediaStreamTrackList = function() { return this.length; };
$dynamic("get$on").MessagePort = function() {
  return new _MessagePortEventsImpl(this);
}
$dynamic("$dom_addEventListener$3").MessagePort = function($0, $1, $2) {
  return this.addEventListener($0, $wrap_call$1(to$call$1($1)), $2);
};
$dynamic("$dom_removeEventListener$3").MessagePort = function($0, $1, $2) {
  return this.removeEventListener($0, $wrap_call$1(to$call$1($1)), $2);
};
$dynamic("start$0").MessagePort = function() {
  return this.start();
};
$inherits(_MessagePortEventsImpl, _EventsImpl);
function _MessagePortEventsImpl(_ptr) {
  _EventsImpl.call(this, _ptr);
}
$dynamic("get$name").HTMLMetaElement = function() { return this.name; };
$dynamic("get$value").HTMLMeterElement = function() { return this.value; };
$dynamic("set$value").HTMLMeterElement = function(value) { return this.value = value; };
$dynamic("is$List").NamedNodeMap = function(){return true};
$dynamic("is$Collection").NamedNodeMap = function(){return true};
$dynamic("get$length").NamedNodeMap = function() { return this.length; };
$dynamic("$index").NamedNodeMap = function(index) {
  return this[index];
}
$dynamic("$setindex").NamedNodeMap = function(index, value) {
  $throw(new UnsupportedOperationException("Cannot assign element of immutable List."));
}
$dynamic("iterator").NamedNodeMap = function() {
  return new _FixedSizeListIterator_html_Node(this);
}
$dynamic("add").NamedNodeMap = function(value) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("addAll").NamedNodeMap = function(collection) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("forEach").NamedNodeMap = function(f) {
  return _Collections.forEach(this, f);
}
$dynamic("filter").NamedNodeMap = function(f) {
  return _Collections.filter(this, [], f);
}
$dynamic("some").NamedNodeMap = function(f) {
  return _Collections.some(this, f);
}
$dynamic("sort").NamedNodeMap = function(compare) {
  $throw(new UnsupportedOperationException("Cannot sort immutable List."));
}
$dynamic("indexOf").NamedNodeMap = function(element, start) {
  return _Lists.indexOf(this, element, start, this.length);
}
$dynamic("last").NamedNodeMap = function() {
  return this.$index(this.length - (1));
}
$dynamic("removeLast").NamedNodeMap = function() {
  $throw(new UnsupportedOperationException("Cannot removeLast on immutable List."));
}
$dynamic("removeRange").NamedNodeMap = function(start, rangeLength) {
  $throw(new UnsupportedOperationException("Cannot removeRange on immutable List."));
}
$dynamic("getRange").NamedNodeMap = function(start, rangeLength) {
  return _Lists.getRange(this, start, rangeLength, []);
}
$dynamic("add$1").NamedNodeMap = function($0) {
  return this.add($0);
};
$dynamic("filter$1").NamedNodeMap = function($0) {
  return this.filter($wrap_call$1(to$call$1($0)));
};
$dynamic("forEach$1").NamedNodeMap = function($0) {
  return this.forEach($wrap_call$1(to$call$1($0)));
};
$dynamic("indexOf$1").NamedNodeMap = function($0) {
  return this.indexOf($0, (0));
};
$dynamic("some$1").NamedNodeMap = function($0) {
  return this.some($wrap_call$1(to$call$1($0)));
};
$dynamic("sort$1").NamedNodeMap = function($0) {
  return this.sort($wrap_call$2(to$call$2($0)));
};
function _ChildNodeListLazy(_this) {
  this._this = _this;
}
_ChildNodeListLazy.prototype.is$List = function(){return true};
_ChildNodeListLazy.prototype.is$Collection = function(){return true};
_ChildNodeListLazy.prototype.last = function() {
  return this._this.lastChild;
}
_ChildNodeListLazy.prototype.add = function(value) {
  this._this.appendChild(value);
}
_ChildNodeListLazy.prototype.addAll = function(collection) {
  for (var $$i = collection.iterator(); $$i.hasNext(); ) {
    var node = $$i.next();
    this._this.appendChild(node);
  }
}
_ChildNodeListLazy.prototype.removeLast = function() {
  var result = this.last();
  if ($ne$(result)) {
    this._this.removeChild(result);
  }
  return result;
}
_ChildNodeListLazy.prototype.clear$_ = function() {
  this._this.set$text("");
}
_ChildNodeListLazy.prototype.$setindex = function(index, value) {
  this._this.replaceChild(value, this.$index(index));
}
_ChildNodeListLazy.prototype.iterator = function() {
  return this._this.get$$$dom_childNodes().iterator();
}
_ChildNodeListLazy.prototype.forEach = function(f) {
  return _Collections.forEach(this, f);
}
_ChildNodeListLazy.prototype.filter = function(f) {
  return new _NodeListWrapper(_Collections.filter(this, [], f));
}
_ChildNodeListLazy.prototype.some = function(f) {
  return _Collections.some(this, f);
}
_ChildNodeListLazy.prototype.sort = function(compare) {
  $throw(new UnsupportedOperationException("Cannot sort immutable List."));
}
_ChildNodeListLazy.prototype.indexOf = function(element, start) {
  return _Lists.indexOf(this, element, start, this.get$length());
}
_ChildNodeListLazy.prototype.removeRange = function(start, rangeLength) {
  $throw(new UnsupportedOperationException("Cannot removeRange on immutable List."));
}
_ChildNodeListLazy.prototype.getRange = function(start, rangeLength) {
  return new _NodeListWrapper(_Lists.getRange(this, start, rangeLength, []));
}
_ChildNodeListLazy.prototype.get$length = function() {
  return this._this.get$$$dom_childNodes().length;
}
_ChildNodeListLazy.prototype.$index = function(index) {
  return this._this.get$$$dom_childNodes().$index(index);
}
_ChildNodeListLazy.prototype.add$1 = _ChildNodeListLazy.prototype.add;
_ChildNodeListLazy.prototype.clear$0 = _ChildNodeListLazy.prototype.clear$_;
_ChildNodeListLazy.prototype.filter$1 = function($0) {
  return this.filter($wrap_call$1(to$call$1($0)));
};
_ChildNodeListLazy.prototype.forEach$1 = function($0) {
  return this.forEach($wrap_call$1(to$call$1($0)));
};
_ChildNodeListLazy.prototype.indexOf$1 = function($0) {
  return this.indexOf($0, (0));
};
_ChildNodeListLazy.prototype.some$1 = function($0) {
  return this.some($wrap_call$1(to$call$1($0)));
};
_ChildNodeListLazy.prototype.sort$1 = function($0) {
  return this.sort($wrap_call$2(to$call$2($0)));
};
$inherits(_ListWrapper_Node, _ListWrapper);
function _ListWrapper_Node(_list) {
  this._html_list = _list;
}
_ListWrapper_Node.prototype.add$1 = _ListWrapper_Node.prototype.add;
_ListWrapper_Node.prototype.clear$0 = _ListWrapper_Node.prototype.clear$_;
_ListWrapper_Node.prototype.indexOf$1 = function($0) {
  return this.indexOf($0, (0));
};
_ListWrapper_Node.prototype.some$1 = function($0) {
  return this.some($wrap_call$1(to$call$1($0)));
};
_ListWrapper_Node.prototype.sort$1 = function($0) {
  return this.sort($wrap_call$2(to$call$2($0)));
};
$inherits(_NodeListWrapper, _ListWrapper_Node);
function _NodeListWrapper(list) {
  _ListWrapper_Node.call(this, list);
}
_NodeListWrapper.prototype.filter = function(f) {
  return new _NodeListWrapper(this._html_list.filter$1(f));
}
_NodeListWrapper.prototype.getRange = function(start, rangeLength) {
  return new _NodeListWrapper(this._html_list.getRange(start, rangeLength));
}
_NodeListWrapper.prototype.filter$1 = function($0) {
  return this.filter($wrap_call$1(to$call$1($0)));
};
$dynamic("is$List").NodeList = function(){return true};
$dynamic("is$Collection").NodeList = function(){return true};
$dynamic("iterator").NodeList = function() {
  return new _FixedSizeListIterator_html_Node(this);
}
$dynamic("add").NodeList = function(value) {
  this._parent.appendChild(value);
}
$dynamic("addAll").NodeList = function(collection) {
  for (var $$i = collection.iterator(); $$i.hasNext(); ) {
    var node = $$i.next();
    this._parent.appendChild(node);
  }
}
$dynamic("removeLast").NodeList = function() {
  var result = this.last();
  if ($ne$(result)) {
    this._parent.removeChild(result);
  }
  return result;
}
$dynamic("clear$_").NodeList = function() {
  this._parent.set$text("");
}
$dynamic("$setindex").NodeList = function(index, value) {
  this._parent.replaceChild(value, this.$index(index));
}
$dynamic("forEach").NodeList = function(f) {
  return _Collections.forEach(this, f);
}
$dynamic("filter").NodeList = function(f) {
  return new _NodeListWrapper(_Collections.filter(this, [], f));
}
$dynamic("some").NodeList = function(f) {
  return _Collections.some(this, f);
}
$dynamic("sort").NodeList = function(compare) {
  $throw(new UnsupportedOperationException("Cannot sort immutable List."));
}
$dynamic("indexOf").NodeList = function(element, start) {
  return _Lists.indexOf(this, element, start, this.length);
}
$dynamic("last").NodeList = function() {
  return this.$index(this.length - (1));
}
$dynamic("removeRange").NodeList = function(start, rangeLength) {
  $throw(new UnsupportedOperationException("Cannot removeRange on immutable List."));
}
$dynamic("getRange").NodeList = function(start, rangeLength) {
  return new _NodeListWrapper(_Lists.getRange(this, start, rangeLength, []));
}
$dynamic("get$length").NodeList = function() { return this.length; };
$dynamic("$index").NodeList = function(index) {
  return this[index];
}
$dynamic("add$1").NodeList = function($0) {
  return this.add($0);
};
$dynamic("clear$0").NodeList = function() {
  return this.clear$_();
};
$dynamic("filter$1").NodeList = function($0) {
  return this.filter($wrap_call$1(to$call$1($0)));
};
$dynamic("forEach$1").NodeList = function($0) {
  return this.forEach($wrap_call$1(to$call$1($0)));
};
$dynamic("indexOf$1").NodeList = function($0) {
  return this.indexOf($0, (0));
};
$dynamic("some$1").NodeList = function($0) {
  return this.some($wrap_call$1(to$call$1($0)));
};
$dynamic("sort$1").NodeList = function($0) {
  return this.sort($wrap_call$2(to$call$2($0)));
};
$dynamic("query$1").NodeSelector = function($0) {
  return this.querySelector($0);
};
$dynamic("get$on").Notification = function() {
  return new _NotificationEventsImpl(this);
}
$inherits(_NotificationEventsImpl, _EventsImpl);
function _NotificationEventsImpl(_ptr) {
  _EventsImpl.call(this, _ptr);
}
_NotificationEventsImpl.prototype.get$click = function() {
  return this._get("click");
}
$dynamic("get$name").HTMLObjectElement = function() { return this.name; };
$dynamic("get$name").OperationNotAllowedException = function() { return this.name; };
$dynamic("get$value").HTMLOptionElement = function() { return this.value; };
$dynamic("set$value").HTMLOptionElement = function(value) { return this.value = value; };
$dynamic("get$name").HTMLOutputElement = function() { return this.name; };
$dynamic("get$value").HTMLOutputElement = function() { return this.value; };
$dynamic("set$value").HTMLOutputElement = function(value) { return this.value = value; };
$dynamic("get$name").HTMLParamElement = function() { return this.name; };
$dynamic("get$value").HTMLParamElement = function() { return this.value; };
$dynamic("set$value").HTMLParamElement = function(value) { return this.value = value; };
$dynamic("get$on").PeerConnection00 = function() {
  return new _PeerConnection00EventsImpl(this);
}
$dynamic("$dom_addEventListener$3").PeerConnection00 = function($0, $1, $2) {
  return this.addEventListener($0, $wrap_call$1(to$call$1($1)), $2);
};
$dynamic("$dom_removeEventListener$3").PeerConnection00 = function($0, $1, $2) {
  return this.removeEventListener($0, $wrap_call$1(to$call$1($1)), $2);
};
$inherits(_PeerConnection00EventsImpl, _EventsImpl);
function _PeerConnection00EventsImpl(_ptr) {
  _EventsImpl.call(this, _ptr);
}
$dynamic("get$value").HTMLProgressElement = function() { return this.value; };
$dynamic("set$value").HTMLProgressElement = function(value) { return this.value = value; };
$dynamic("get$name").RangeException = function() { return this.name; };
$dynamic("get$length").SQLResultSetRowList = function() { return this.length; };
$dynamic("get$classes").SVGElement = function() {
  if (null == this.noSuchMethod("get:_cssClassSet", [])) {
    this.noSuchMethod("set:_cssClassSet", [new _AttributeClassSet(this.get$_ptr())]);
  }
  return this.noSuchMethod("get:_cssClassSet", []);
}
$dynamic("get$elements").SVGElement = function() {
  return new FilteredElementList(this);
}
$dynamic("set$elements").SVGElement = function(value) {
  var elements = this.get$elements();
  elements.clear$0();
  elements.addAll(value);
}
$dynamic("set$innerHTML").SVGElement = function(svg) {
  var container = _ElementFactoryProvider.Element$tag$factory("div");
  container.set$innerHTML(("<svg version=\"1.1\">" + svg + "</svg>"));
  this.set$elements(container.get$elements().get$first().get$elements());
}
$dynamic("get$value").SVGAngle = function() { return this.value; };
$dynamic("set$value").SVGAngle = function(value) { return this.value = value; };
$inherits(_AttributeClassSet, _CssClassSet);
function _AttributeClassSet(element) {
  _CssClassSet.call(this, element);
}
_AttributeClassSet.prototype._write = function(s) {
  this._html_element.get$attributes().$setindex("class", this._formatSet(s));
}
$dynamic("get$on").SVGElementInstance = function() {
  return new _SVGElementInstanceEventsImpl(this);
}
$inherits(_SVGElementInstanceEventsImpl, _EventsImpl);
function _SVGElementInstanceEventsImpl(_ptr) {
  _EventsImpl.call(this, _ptr);
}
_SVGElementInstanceEventsImpl.prototype.get$change = function() {
  return this._get("change");
}
_SVGElementInstanceEventsImpl.prototype.get$click = function() {
  return this._get("click");
}
_SVGElementInstanceEventsImpl.prototype.get$keyUp = function() {
  return this._get("keyup");
}
$dynamic("get$length").SVGElementInstanceList = function() { return this.length; };
$dynamic("get$name").SVGException = function() { return this.name; };
$dynamic("get$value").SVGLength = function() { return this.value; };
$dynamic("set$value").SVGLength = function(value) { return this.value = value; };
$dynamic("clear$0").SVGLengthList = function() {
  return this.clear();
};
$dynamic("get$value").SVGNumber = function() { return this.value; };
$dynamic("set$value").SVGNumber = function(value) { return this.value = value; };
$dynamic("clear$0").SVGNumberList = function() {
  return this.clear();
};
$dynamic("clear$0").SVGPathSegList = function() {
  return this.clear();
};
$dynamic("clear$0").SVGPointList = function() {
  return this.clear();
};
$dynamic("clear$0").SVGStringList = function() {
  return this.clear();
};
$dynamic("get$title").SVGStyleElement = function() {
  return this.title;
}
$dynamic("clear$0").SVGTransformList = function() {
  return this.clear();
};
$dynamic("get$title").ScriptProfile = function() { return this.title; };
$dynamic("get$children").ScriptProfileNode = function() { return this.children; };
$dynamic("get$url").ScriptProfileNode = function() { return this.url; };
$dynamic("get$length").HTMLSelectElement = function() { return this.length; };
$dynamic("get$name").HTMLSelectElement = function() { return this.name; };
$dynamic("get$value").HTMLSelectElement = function() { return this.value; };
$dynamic("set$value").HTMLSelectElement = function(value) { return this.value = value; };
$dynamic("set$innerHTML").ShadowRoot = function(value) { return this.innerHTML = value; };
$dynamic("get$on").SharedWorkerContext = function() {
  return new _SharedWorkerContextEventsImpl(this);
}
$dynamic("get$name").SharedWorkerContext = function() { return this.name; };
$inherits(_SharedWorkerContextEventsImpl, _WorkerContextEventsImpl);
function _SharedWorkerContextEventsImpl(_ptr) {
  _WorkerContextEventsImpl.call(this, _ptr);
}
$dynamic("get$length").SpeechGrammarList = function() { return this.length; };
$dynamic("get$length").SpeechInputResultList = function() { return this.length; };
$dynamic("get$on").SpeechRecognition = function() {
  return new _SpeechRecognitionEventsImpl(this);
}
$dynamic("$dom_addEventListener$3").SpeechRecognition = function($0, $1, $2) {
  return this.addEventListener($0, $wrap_call$1(to$call$1($1)), $2);
};
$dynamic("$dom_removeEventListener$3").SpeechRecognition = function($0, $1, $2) {
  return this.removeEventListener($0, $wrap_call$1(to$call$1($1)), $2);
};
$dynamic("start$0").SpeechRecognition = function() {
  return this.start();
};
$inherits(_SpeechRecognitionEventsImpl, _EventsImpl);
function _SpeechRecognitionEventsImpl(_ptr) {
  _EventsImpl.call(this, _ptr);
}
$dynamic("get$length").SpeechRecognitionResult = function() { return this.length; };
$dynamic("get$length").SpeechRecognitionResultList = function() { return this.length; };
$dynamic("is$Map").Storage = function(){return true};
$dynamic("is$Map_dart_core_String$Dynamic").Storage = function(){return true};
$dynamic("containsKey").Storage = function(key) {
  return this.getItem(key) != null;
}
$dynamic("$index").Storage = function(key) {
  return this.getItem(key);
}
$dynamic("$setindex").Storage = function(key, value) {
  return this.setItem(key, value);
}
$dynamic("remove").Storage = function(key) {
  var value = this.$index(key);
  this.removeItem(key);
  return value;
}
$dynamic("clear$_").Storage = function() {
  return this.clear();
}
$dynamic("forEach").Storage = function(f) {
  for (var i = (0);
   true; i = $add$(i, (1))) {
    var key = this.key(i);
    if ($eq$(key)) return;
    f(key, this.$index(key));
  }
}
$dynamic("getKeys").Storage = function() {
  var keys = [];
  this.forEach((function (k, v) {
    return keys.add$1(k);
  })
  );
  return keys;
}
$dynamic("get$length").Storage = function() {
  return this.get$$$dom_length();
}
$dynamic("get$$$dom_length").Storage = function() {
  return this.length;
}
$dynamic("clear$0").Storage = function() {
  return this.clear$_();
};
$dynamic("forEach$1").Storage = function($0) {
  return this.forEach($wrap_call$2(to$call$2($0)));
};
$dynamic("remove$1").Storage = function($0) {
  return this.remove($0);
};
$dynamic("get$url").StorageEvent = function() { return this.url; };
$dynamic("is$List").StyleSheetList = function(){return true};
$dynamic("is$Collection").StyleSheetList = function(){return true};
$dynamic("get$length").StyleSheetList = function() { return this.length; };
$dynamic("$index").StyleSheetList = function(index) {
  return this[index];
}
$dynamic("$setindex").StyleSheetList = function(index, value) {
  $throw(new UnsupportedOperationException("Cannot assign element of immutable List."));
}
$dynamic("iterator").StyleSheetList = function() {
  return new _FixedSizeListIterator_html_StyleSheet(this);
}
$dynamic("add").StyleSheetList = function(value) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("addAll").StyleSheetList = function(collection) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("forEach").StyleSheetList = function(f) {
  return _Collections.forEach(this, f);
}
$dynamic("filter").StyleSheetList = function(f) {
  return _Collections.filter(this, [], f);
}
$dynamic("some").StyleSheetList = function(f) {
  return _Collections.some(this, f);
}
$dynamic("sort").StyleSheetList = function(compare) {
  $throw(new UnsupportedOperationException("Cannot sort immutable List."));
}
$dynamic("indexOf").StyleSheetList = function(element, start) {
  return _Lists.indexOf(this, element, start, this.length);
}
$dynamic("last").StyleSheetList = function() {
  return this.$index(this.length - (1));
}
$dynamic("removeLast").StyleSheetList = function() {
  $throw(new UnsupportedOperationException("Cannot removeLast on immutable List."));
}
$dynamic("removeRange").StyleSheetList = function(start, rangeLength) {
  $throw(new UnsupportedOperationException("Cannot removeRange on immutable List."));
}
$dynamic("getRange").StyleSheetList = function(start, rangeLength) {
  return _Lists.getRange(this, start, rangeLength, []);
}
$dynamic("add$1").StyleSheetList = function($0) {
  return this.add($0);
};
$dynamic("filter$1").StyleSheetList = function($0) {
  return this.filter($wrap_call$1(to$call$1($0)));
};
$dynamic("forEach$1").StyleSheetList = function($0) {
  return this.forEach($wrap_call$1(to$call$1($0)));
};
$dynamic("indexOf$1").StyleSheetList = function($0) {
  return this.indexOf($0, (0));
};
$dynamic("some$1").StyleSheetList = function($0) {
  return this.some($wrap_call$1(to$call$1($0)));
};
$dynamic("sort$1").StyleSheetList = function($0) {
  return this.sort($wrap_call$2(to$call$2($0)));
};
$dynamic("get$name").HTMLTextAreaElement = function() { return this.name; };
$dynamic("get$value").HTMLTextAreaElement = function() { return this.value; };
$dynamic("set$value").HTMLTextAreaElement = function(value) { return this.value = value; };
$dynamic("get$on").TextTrack = function() {
  return new _TextTrackEventsImpl(this);
}
$dynamic("$dom_addEventListener$3").TextTrack = function($0, $1, $2) {
  return this.addEventListener($0, $wrap_call$1(to$call$1($1)), $2);
};
$dynamic("$dom_removeEventListener$3").TextTrack = function($0, $1, $2) {
  return this.removeEventListener($0, $wrap_call$1(to$call$1($1)), $2);
};
$inherits(_TextTrackEventsImpl, _EventsImpl);
function _TextTrackEventsImpl(_ptr) {
  _EventsImpl.call(this, _ptr);
}
$dynamic("get$on").TextTrackCue = function() {
  return new _TextTrackCueEventsImpl(this);
}
$dynamic("get$text").TextTrackCue = function() { return this.text; };
$dynamic("set$text").TextTrackCue = function(value) { return this.text = value; };
$dynamic("$dom_addEventListener$3").TextTrackCue = function($0, $1, $2) {
  return this.addEventListener($0, $wrap_call$1(to$call$1($1)), $2);
};
$dynamic("$dom_removeEventListener$3").TextTrackCue = function($0, $1, $2) {
  return this.removeEventListener($0, $wrap_call$1(to$call$1($1)), $2);
};
$inherits(_TextTrackCueEventsImpl, _EventsImpl);
function _TextTrackCueEventsImpl(_ptr) {
  _EventsImpl.call(this, _ptr);
}
$dynamic("get$length").TextTrackCueList = function() { return this.length; };
$dynamic("get$on").TextTrackList = function() {
  return new _TextTrackListEventsImpl(this);
}
$dynamic("get$length").TextTrackList = function() { return this.length; };
$dynamic("$dom_addEventListener$3").TextTrackList = function($0, $1, $2) {
  return this.addEventListener($0, $wrap_call$1(to$call$1($1)), $2);
};
$dynamic("$dom_removeEventListener$3").TextTrackList = function($0, $1, $2) {
  return this.removeEventListener($0, $wrap_call$1(to$call$1($1)), $2);
};
$inherits(_TextTrackListEventsImpl, _EventsImpl);
function _TextTrackListEventsImpl(_ptr) {
  _EventsImpl.call(this, _ptr);
}
$dynamic("get$length").TimeRanges = function() { return this.length; };
$dynamic("is$List").TouchList = function(){return true};
$dynamic("is$Collection").TouchList = function(){return true};
$dynamic("get$length").TouchList = function() { return this.length; };
$dynamic("$index").TouchList = function(index) {
  return this[index];
}
$dynamic("$setindex").TouchList = function(index, value) {
  $throw(new UnsupportedOperationException("Cannot assign element of immutable List."));
}
$dynamic("iterator").TouchList = function() {
  return new _FixedSizeListIterator_html_Touch(this);
}
$dynamic("add").TouchList = function(value) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("addAll").TouchList = function(collection) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("forEach").TouchList = function(f) {
  return _Collections.forEach(this, f);
}
$dynamic("filter").TouchList = function(f) {
  return _Collections.filter(this, [], f);
}
$dynamic("some").TouchList = function(f) {
  return _Collections.some(this, f);
}
$dynamic("sort").TouchList = function(compare) {
  $throw(new UnsupportedOperationException("Cannot sort immutable List."));
}
$dynamic("indexOf").TouchList = function(element, start) {
  return _Lists.indexOf(this, element, start, this.length);
}
$dynamic("last").TouchList = function() {
  return this.$index(this.length - (1));
}
$dynamic("removeLast").TouchList = function() {
  $throw(new UnsupportedOperationException("Cannot removeLast on immutable List."));
}
$dynamic("removeRange").TouchList = function(start, rangeLength) {
  $throw(new UnsupportedOperationException("Cannot removeRange on immutable List."));
}
$dynamic("getRange").TouchList = function(start, rangeLength) {
  return _Lists.getRange(this, start, rangeLength, []);
}
$dynamic("add$1").TouchList = function($0) {
  return this.add($0);
};
$dynamic("filter$1").TouchList = function($0) {
  return this.filter($wrap_call$1(to$call$1($0)));
};
$dynamic("forEach$1").TouchList = function($0) {
  return this.forEach($wrap_call$1(to$call$1($0)));
};
$dynamic("indexOf$1").TouchList = function($0) {
  return this.indexOf($0, (0));
};
$dynamic("some$1").TouchList = function($0) {
  return this.some($wrap_call$1(to$call$1($0)));
};
$dynamic("sort$1").TouchList = function($0) {
  return this.sort($wrap_call$2(to$call$2($0)));
};
$dynamic("is$List").Uint16Array = function(){return true};
$dynamic("is$Collection").Uint16Array = function(){return true};
$dynamic("get$length").Uint16Array = function() { return this.length; };
$dynamic("$index").Uint16Array = function(index) {
  return this[index];
}
$dynamic("$setindex").Uint16Array = function(index, value) {
  this[index] = value
}
$dynamic("iterator").Uint16Array = function() {
  return new _FixedSizeListIterator_int(this);
}
$dynamic("add").Uint16Array = function(value) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("addAll").Uint16Array = function(collection) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("forEach").Uint16Array = function(f) {
  return _Collections.forEach(this, f);
}
$dynamic("filter").Uint16Array = function(f) {
  return _Collections.filter(this, [], f);
}
$dynamic("some").Uint16Array = function(f) {
  return _Collections.some(this, f);
}
$dynamic("sort").Uint16Array = function(compare) {
  $throw(new UnsupportedOperationException("Cannot sort immutable List."));
}
$dynamic("indexOf").Uint16Array = function(element, start) {
  return _Lists.indexOf(this, element, start, this.length);
}
$dynamic("last").Uint16Array = function() {
  return this.$index(this.length - (1));
}
$dynamic("removeLast").Uint16Array = function() {
  $throw(new UnsupportedOperationException("Cannot removeLast on immutable List."));
}
$dynamic("removeRange").Uint16Array = function(start, rangeLength) {
  $throw(new UnsupportedOperationException("Cannot removeRange on immutable List."));
}
$dynamic("getRange").Uint16Array = function(start, rangeLength) {
  return _Lists.getRange(this, start, rangeLength, []);
}
$dynamic("add$1").Uint16Array = function($0) {
  return this.add($0);
};
$dynamic("filter$1").Uint16Array = function($0) {
  return this.filter($wrap_call$1(to$call$1($0)));
};
$dynamic("forEach$1").Uint16Array = function($0) {
  return this.forEach($wrap_call$1(to$call$1($0)));
};
$dynamic("indexOf$1").Uint16Array = function($0) {
  return this.indexOf($0, (0));
};
$dynamic("some$1").Uint16Array = function($0) {
  return this.some($wrap_call$1(to$call$1($0)));
};
$dynamic("sort$1").Uint16Array = function($0) {
  return this.sort($wrap_call$2(to$call$2($0)));
};
$dynamic("is$List").Uint32Array = function(){return true};
$dynamic("is$Collection").Uint32Array = function(){return true};
$dynamic("get$length").Uint32Array = function() { return this.length; };
$dynamic("$index").Uint32Array = function(index) {
  return this[index];
}
$dynamic("$setindex").Uint32Array = function(index, value) {
  this[index] = value
}
$dynamic("iterator").Uint32Array = function() {
  return new _FixedSizeListIterator_int(this);
}
$dynamic("add").Uint32Array = function(value) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("addAll").Uint32Array = function(collection) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("forEach").Uint32Array = function(f) {
  return _Collections.forEach(this, f);
}
$dynamic("filter").Uint32Array = function(f) {
  return _Collections.filter(this, [], f);
}
$dynamic("some").Uint32Array = function(f) {
  return _Collections.some(this, f);
}
$dynamic("sort").Uint32Array = function(compare) {
  $throw(new UnsupportedOperationException("Cannot sort immutable List."));
}
$dynamic("indexOf").Uint32Array = function(element, start) {
  return _Lists.indexOf(this, element, start, this.length);
}
$dynamic("last").Uint32Array = function() {
  return this.$index(this.length - (1));
}
$dynamic("removeLast").Uint32Array = function() {
  $throw(new UnsupportedOperationException("Cannot removeLast on immutable List."));
}
$dynamic("removeRange").Uint32Array = function(start, rangeLength) {
  $throw(new UnsupportedOperationException("Cannot removeRange on immutable List."));
}
$dynamic("getRange").Uint32Array = function(start, rangeLength) {
  return _Lists.getRange(this, start, rangeLength, []);
}
$dynamic("add$1").Uint32Array = function($0) {
  return this.add($0);
};
$dynamic("filter$1").Uint32Array = function($0) {
  return this.filter($wrap_call$1(to$call$1($0)));
};
$dynamic("forEach$1").Uint32Array = function($0) {
  return this.forEach($wrap_call$1(to$call$1($0)));
};
$dynamic("indexOf$1").Uint32Array = function($0) {
  return this.indexOf($0, (0));
};
$dynamic("some$1").Uint32Array = function($0) {
  return this.some($wrap_call$1(to$call$1($0)));
};
$dynamic("sort$1").Uint32Array = function($0) {
  return this.sort($wrap_call$2(to$call$2($0)));
};
$dynamic("is$List").Uint8Array = function(){return true};
$dynamic("is$Collection").Uint8Array = function(){return true};
$dynamic("get$length").Uint8Array = function() { return this.length; };
$dynamic("$index").Uint8Array = function(index) {
  return this[index];
}
$dynamic("$setindex").Uint8Array = function(index, value) {
  this[index] = value
}
$dynamic("iterator").Uint8Array = function() {
  return new _FixedSizeListIterator_int(this);
}
$dynamic("add").Uint8Array = function(value) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("addAll").Uint8Array = function(collection) {
  $throw(new UnsupportedOperationException("Cannot add to immutable List."));
}
$dynamic("forEach").Uint8Array = function(f) {
  return _Collections.forEach(this, f);
}
$dynamic("filter").Uint8Array = function(f) {
  return _Collections.filter(this, [], f);
}
$dynamic("some").Uint8Array = function(f) {
  return _Collections.some(this, f);
}
$dynamic("sort").Uint8Array = function(compare) {
  $throw(new UnsupportedOperationException("Cannot sort immutable List."));
}
$dynamic("indexOf").Uint8Array = function(element, start) {
  return _Lists.indexOf(this, element, start, this.length);
}
$dynamic("last").Uint8Array = function() {
  return this.$index(this.length - (1));
}
$dynamic("removeLast").Uint8Array = function() {
  $throw(new UnsupportedOperationException("Cannot removeLast on immutable List."));
}
$dynamic("removeRange").Uint8Array = function(start, rangeLength) {
  $throw(new UnsupportedOperationException("Cannot removeRange on immutable List."));
}
$dynamic("getRange").Uint8Array = function(start, rangeLength) {
  return _Lists.getRange(this, start, rangeLength, []);
}
$dynamic("add$1").Uint8Array = function($0) {
  return this.add($0);
};
$dynamic("filter$1").Uint8Array = function($0) {
  return this.filter($wrap_call$1(to$call$1($0)));
};
$dynamic("forEach$1").Uint8Array = function($0) {
  return this.forEach($wrap_call$1(to$call$1($0)));
};
$dynamic("indexOf$1").Uint8Array = function($0) {
  return this.indexOf($0, (0));
};
$dynamic("some$1").Uint8Array = function($0) {
  return this.some($wrap_call$1(to$call$1($0)));
};
$dynamic("sort$1").Uint8Array = function($0) {
  return this.sort($wrap_call$2(to$call$2($0)));
};
$dynamic("get$name").WebGLActiveInfo = function() { return this.name; };
$dynamic("get$on").WebSocket = function() {
  return new _WebSocketEventsImpl(this);
}
$dynamic("get$url").WebSocket = function() { return this.url; };
$dynamic("$dom_addEventListener$3").WebSocket = function($0, $1, $2) {
  return this.addEventListener($0, $wrap_call$1(to$call$1($1)), $2);
};
$dynamic("$dom_removeEventListener$3").WebSocket = function($0, $1, $2) {
  return this.removeEventListener($0, $wrap_call$1(to$call$1($1)), $2);
};
$dynamic("close$2").WebSocket = function($0, $1) {
  return this.close($0, $1);
};
$inherits(_WebSocketEventsImpl, _EventsImpl);
function _WebSocketEventsImpl(_ptr) {
  _EventsImpl.call(this, _ptr);
}
$dynamic("get$on").DOMWindow = function() {
  return new _WindowEventsImpl(this);
}
$dynamic("get$length").DOMWindow = function() { return this.length; };
$dynamic("get$name").DOMWindow = function() { return this.name; };
$dynamic("get$parent").DOMWindow = function() { return this.parent; };
$dynamic("$dom_addEventListener$3").DOMWindow = function($0, $1, $2) {
  return this.addEventListener($0, $wrap_call$1(to$call$1($1)), $2);
};
$dynamic("$dom_removeEventListener$3").DOMWindow = function($0, $1, $2) {
  return this.removeEventListener($0, $wrap_call$1(to$call$1($1)), $2);
};
$inherits(_WindowEventsImpl, _EventsImpl);
function _WindowEventsImpl(_ptr) {
  _EventsImpl.call(this, _ptr);
}
_WindowEventsImpl.prototype.get$change = function() {
  return this._get("change");
}
_WindowEventsImpl.prototype.get$click = function() {
  return this._get("click");
}
_WindowEventsImpl.prototype.get$keyUp = function() {
  return this._get("keyup");
}
_WindowEventsImpl.prototype.get$message = function() {
  return this._get("message");
}
_WindowEventsImpl.prototype.get$resize = function() {
  return this._get("resize");
}
$dynamic("get$on").Worker = function() {
  return new _WorkerEventsImpl(this);
}
$inherits(_WorkerEventsImpl, _AbstractWorkerEventsImpl);
function _WorkerEventsImpl(_ptr) {
  _AbstractWorkerEventsImpl.call(this, _ptr);
}
$dynamic("get$on").XMLHttpRequest = function() {
  return new _XMLHttpRequestEventsImpl(this);
}
$dynamic("$dom_addEventListener$3").XMLHttpRequest = function($0, $1, $2) {
  return this.addEventListener($0, $wrap_call$1(to$call$1($1)), $2);
};
$dynamic("$dom_removeEventListener$3").XMLHttpRequest = function($0, $1, $2) {
  return this.removeEventListener($0, $wrap_call$1(to$call$1($1)), $2);
};
$inherits(_XMLHttpRequestEventsImpl, _EventsImpl);
function _XMLHttpRequestEventsImpl(_ptr) {
  _EventsImpl.call(this, _ptr);
}
$dynamic("get$name").XMLHttpRequestException = function() { return this.name; };
$dynamic("get$on").XMLHttpRequestUpload = function() {
  return new _XMLHttpRequestUploadEventsImpl(this);
}
$dynamic("$dom_addEventListener$3").XMLHttpRequestUpload = function($0, $1, $2) {
  return this.addEventListener($0, $wrap_call$1(to$call$1($1)), $2);
};
$dynamic("$dom_removeEventListener$3").XMLHttpRequestUpload = function($0, $1, $2) {
  return this.removeEventListener($0, $wrap_call$1(to$call$1($1)), $2);
};
$inherits(_XMLHttpRequestUploadEventsImpl, _EventsImpl);
function _XMLHttpRequestUploadEventsImpl(_ptr) {
  _EventsImpl.call(this, _ptr);
}
$dynamic("get$name").XPathException = function() { return this.name; };
function _AudioElementFactoryProvider() {}
function _BlobBuilderFactoryProvider() {}
function _CSSMatrixFactoryProvider() {}
function _DOMParserFactoryProvider() {}
function _DOMURLFactoryProvider() {}
function _DeprecatedPeerConnectionFactoryProvider() {}
function _EventSourceFactoryProvider() {}
function _FileReaderFactoryProvider() {}
function _FileReaderSyncFactoryProvider() {}
function _IceCandidateFactoryProvider() {}
function _MediaControllerFactoryProvider() {}
function _MediaStreamFactoryProvider() {}
function _MessageChannelFactoryProvider() {}
function _NotificationFactoryProvider() {}
function _OptionElementFactoryProvider() {}
function _PeerConnection00FactoryProvider() {}
function _SessionDescriptionFactoryProvider() {}
function _ShadowRootFactoryProvider() {}
function _SharedWorkerFactoryProvider() {}
function _SpeechGrammarFactoryProvider() {}
function _SpeechGrammarListFactoryProvider() {}
function _SpeechRecognitionFactoryProvider() {}
function _TextTrackCueFactoryProvider() {}
function _WorkerFactoryProvider() {}
function _XMLHttpRequestFactoryProvider() {}
function _XMLSerializerFactoryProvider() {}
function _XPathEvaluatorFactoryProvider() {}
function _XSLTProcessorFactoryProvider() {}
function _Collections() {}
_Collections.forEach = function(iterable, f) {
  for (var $$i = iterable.iterator(); $$i.hasNext(); ) {
    var e = $$i.next();
    f(e);
  }
}
_Collections.some = function(iterable, f) {
  for (var $$i = iterable.iterator(); $$i.hasNext(); ) {
    var e = $$i.next();
    if (f(e)) return true;
  }
  return false;
}
_Collections.filter = function(source, destination, f) {
  for (var $$i = source.iterator(); $$i.hasNext(); ) {
    var e = $$i.next();
    if (f(e)) destination.add(e);
  }
  return destination;
}
function _XMLHttpRequestUtils() {}
function _MeasurementRequest(computeValue, completer) {
  this.exception = false;
  this.computeValue = computeValue;
  this.completer = completer;
}
_MeasurementRequest.prototype.get$value = function() { return this.value; };
_MeasurementRequest.prototype.set$value = function(value) { return this.value = value; };
function _EventFactoryProvider() {}
function _MouseEventFactoryProvider() {}
function _CSSStyleDeclarationFactoryProvider() {}
function _DocumentFragmentFactoryProvider() {}
function _SVGElementFactoryProvider() {}
function _SVGSVGElementFactoryProvider() {}
function _AudioContextFactoryProvider() {}
function _PointFactoryProvider() {}
function _WebSocketFactoryProvider() {}
function _TextFactoryProvider() {}
function _TypedArrayFactoryProvider() {}
function Testing() {}
function _Device() {}
_Device.get$userAgent = function() {
  return get$$window().navigator.userAgent;
}
_Device.get$isFirefox = function() {
  return _Device.get$userAgent().contains("Firefox", (0));
}
function _VariableSizeListIterator() {}
_VariableSizeListIterator.prototype.hasNext = function() {
  return this._html_array.get$length() > this._html_pos;
}
_VariableSizeListIterator.prototype.next = function() {
  if (!this.hasNext()) {
    $throw(const$0001);
  }
  return this._html_array.$index(this._html_pos++);
}
$inherits(_FixedSizeListIterator, _VariableSizeListIterator);
function _FixedSizeListIterator() {}
_FixedSizeListIterator.prototype.hasNext = function() {
  return this._html_length > this._html_pos;
}
$inherits(_VariableSizeListIterator_dart_core_String, _VariableSizeListIterator);
function _VariableSizeListIterator_dart_core_String(array) {
  this._html_array = array;
  this._html_pos = (0);
}
$inherits(_FixedSizeListIterator_dart_core_String, _FixedSizeListIterator);
function _FixedSizeListIterator_dart_core_String(array) {
  this._html_length = array.get$length();
  _VariableSizeListIterator_dart_core_String.call(this, array);
}
$inherits(_VariableSizeListIterator_int, _VariableSizeListIterator);
function _VariableSizeListIterator_int(array) {
  this._html_array = array;
  this._html_pos = (0);
}
$inherits(_FixedSizeListIterator_int, _FixedSizeListIterator);
function _FixedSizeListIterator_int(array) {
  this._html_length = array.get$length();
  _VariableSizeListIterator_int.call(this, array);
}
$inherits(_VariableSizeListIterator_num, _VariableSizeListIterator);
function _VariableSizeListIterator_num(array) {
  this._html_array = array;
  this._html_pos = (0);
}
$inherits(_FixedSizeListIterator_num, _FixedSizeListIterator);
function _FixedSizeListIterator_num(array) {
  this._html_length = array.get$length();
  _VariableSizeListIterator_num.call(this, array);
}
$inherits(_VariableSizeListIterator_html_Node, _VariableSizeListIterator);
function _VariableSizeListIterator_html_Node(array) {
  this._html_array = array;
  this._html_pos = (0);
}
$inherits(_FixedSizeListIterator_html_Node, _FixedSizeListIterator);
function _FixedSizeListIterator_html_Node(array) {
  this._html_length = array.get$length();
  _VariableSizeListIterator_html_Node.call(this, array);
}
$inherits(_VariableSizeListIterator_html_StyleSheet, _VariableSizeListIterator);
function _VariableSizeListIterator_html_StyleSheet(array) {
  this._html_array = array;
  this._html_pos = (0);
}
$inherits(_FixedSizeListIterator_html_StyleSheet, _FixedSizeListIterator);
function _FixedSizeListIterator_html_StyleSheet(array) {
  this._html_length = array.get$length();
  _VariableSizeListIterator_html_StyleSheet.call(this, array);
}
$inherits(_VariableSizeListIterator_html_Touch, _VariableSizeListIterator);
function _VariableSizeListIterator_html_Touch(array) {
  this._html_array = array;
  this._html_pos = (0);
}
$inherits(_FixedSizeListIterator_html_Touch, _FixedSizeListIterator);
function _FixedSizeListIterator_html_Touch(array) {
  this._html_length = array.get$length();
  _VariableSizeListIterator_html_Touch.call(this, array);
}
function _Lists() {}
_Lists.indexOf = function(a, element, startIndex, endIndex) {
  if (startIndex >= a.get$length()) {
    return (-1);
  }
  if (startIndex < (0)) {
    startIndex = (0);
  }
  for (var i = startIndex;
   i < endIndex; i++) {
    if ($eq$(a.$index(i), element)) {
      return i;
    }
  }
  return (-1);
}
_Lists.getRange = function(a, start, length, accumulator) {
  if (length < (0)) $throw(new IllegalArgumentException("length"));
  if (start < (0)) $throw(new IndexOutOfRangeException(start));
  var end = start + length;
  if (end > a.get$length()) $throw(new IndexOutOfRangeException(end));
  for (var i = start;
   i < end; i++) {
    accumulator.add(a.$index(i));
  }
  return accumulator;
}
function get$$window() {
  return window;
}
function get$$document() {
  return document;
}
var _cachedBrowserPrefix;
function get$$_browserPrefix() {
  if (null == $globals._cachedBrowserPrefix) {
    if (_Device.get$isFirefox()) {
      $globals._cachedBrowserPrefix = "-moz-";
    }
    else {
      $globals._cachedBrowserPrefix = "-webkit-";
    }
  }
  return $globals._cachedBrowserPrefix;
}
var _pendingRequests;
var _pendingMeasurementFrameCallbacks;
function _maybeScheduleMeasurementFrame() {
  if ($globals._nextMeasurementFrameScheduled) return;
  $globals._nextMeasurementFrameScheduled = true;
  if ($globals._firstMeasurementRequest) {
    get$$window().get$on().get$message().add((function (e) {
      return _completeMeasurementFutures();
    })
    , false);
    $globals._firstMeasurementRequest = false;
  }
  get$$window().postMessage("DART-MEASURE", "*");
}
function _createMeasurementFuture(computeValue, completer) {
  if (null == $globals._pendingRequests) {
    $globals._pendingRequests = [];
    _maybeScheduleMeasurementFrame();
  }
  $globals._pendingRequests.add(new _MeasurementRequest(computeValue, completer));
  return completer.get$future();
}
function _completeMeasurementFutures() {
  if ($eq$($globals._nextMeasurementFrameScheduled, false)) {
    return;
  }
  $globals._nextMeasurementFrameScheduled = false;
  if (null != $globals._pendingRequests) {
    var $$list = $globals._pendingRequests;
    for (var $$i = $$list.iterator(); $$i.hasNext(); ) {
      var request = $$i.next();
      try {
        request.value = request.computeValue();
      } catch (e) {
        e = _toDartException(e);
        request.value = e;
        request.exception = true;
      }
    }
  }
  var completedRequests = $globals._pendingRequests;
  var readyMeasurementFrameCallbacks = $globals._pendingMeasurementFrameCallbacks;
  $globals._pendingRequests = null;
  $globals._pendingMeasurementFrameCallbacks = null;
  if (null != completedRequests) {
    for (var $$i = completedRequests.iterator(); $$i.hasNext(); ) {
      var request = $$i.next();
      if (request.exception) {
        request.completer.completeException(request.value);
      }
      else {
        request.completer.complete(request.value);
      }
    }
  }
  if (null != readyMeasurementFrameCallbacks) {
    for (var $$i = readyMeasurementFrameCallbacks.iterator(); $$i.hasNext(); ) {
      var handler = $$i.next();
      handler();
    }
  }
}
function markdown_Document() {
  this.refLinks = new HashMapImplementation();
}
markdown_Document.prototype.parseRefLinks = function(lines) {
  var indent = "^[ ]{0,3}";
  var id = "\\[([^\\]]+)\\]";
  var quote = "\"[^\"]+\"";
  var apos = "'[^']+'";
  var paren = "\\([^)]+\\)";
  var pattern = new JSSyntaxRegExp(("" + indent + id + ":\\s+(\\S+)\\s*(" + quote + "|" + apos + "|" + paren + "|)\\s*$"));
  for (var i = (0);
   i < lines.get$length(); i++) {
    var match = pattern.firstMatch(lines.$index(i));
    if ($ne$(match)) {
      var id0 = match.$index((1));
      var url = match.$index((2));
      var title = match.$index((3));
      if ($eq$(title, "")) {
        title = null;
      }
      else {
        title = title.substring((1), title.get$length() - (1));
      }
      id0 = id0.toLowerCase();
      this.refLinks.$setindex(id0, new Link(id0, url, title));
      lines.$setindex(i, "");
    }
  }
}
markdown_Document.prototype.parseLines = function(lines) {
  var parser = new BlockParser(lines, this);
  var blocks = [];
  while (!parser.get$isDone()) {
    var $$list = BlockSyntax.get$syntaxes();
    for (var $$i = $$list.iterator(); $$i.hasNext(); ) {
      var syntax = $$i.next();
      if (syntax.canParse(parser)) {
        var block = syntax.parse$1(parser);
        if ($ne$(block)) blocks.add$1(block);
        break;
      }
    }
  }
  return blocks;
}
markdown_Document.prototype.parseInline = function(text) {
  return new InlineParser(text, this).parse();
}
function Link(id, url, title) {
  this.id = id;
  this.url = url;
  this.title = title;
}
Link.prototype.get$url = function() { return this.url; };
Link.prototype.get$title = function() { return this.title; };
function markdown_Element(tag, children) {
  this.tag = tag;
  this.children = children;
  this.attributes = new HashMapImplementation();
}
markdown_Element.empty$ctor = function(tag) {
  this.tag = tag;
  this.children = null;
  this.attributes = new HashMapImplementation();
}
markdown_Element.empty$ctor.prototype = markdown_Element.prototype;
markdown_Element.text$ctor = function(tag, text) {
  this.tag = tag;
  this.children = [new markdown_Text(text)];
  this.attributes = new HashMapImplementation();
}
markdown_Element.text$ctor.prototype = markdown_Element.prototype;
markdown_Element.prototype.get$children = function() { return this.children; };
markdown_Element.prototype.get$attributes = function() { return this.attributes; };
markdown_Element.prototype.get$isEmpty = function() {
  return this.children == null;
}
markdown_Element.prototype.accept = function(visitor) {
  if (visitor.visitElementBefore(this)) {
    var $$list = this.children;
    for (var $$i = $$list.iterator(); $$i.hasNext(); ) {
      var child = $$i.next();
      child.accept$1(visitor);
    }
    visitor.visitElementAfter(this);
  }
}
markdown_Element.prototype.accept$1 = markdown_Element.prototype.accept;
function markdown_Text(text) {
  this.text = text;
}
markdown_Text.prototype.get$text = function() { return this.text; };
markdown_Text.prototype.accept = function(visitor) {
  return visitor.visitText(this);
}
markdown_Text.prototype.accept$1 = markdown_Text.prototype.accept;
function BlockParser(lines, document) {
  this.lines = lines;
  this.document = document;
  this.pos = (0);
}
BlockParser.prototype.get$lines = function() { return this.lines; };
BlockParser.prototype.get$current = function() {
  return this.lines.$index(this.pos);
}
BlockParser.prototype.get$next = function() {
  if (this.pos >= this.lines.get$length() - (1)) return null;
  return this.lines.$index(this.pos + (1));
}
BlockParser.prototype.advance = function() {
  this.pos++;
}
BlockParser.prototype.get$isDone = function() {
  return this.pos >= this.lines.get$length();
}
BlockParser.prototype.matches = function(regex) {
  if (this.get$isDone()) return false;
  return regex.firstMatch(this.get$current()) != null;
}
BlockParser.prototype.matchesNext = function(regex) {
  if (this.get$next() == null) return false;
  return regex.firstMatch(this.get$next()) != null;
}
function BlockSyntax() {

}
BlockSyntax.get$syntaxes = function() {
  if ($globals.BlockSyntax__syntaxes == null) {
    $globals.BlockSyntax__syntaxes = [new EmptyBlockSyntax(), new BlockHtmlSyntax(), new SetextHeaderSyntax(), new HeaderSyntax(), new CodeBlockSyntax(), new BlockquoteSyntax(), new HorizontalRuleSyntax(), new UnorderedListSyntax(), new OrderedListSyntax(), new ParagraphSyntax()];
  }
  return $globals.BlockSyntax__syntaxes;
}
BlockSyntax.prototype.get$pattern = function() {
  return null;
}
BlockSyntax.prototype.get$canEndBlock = function() {
  return true;
}
BlockSyntax.prototype.canParse = function(parser) {
  return this.get$pattern().firstMatch(parser.get$current()) != null;
}
BlockSyntax.prototype.parseChildLines = function(parser) {
  var childLines = [];
  while (!parser.get$isDone()) {
    var match = this.get$pattern().firstMatch(parser.get$current());
    if ($eq$(match)) break;
    childLines.add$1(match.$index((1)));
    parser.advance();
  }
  return childLines;
}
BlockSyntax.isAtBlockEnd = function(parser) {
  if (parser.get$isDone()) return true;
  return BlockSyntax.get$syntaxes().some$1((function (s) {
    return s.canParse(parser) && s.get$canEndBlock();
  })
  );
}
BlockSyntax.prototype.parse$1 = BlockSyntax.prototype.parse;
$inherits(EmptyBlockSyntax, BlockSyntax);
function EmptyBlockSyntax() {
  BlockSyntax.call(this);
}
EmptyBlockSyntax.prototype.get$pattern = function() {
  return const$0012;
}
EmptyBlockSyntax.prototype.parse = function(parser) {
  parser.advance();
  return null;
}
EmptyBlockSyntax.prototype.parse$1 = EmptyBlockSyntax.prototype.parse;
$inherits(SetextHeaderSyntax, BlockSyntax);
function SetextHeaderSyntax() {
  BlockSyntax.call(this);
}
SetextHeaderSyntax.prototype.canParse = function(parser) {
  return parser.matchesNext(const$0013);
}
SetextHeaderSyntax.prototype.parse = function(parser) {
  var match = const$0013.firstMatch(parser.get$next());
  var tag = ($eq$(match.$index((1)).$index((0)), "=")) ? "h1" : "h2";
  var contents = parser.document.parseInline(parser.get$current());
  parser.advance();
  parser.advance();
  return new markdown_Element(tag, contents);
}
SetextHeaderSyntax.prototype.parse$1 = SetextHeaderSyntax.prototype.parse;
$inherits(HeaderSyntax, BlockSyntax);
function HeaderSyntax() {
  BlockSyntax.call(this);
}
HeaderSyntax.prototype.get$pattern = function() {
  return const$0009;
}
HeaderSyntax.prototype.parse = function(parser) {
  var match = this.get$pattern().firstMatch(parser.get$current());
  parser.advance();
  var level = match.$index((1)).get$length();
  var contents = parser.document.parseInline(match.$index((2)).trim());
  return new markdown_Element(("h" + level), contents);
}
HeaderSyntax.prototype.parse$1 = HeaderSyntax.prototype.parse;
$inherits(BlockquoteSyntax, BlockSyntax);
function BlockquoteSyntax() {
  BlockSyntax.call(this);
}
BlockquoteSyntax.prototype.get$pattern = function() {
  return const$0005;
}
BlockquoteSyntax.prototype.parse = function(parser) {
  var childLines = this.parseChildLines(parser);
  var children = parser.document.parseLines(childLines);
  return new markdown_Element("blockquote", children);
}
BlockquoteSyntax.prototype.parse$1 = BlockquoteSyntax.prototype.parse;
$inherits(CodeBlockSyntax, BlockSyntax);
function CodeBlockSyntax() {
  BlockSyntax.call(this);
}
CodeBlockSyntax.prototype.get$pattern = function() {
  return const$0007;
}
CodeBlockSyntax.prototype.parse = function(parser) {
  var childLines = this.parseChildLines(parser);
  childLines.add$1("");
  var escaped = escapeHtml(Strings.join(childLines, "\n"));
  return new markdown_Element("pre", [new markdown_Element.text$ctor("code", escaped)]);
}
CodeBlockSyntax.prototype.parse$1 = CodeBlockSyntax.prototype.parse;
$inherits(HorizontalRuleSyntax, BlockSyntax);
function HorizontalRuleSyntax() {
  BlockSyntax.call(this);
}
HorizontalRuleSyntax.prototype.get$pattern = function() {
  return const$0011;
}
HorizontalRuleSyntax.prototype.parse = function(parser) {
  var match = this.get$pattern().firstMatch(parser.get$current());
  parser.advance();
  return new markdown_Element.empty$ctor("hr");
}
HorizontalRuleSyntax.prototype.parse$1 = HorizontalRuleSyntax.prototype.parse;
$inherits(BlockHtmlSyntax, BlockSyntax);
function BlockHtmlSyntax() {
  BlockSyntax.call(this);
}
BlockHtmlSyntax.prototype.get$pattern = function() {
  return const$0010;
}
BlockHtmlSyntax.prototype.get$canEndBlock = function() {
  return false;
}
BlockHtmlSyntax.prototype.parse = function(parser) {
  var childLines = [];
  while (!parser.get$isDone() && !parser.matches(const$0012)) {
    childLines.add$1(parser.get$current());
    parser.advance();
  }
  return new markdown_Text(Strings.join(childLines, "\n"));
}
BlockHtmlSyntax.prototype.parse$1 = BlockHtmlSyntax.prototype.parse;
function ListItem(lines) {
  this.forceBlock = false;
  this.lines = lines;
}
ListItem.prototype.get$forceBlock = function() { return this.forceBlock; };
ListItem.prototype.set$forceBlock = function(value) { return this.forceBlock = value; };
ListItem.prototype.get$lines = function() { return this.lines; };
$inherits(ListSyntax, BlockSyntax);
function ListSyntax() {
  BlockSyntax.call(this);
}
ListSyntax.prototype.get$canEndBlock = function() {
  return false;
}
ListSyntax.prototype.parse = function(parser) {
  var items = [];
  var childLines = [];
  function endItem() {
    if (childLines.get$length() > (0)) {
      items.add$1(new ListItem(childLines));
      childLines = [];
    }
  }
  var match;
  function tryMatch(pattern) {
    match = pattern.firstMatch(parser.get$current());
    return $ne$(match);
  }
  var afterEmpty = false;
  while (!parser.get$isDone()) {
    if (tryMatch(const$0012)) {
      childLines.add$1("");
    }
    else if (tryMatch(const$0006) || tryMatch(const$0008)) {
      endItem();
      childLines.add$1(match.$index((1)));
    }
    else if (tryMatch(const$0007)) {
      childLines.add$1(match.$index((1)));
    }
    else if (BlockSyntax.isAtBlockEnd(parser)) {
      break;
    }
    else {
      if ((childLines.get$length() > (0)) && ($eq$(childLines.last(), ""))) break;
      childLines.add$1(parser.get$current());
    }
    parser.advance();
  }
  endItem();
  for (var i = (0);
   i < items.get$length(); i++) {
    for (var j = items.$index(i).get$lines().get$length() - (1);
     j > (0); j--) {
      if (const$0012.firstMatch(items.$index(i).get$lines().$index(j)) != null) {
        if (i < items.get$length() - (1)) {
          items.$index(i).set$forceBlock(true);
          items.$index(i + (1)).set$forceBlock(true);
        }
        items.$index(i).get$lines().removeLast();
      }
      else {
        break;
      }
    }
  }
  var itemNodes = [];
  for (var $$i = items.iterator(); $$i.hasNext(); ) {
    var item = $$i.next();
    var blockItem = item.get$forceBlock() || (item.get$lines().get$length() > (1));
    var blocksInList = const$0017;
    if (!blockItem) {
      for (var $i0 = blocksInList.iterator(); $i0.hasNext(); ) {
        var pattern = $i0.next();
        if (pattern.firstMatch(item.get$lines().$index((0))) != null) {
          blockItem = true;
          break;
        }
      }
    }
    if (blockItem) {
      var children = parser.document.parseLines(item.get$lines());
      itemNodes.add$1(new markdown_Element("li", children));
    }
    else {
      var contents = parser.document.parseInline(item.get$lines().$index((0)));
      itemNodes.add$1(new markdown_Element("li", contents));
    }
  }
  return new markdown_Element(this.get$listTag(), itemNodes);
}
ListSyntax.prototype.parse$1 = ListSyntax.prototype.parse;
$inherits(UnorderedListSyntax, ListSyntax);
function UnorderedListSyntax() {
  ListSyntax.call(this);
}
UnorderedListSyntax.prototype.get$pattern = function() {
  return const$0006;
}
UnorderedListSyntax.prototype.get$listTag = function() {
  return "ul";
}
$inherits(OrderedListSyntax, ListSyntax);
function OrderedListSyntax() {
  ListSyntax.call(this);
}
OrderedListSyntax.prototype.get$pattern = function() {
  return const$0008;
}
OrderedListSyntax.prototype.get$listTag = function() {
  return "ol";
}
$inherits(ParagraphSyntax, BlockSyntax);
function ParagraphSyntax() {
  BlockSyntax.call(this);
}
ParagraphSyntax.prototype.get$canEndBlock = function() {
  return false;
}
ParagraphSyntax.prototype.canParse = function(parser) {
  return true;
}
ParagraphSyntax.prototype.parse = function(parser) {
  var childLines = [];
  while (!BlockSyntax.isAtBlockEnd(parser)) {
    childLines.add$1(parser.get$current());
    parser.advance();
  }
  var contents = parser.document.parseInline(Strings.join(childLines, "\n"));
  return new markdown_Element("p", contents);
}
ParagraphSyntax.prototype.parse$1 = ParagraphSyntax.prototype.parse;
function HtmlRenderer() {

}
HtmlRenderer.prototype.render = function(nodes) {
  this.buffer = new StringBufferImpl("");
  for (var $$i = nodes.iterator(); $$i.hasNext(); ) {
    var node = $$i.next();
    node.accept$1(this);
  }
  return this.buffer.toString();
}
HtmlRenderer.prototype.visitText = function(text) {
  this.buffer.add(text.text);
}
HtmlRenderer.prototype.visitElementBefore = function(element) {
  if (!this.buffer.isEmpty() && const$0018.firstMatch(element.tag) != null) {
    this.buffer.add("\n");
  }
  this.buffer.add(("<" + element.tag));
  var attributeNames = element.attributes.getKeys();
  attributeNames.sort$1((function (a, b) {
    return a.compareTo(b);
  })
  );
  for (var $$i = attributeNames.iterator(); $$i.hasNext(); ) {
    var name = $$i.next();
    this.buffer.add((" " + name + "=\"" + element.attributes.$index(name) + "\""));
  }
  if (element.get$isEmpty()) {
    this.buffer.add(" />");
    return false;
  }
  else {
    this.buffer.add(">");
    return true;
  }
}
HtmlRenderer.prototype.visitElementAfter = function(element) {
  this.buffer.add(("</" + element.tag + ">"));
}
function InlineParser(source, document) {
  this.pos = (0);
  this.start = (0);
  this.source = source;
  this.document = document;
  this._stack = [];
}
InlineParser.get$syntaxes = function() {
  if ($globals.InlineParser__syntaxes == null) {
    $globals.InlineParser__syntaxes = [new AutolinkSyntax(), new LinkSyntax(), new TextSyntax(" \\* "), new TextSyntax(" _ "), new TextSyntax("&[#a-zA-Z0-9]*;"), new TextSyntax("&", "&amp;"), new TextSyntax("<", "&lt;"), new TagSyntax("\\*\\*", "strong"), new TagSyntax("__", "strong"), new TagSyntax("\\*", "em"), new TagSyntax("_", "em"), new CodeSyntax("``\\s?((?:.|\\n)*?)\\s?``"), new CodeSyntax("`([^`]*)`")];
  }
  return $globals.InlineParser__syntaxes;
}
InlineParser.prototype.parse = function() {
  this._stack.add(new TagState((0), (0), null));
  while (!this.get$isDone()) {
    var matched = false;
    for (var i = this._stack.get$length() - (1);
     i > (0); i--) {
      if (this._stack.$index(i).tryMatch(this)) {
        matched = true;
        break;
      }
    }
    if (matched) continue;
    var $$list = InlineParser.get$syntaxes();
    for (var $$i = $$list.iterator(); $$i.hasNext(); ) {
      var syntax = $$i.next();
      if (syntax.tryMatch(this)) {
        matched = true;
        break;
      }
    }
    if (matched) continue;
    this.advanceBy((1));
  }
  return this._stack.$index((0)).close$2(this);
}
InlineParser.prototype.writeText = function() {
  this.writeTextRange(this.start, this.pos);
  this.start = this.pos;
}
InlineParser.prototype.writeTextRange = function(start, end) {
  if (end > start) {
    var text = this.source.substring(start, end);
    var nodes = this._stack.last().get$children();
    if ((nodes.get$length() > (0)) && ((nodes.last() instanceof markdown_Text))) {
      var newNode = new markdown_Text(("" + nodes.last().get$text() + text));
      nodes.$setindex(nodes.get$length() - (1), newNode);
    }
    else {
      nodes.add$1(new markdown_Text(text));
    }
  }
}
InlineParser.prototype.addNode = function(node) {
  this._stack.last().get$children().add$1(node);
}
InlineParser.prototype.get$currentSource = function() {
  return this.source.substring(this.pos, this.source.length);
}
InlineParser.prototype.get$isDone = function() {
  return this.pos == this.source.length;
}
InlineParser.prototype.advanceBy = function(length) {
  this.pos = this.pos + length;
}
InlineParser.prototype.consume = function(length) {
  this.pos = this.pos + length;
  this.start = this.pos;
}
function InlineSyntax(pattern) {
  this.pattern = new JSSyntaxRegExp(pattern, true);
}
InlineSyntax.prototype.tryMatch = function(parser) {
  var startMatch = this.pattern.firstMatch(parser.get$currentSource());
  if (($ne$(startMatch)) && ($eq$(startMatch.start$0(), (0)))) {
    parser.writeText();
    if (this.onMatch(parser, startMatch)) {
      parser.consume(startMatch.$index((0)).get$length());
    }
    return true;
  }
  return false;
}
$inherits(TextSyntax, InlineSyntax);
function TextSyntax(pattern, sub) {
  this.substitute = sub;
  InlineSyntax.call(this, pattern);
}
TextSyntax.prototype.onMatch = function(parser, match) {
  if (this.substitute == null) {
    parser.advanceBy(match.$index((0)).length);
    return false;
  }
  parser.addNode(new markdown_Text(this.substitute));
  return true;
}
$inherits(AutolinkSyntax, InlineSyntax);
function AutolinkSyntax() {
  InlineSyntax.call(this, "<((http|https|ftp)://[^>]*)>");
}
AutolinkSyntax.prototype.onMatch = function(parser, match) {
  var url = match.$index((1));
  var anchor = new markdown_Element.text$ctor("a", escapeHtml(url));
  anchor.get$attributes().$setindex("href", url);
  parser.addNode(anchor);
  return true;
}
$inherits(TagSyntax, InlineSyntax);
function TagSyntax(pattern, tag, end) {
  this.endPattern = new JSSyntaxRegExp((end != null) ? end : pattern, true);
  this.tag = tag;
  InlineSyntax.call(this, pattern);
}
TagSyntax.prototype.onMatch = function(parser, match) {
  parser._stack.add(new TagState(parser.pos, parser.pos + match.$index((0)).length, this));
  return true;
}
TagSyntax.prototype.onMatchEnd = function(parser, match, state) {
  parser.addNode(new markdown_Element(this.tag, state.children));
  return true;
}
$inherits(LinkSyntax, TagSyntax);
function LinkSyntax() {
  TagSyntax.call(this, "\\[", null, LinkSyntax.get$linkPattern());
}
LinkSyntax.get$linkPattern = function() {
  var refLink = "\\s?\\[([^\\]]*)\\]";
  var title = "(?:[ ]*\"([^\"]+)\"|)";
  var inlineLink = ("\\s?\\(([^ )]+)" + title + "\\)");
  return ("](?:(" + refLink + "|" + inlineLink + ")|)");
}
LinkSyntax.prototype.onMatchEnd = function(parser, match, state) {
  var url;
  var title;
  if ((match.$index((1)) == null) || (match.$index((1)) == "")) {
    if ($eq$($globals._implicitLinkResolver)) return false;
    if (state.children.get$length() != (1)) return false;
    if (!(state.children.$index((0)) instanceof markdown_Text)) return false;
    var link = state.children.$index((0));
    var node = $globals._implicitLinkResolver.call$1(link.text);
    if ($eq$(node)) return false;
    parser.addNode(node);
    return true;
  }
  if ((match.$index((3)) != null) && (match.$index((3)) != "")) {
    url = match.$index((3));
    title = match.$index((4));
    if (url.startsWith("<") && url.endsWith(">")) {
      url = url.substring((1), url.get$length() - (1));
    }
  }
  else {
    var id = match.$index((2));
    if ($eq$(id, "")) {
      id = parser.source.substring(state.startPos + (1), parser.pos);
    }
    id = id.toLowerCase();
    var link = parser.document.refLinks.$index(id);
    if ($eq$(link)) return false;
    url = link.get$url();
    title = link.get$title();
  }
  var anchor = new markdown_Element("a", state.children);
  anchor.get$attributes().$setindex("href", escapeHtml(url));
  if (($ne$(title)) && ($ne$(title, ""))) {
    anchor.get$attributes().$setindex("title", escapeHtml(title));
  }
  parser.addNode(anchor);
  return true;
}
$inherits(CodeSyntax, InlineSyntax);
function CodeSyntax(pattern) {
  InlineSyntax.call(this, pattern);
}
CodeSyntax.prototype.onMatch = function(parser, match) {
  parser.addNode(new markdown_Element.text$ctor("code", escapeHtml(match.$index((1)))));
  return true;
}
function TagState(startPos, endPos, syntax) {
  this.startPos = startPos;
  this.endPos = endPos;
  this.syntax = syntax;
  this.children = [];
}
TagState.prototype.get$startPos = function() { return this.startPos; };
TagState.prototype.get$endPos = function() { return this.endPos; };
TagState.prototype.get$children = function() { return this.children; };
TagState.prototype.tryMatch = function(parser) {
  var endMatch = this.syntax.endPattern.firstMatch(parser.get$currentSource());
  if ((endMatch != null) && (endMatch.start() == (0))) {
    this.close(parser, endMatch);
    return true;
  }
  return false;
}
TagState.prototype.close = function(parser, endMatch) {
  var index = parser._stack.indexOf$1(this);
  var unmatchedTags = parser._stack.getRange(index + (1), parser._stack.get$length() - index - (1));
  parser._stack.removeRange(index + (1), parser._stack.get$length() - index - (1));
  for (var $$i = unmatchedTags.iterator(); $$i.hasNext(); ) {
    var unmatched = $$i.next();
    parser.writeTextRange(unmatched.get$startPos(), unmatched.get$endPos());
    this.children.addAll(unmatched.get$children());
  }
  parser.writeText();
  parser._stack.removeLast();
  if (parser._stack.get$length() == (0)) return this.children;
  if (this.syntax.onMatchEnd(parser, endMatch, this)) {
    parser.consume(endMatch.$index((0)).length);
  }
  else {
    parser.start = this.startPos;
    parser.advanceBy(endMatch.$index((0)).length);
  }
  return null;
}
TagState.prototype.close$2 = TagState.prototype.close;
function markdownToHtml(markdown) {
  var document = new markdown_Document();
  var lines = markdown.split$_("\n");
  document.parseRefLinks(lines);
  var blocks = document.parseLines(lines);
  return renderToHtml(blocks);
}
function escapeHtml(html) {
  return html.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}
var _implicitLinkResolver;
function renderToHtml(nodes) {
  return new HtmlRenderer().render(nodes);
}
function Observable() {
  this._observers = new Array();
}
Observable.prototype.add = function(observer) {
  this._observers.add(observer);
}
Observable.prototype.notifyObservers = function(obj) {
  if ($eq$(obj)) {
    this._observers.forEach$1((function (observer) {
      return observer.call$0();
    })
    );
  }
  else {
    this._observers.forEach$1((function (observer) {
      return observer.call$1(obj);
    })
    );
  }
}
Observable.prototype.add$1 = Observable.prototype.add;
function showElements(selector) {
  get$$document().queryAll(selector).forEach$1((function (elem) {
    return elem.get$classes().remove$1("hide");
  })
  );
}
function hideElements(selector) {
  get$$document().queryAll(selector).forEach$1((function (elem) {
    return elem.get$classes().add$1("hide");
  })
  );
}
function isHidden(selector) {
  return get$$document().query(selector).get$classes().contains$1("hide");
}
function slideCount(text) {
  return markdownToHtml(text).split$_("<hr />").get$length();
}
function buildSlides(text) {
  var sb = new StringBufferImpl("");
  markdownToHtml(text).split$_("<hr />").forEach$1((function (slide) {
    if ($ne$(slide) && slide.get$length() > (0)) {
      sb.add("<div class=\"slide-container\"><div><section class=\"slide\">").add(slide).add("</section></div></div>");
    }
  })
  );
  return sb.toString();
}
var _JSON = JSON;
function json_JSON() {}
json_JSON.parse = function(str) {
  return _JSON.parse(str, (function (_, obj) {
    var keys = _jsKeys(obj);
    if ($eq$(keys)) return obj;
    var map = new HashMapImplementation();
    for (var $$i = keys.iterator(); $$i.hasNext(); ) {
      var key = $$i.next();
      map.$setindex(key, _getValue(obj, key));
    }
    return map;
  })
  );
}
json_JSON.stringify = function(value) {
  return _JSON.stringify(value, (function (_, obj) {
    if (_directToJson(obj)) return obj;
    if (!!(obj && obj.is$Map_dart_core_String$Dynamic())) {
      var map = obj;
      obj = new Object();
      map.forEach$1((function (k, v) {
        return _setValue(obj, k, v);
      })
      );
      return obj;
    }
    $throw(new IllegalArgumentException(("cannot convert \"" + value + "\" to JSON")));
  })
  );
}
function _getValue(obj, key) {
  return obj[key]
}
function _setValue(obj, key, value) {
  obj[key] = value
}
function _directToJson(obj) {
  return typeof obj != 'object' || obj == null || obj instanceof Array
}
function _jsKeys(obj) {
  if (obj != null && typeof obj == 'object' && !(obj instanceof Array)) {
  return Object.keys(obj);
  }
  return null;
}
function _WeakDotStorageObservers() {
  this.clear$_ = new Observable();
}
function WeakDotStorage() {
  this.on = new _WeakDotStorageObservers();
}
WeakDotStorage.prototype.get$on = function() { return this.on; };
WeakDotStorage.prototype.listSlideNames = function() {
  var slideNamesUnparsed = get$$window().localStorage.$index("SLIDE_NAMES");
  var slideNames = slideNamesUnparsed != null ? json_JSON.parse(slideNamesUnparsed) : [];
  slideNames.sort$1((function (a, b) {
    return a.compareTo(b);
  })
  );
  return slideNames;
}
WeakDotStorage.prototype.save = function(name, slide) {
  name = name.trim();
  var slideNames = HashSetImplementation.HashSetImplementation$from$factory(this.listSlideNames());
  slideNames.add(name);
  get$$window().localStorage.$setindex("SLIDE_NAMES", json_JSON.stringify(ListFactory.ListFactory$from$factory(slideNames)));
  get$$window().localStorage.$setindex(name, slide);
}
WeakDotStorage.prototype.loadSlide = function(name) {
  return get$$window().localStorage.$index(name);
}
WeakDotStorage.prototype.clear$_ = function() {
  try {
    get$$window().localStorage.clear$_();
  } finally {
    this.on.clear$_.notifyObservers();
  }
}
WeakDotStorage.prototype.clear$0 = WeakDotStorage.prototype.clear$_;
function Slides() {
  this._slidesShowContainer = get$$document().query("#slides_show");
  this.on = new _SlidesObservable();
  this._handleKeysInSlideModeHandler = this.get$_handleKeysInSlideMode();
  this._resizeSlideHandler = (function (e) {
    return _resizeSlide();
  })
  ;
}
Slides.prototype.get$on = function() { return this.on; };
Slides.prototype.show = function(markdownText, showSlideNumber) {
  this._slidesShowContainer.set$innerHTML(buildSlides(markdownText));
  showElements("#slide_mode, #slides_show");
  get$$document().query("#controls").get$classes().add$1("controls-in-slide-mode");
  get$$document().body.get$classes().add$1("full");
  if ($ne$(this._slidesShowContainer.query$1(".slide-container"))) {
    this._slidesShowContainer.queryAll(".slide-container").$index(showSlideNumber).get$classes().add$1("selected-slide");
  }
  get$$document().get$on().get$keyDown().add($wrap_call$1(to$call$1(this._handleKeysInSlideModeHandler)), false);
  get$$document().get$window().get$on().get$resize().add($wrap_call$1(to$call$1(this._resizeSlideHandler)), false);
  _resizeSlide();
}
Slides.prototype.hide = function() {
  get$$document().body.style.set$transform("");
  hideElements("#slide_mode, #slides_show");
  get$$document().query("#controls").get$classes().remove$1("controls-in-slide-mode");
  get$$document().body.get$classes().remove$1("full");
  if (get$$document().query("#slides_show .selected-slide") != null) {
    get$$document().query("#slides_show .selected-slide").get$classes().remove$1("selected-slide");
  }
  get$$document().get$on().get$keyDown().remove($wrap_call$1(to$call$1(this._handleKeysInSlideModeHandler)), false);
  get$$document().get$window().get$on().get$resize().remove($wrap_call$1(to$call$1(this._resizeSlideHandler)), false);
}
Slides.prototype._handleKeysInSlideMode = function(event) {
  var selectedSlide = get$$document().query("#slides_show .selected-slide");
  switch (event.keyCode) {
    case (39):

      if ($ne$(selectedSlide.get$nextElementSibling())) {
        selectedSlide.get$classes().remove$1("selected-slide");
        selectedSlide.get$nextElementSibling().get$classes().add$1("selected-slide");
      }
      event.preventDefault();
      break;

    case (37):

      if ($ne$(selectedSlide.get$previousElementSibling())) {
        selectedSlide.get$classes().remove$1("selected-slide");
        selectedSlide.get$previousElementSibling().get$classes().add$1("selected-slide");
      }
      event.preventDefault();
      break;

    case (27):

      this.hide();
      this.on.exit.notifyObservers();
      event.preventDefault();
      break;

  }
}
Slides.prototype.get$_handleKeysInSlideMode = function() {
  return this._handleKeysInSlideMode.bind(this);
}
function _SlidesObservable() {
  this.exit = new Observable();
}
function _resizeSlide() {
  get$$document().body.get$rect().then((function (bodyRect) {
    var scale = (1.0) / Math.max(bodyRect.client.width / get$$window().innerWidth, bodyRect.client.height / get$$window().innerHeight);
    get$$document().body.style.set$transform(("scale(" + scale + ")"));
  })
  );
}
function Editor(storage) {
  var $this = this;
  this._editor = get$$document().query("#text");
  this._titleElement = get$$document().query("#slide_title");
  this._storage = storage;
  this._slidesPreviewContainer = get$$document().query("#slides_container");
  this.on = new _EditorObservable();
  this._editor.get$on().get$keyUp().add($wrap_call$1((function (e) {
    return $this.on.change.notifyObservers();
  })
  ), false);
  this.on.change.add(this.get$_handleValueChange());
  this._editor.get$on().get$keyUp().add($wrap_call$1(this.get$_centerCurrentlyEditedSlide()), false);
  this._editor.get$on().get$click().add$1(this.get$_centerCurrentlyEditedSlide());
}
Editor.prototype.get$on = function() { return this.on; };
Editor.prototype._handleValueChange = function() {
  var $this = this;
  this._slidesPreviewContainer.set$innerHTML($add$($add$("<div>", buildSlides(this.get$value())), "</div>"));
  get$$document().queryAll(".slide-container > div").forEach$1((function (e) {
    return e.get$on().get$click().add$1((function (v) {
      return $this.on.slidePreviewClick.notifyObservers(e.get$parent().get$parent().get$nodes().indexOf(e.get$parent(), (0)));
    })
    );
  })
  );
}
Editor.prototype.get$_handleValueChange = function() {
  return this._handleValueChange.bind(this);
}
Editor.prototype._centerCurrentlyEditedSlide = function(e) {
  var currentSlide = slideCount(this._editor.value == null ? "" : this._editor.value.substring((0), this._editor.selectionStart));
  var container = get$$document().query("#slides_container > div");
  container.set$$$dom_scrollTop((435) * (currentSlide - (1)));
}
Editor.prototype.get$_centerCurrentlyEditedSlide = function() {
  return this._centerCurrentlyEditedSlide.bind(this);
}
Editor.prototype.get$value = function() {
  return this._editor.value;
}
Editor.prototype.set$value = function(value) {
  this._editor.value = value;
  this.on.change.notifyObservers();
}
Editor.prototype.save = function() {
  this._storage.save(this._titleElement.value, this.get$value());
  this.on.save.notifyObservers();
}
Editor.prototype.load = function(slideTitle) {
  this._titleElement.value = slideTitle;
  this.set$value(this._storage.loadSlide(slideTitle));
}
Editor.prototype.show = function() {
  showElements("#edit_mode, #editing_area");
}
Editor.prototype.hide = function() {
  hideElements("#edit_mode, #editing_area");
}
Editor.prototype.showSlidePreview = function() {
  showElements("#slides_container");
}
Editor.prototype.hideSlidePreview = function() {
  hideElements("#slides_container");
}
Editor.prototype.isSlidePreviewHidden = function() {
  return isHidden("#slides_container");
}
function _EditorObservable() {
  this.change = new Observable();
  this.save = new Observable();
  this.slidePreviewClick = new Observable();
}
_EditorObservable.prototype.get$change = function() { return this.change; };
Uri.fromString$ctor = function(uri) {
  Uri._fromMatch$ctor.call(this, const$0026.firstMatch(uri));
}
Uri.fromString$ctor.prototype = Uri.prototype;
Uri._fromMatch$ctor = function(m) {
  Uri.call(this, Uri._emptyIfNull(m.$index((1))), Uri._emptyIfNull(m.$index((2))), Uri._emptyIfNull(m.$index((3))), Uri._parseIntOrZero(m.$index((4))), Uri._emptyIfNull(m.$index((5))), Uri._emptyIfNull(m.$index((6))), Uri._emptyIfNull(m.$index((7))));
}
Uri._fromMatch$ctor.prototype = Uri.prototype;
function Uri(scheme, userInfo, domain, port, path, query, fragment) {
  this.scheme = scheme;
  this.userInfo = userInfo;
  this.domain = domain;
  this.port = port;
  this.path = path;
  this.query = query;
  this.fragment = fragment;
}
Uri._emptyIfNull = function(val) {
  return val != null ? val : "";
}
Uri._parseIntOrZero = function(val) {
  if (null != val && val != "") {
    return Math.parseInt(val);
  }
  else {
    return (0);
  }
}
Uri.prototype.hasAuthority = function() {
  return (this.userInfo != "") || (this.domain != "") || (this.port != (0));
}
Uri.prototype.toString = function() {
  var sb = new StringBufferImpl("");
  Uri._addIfNonEmpty(sb, this.scheme, this.scheme, ":");
  if (this.hasAuthority() || (this.scheme == "file")) {
    sb.add("//");
    Uri._addIfNonEmpty(sb, this.userInfo, this.userInfo, "@");
    sb.add(null == this.domain ? "null" : this.domain);
    if (this.port != (0)) {
      sb.add(":");
      sb.add(this.port.toString());
    }
  }
  sb.add(null == this.path ? "null" : this.path);
  Uri._addIfNonEmpty(sb, this.query, "?", this.query);
  Uri._addIfNonEmpty(sb, this.fragment, "#", this.fragment);
  return sb.toString();
}
Uri._addIfNonEmpty = function(sb, test, first, second) {
  if ("" != test) {
    sb.add(null == first ? "null" : first);
    sb.add(null == second ? "null" : second);
  }
}
function GithubLoader(editor) {
  get$$window().get$on().get$message().add($wrap_call$1(this.get$_dataReceived()), false);
  this._githubloader_editor = editor;
}
GithubLoader.prototype._dataReceived = function(e) {
  var data = null;
  try {
    data = json_JSON.parse(e.data);
  } catch (exc) {
    exc = _toDartException(exc);
    return;
  }
  if (this._resourcePathToConsume.get$length() > (0)) {
    var path = this._resourcePathToConsume.$index((0));
    var url = data.$index("data").$index("tree").filter$1((function (elem) {
      return $eq$(elem.$index("path"), path);
    })
    ).last().$index("url");
    this._resourcePathToConsume.removeRange((0), (1));
    this._doJsonPCall(("" + url + "?callback=callbackForJsonpApi"));
  }
  else {
    this._githubloader_editor.set$value(base64Decode(data.$index("data").$index("content")));
  }
}
GithubLoader.prototype.get$_dataReceived = function() {
  return this._dataReceived.bind(this);
}
GithubLoader.prototype.loadFromUri = function(uri) {
  if (uri != "") {
    var resource = new Uri.fromString$ctor(uri);
    var userAndRepo;
    var branch;
    var resourcePath;
    if (resource.domain == "github.com") {
      var splitted = resource.path.substring((1)).split$_("/");
      userAndRepo = $add$($add$(splitted.$index((0)), "/"), splitted.$index((1)));
      branch = splitted.$index((3));
      this._resourcePathToConsume = splitted.getRange((4), splitted.get$length() - (4));
    }
    this._doJsonPCall(("https://api.github.com/repos/" + userAndRepo + "/git/trees/" + branch + "?callback=callbackForJsonpApi"));
  }
}
GithubLoader.prototype._doJsonPCall = function(src) {
  var script = _ElementFactoryProvider.Element$tag$factory("script");
  script.src = src;
  get$$document().body.get$elements().add(script);
}
function base64Decode(s) {
  return get$$window().atob(s.replaceAll("\n", ""));
}
function updateListSlideNames(storage) {
  var slideSelect = get$$document().query("#slide_list");
  slideSelect.get$nodes().clear$_();
  storage.listSlideNames().forEach$1((function (slideName) {
    var slideNameElement = _ElementFactoryProvider.Element$html$factory(("<option value=\"" + slideName + "\">" + slideName + "</option>"));
    slideSelect.get$nodes().add(slideNameElement);
  })
  );
}
function prepareGui(storage, editor, slides) {
  var githubLoader = new GithubLoader(editor);
  updateListSlideNames(storage);
  storage.on.clear$_.add((function () {
    return updateListSlideNames(storage);
  })
  );
  editor.on.save.add((function () {
    return updateListSlideNames(storage);
  })
  );
  slides.on.exit.add((function () {
    return editor.show();
  })
  );
  var slideSelect = get$$document().query("#slide_list");
  slideSelect.get$on().get$change().add$1((function (e) {
    var value = slideSelect.value;
    print$(("slideSelect value is " + value));
    editor.save();
    print$(("slideSelect value is " + slideSelect.value));
    editor.load(value);
  })
  );
  get$$document().query("#save_slide").get$on().get$click().add$1((function (e) {
    return editor.save();
  })
  );
  var showHideButton = get$$document().query("#show_hide_preview_button");
  showHideButton.get$on().get$click().add$1((function (e) {
    if (editor.isSlidePreviewHidden()) {
      editor.showSlidePreview();
      showHideButton.set$text("hide preview");
    }
    else {
      editor.hideSlidePreview();
      showHideButton.set$text("show preview");
    }
  })
  );
  editor.on.slidePreviewClick.add((function (slidePosition) {
    editor.hide();
    slides.show(editor.get$value(), slidePosition);
  })
  );
  get$$document().query("#toggle_slide_mode_button").get$on().get$click().add$1((function (e) {
    editor.hide();
    slides.show(editor.get$value(), (0));
  })
  );
  get$$document().query("#toggle_edit_mode_button").get$on().get$click().add$1((function (e) {
    slides.hide();
    editor.show();
  })
  );
  get$$document().query("#clear_storage").get$on().get$click().add$1((function (e) {
    if (get$$window().confirm("are you sure to clear all?")) {
      storage.clear$_();
    }
  })
  );
  get$$document().query("#load_template").get$on().get$click().add$1((function (e) {
    return loadTemplate(editor);
  })
  );
  var githubUrl = get$$document().query("#github_url");
  get$$document().query("#github_load").get$on().get$click().add$1((function (e) {
    return githubLoader.loadFromUri(githubUrl.value);
  })
  );
}
function main() {
  var storage = new WeakDotStorage();
  var editor = new Editor(storage);
  var slides = new Slides();
  prepareGui(storage, editor, slides);
  editor.show();
  slides.hide();
}
function loadTemplate(editor) {
  editor.set$value("#slide title\r\n\r\nsome text. _em_ and __strong__.\r\n\r\nor *em* and **strong**.\r\n\r\nAdd 3 dash for creating a new slide\r\n\r\n---\r\n#a slide appear! (with list)\r\n\r\n\r\n- one\r\n- two \r\n- three\r\n\r\ninline  html work too:\r\n\r\n<ol>\r\n  <li>test\r\n  <li>test2\r\n</ol>\r\n\r\n---\r\n#quoting\r\n\r\n> test sdfa f asd sf a\r\n> dsfasfds sf\r\n> fdsfasfd\r\n>> test\r\n> a");
}
(function(){
  var v0/*HTMLMediaElement*/ = 'HTMLMediaElement|HTMLAudioElement|HTMLVideoElement';
  var v1/*SVGElement*/ = 'SVGElement|SVGAElement|SVGAltGlyphDefElement|SVGAltGlyphItemElement|SVGAnimationElement|SVGAnimateColorElement|SVGAnimateElement|SVGAnimateMotionElement|SVGAnimateTransformElement|SVGSetElement|SVGCircleElement|SVGClipPathElement|SVGComponentTransferFunctionElement|SVGFEFuncAElement|SVGFEFuncBElement|SVGFEFuncGElement|SVGFEFuncRElement|SVGCursorElement|SVGDefsElement|SVGDescElement|SVGEllipseElement|SVGFEBlendElement|SVGFEColorMatrixElement|SVGFEComponentTransferElement|SVGFECompositeElement|SVGFEConvolveMatrixElement|SVGFEDiffuseLightingElement|SVGFEDisplacementMapElement|SVGFEDistantLightElement|SVGFEDropShadowElement|SVGFEFloodElement|SVGFEGaussianBlurElement|SVGFEImageElement|SVGFEMergeElement|SVGFEMergeNodeElement|SVGFEMorphologyElement|SVGFEOffsetElement|SVGFEPointLightElement|SVGFESpecularLightingElement|SVGFESpotLightElement|SVGFETileElement|SVGFETurbulenceElement|SVGFilterElement|SVGFontElement|SVGFontFaceElement|SVGFontFaceFormatElement|SVGFontFaceNameElement|SVGFontFaceSrcElement|SVGFontFaceUriElement|SVGForeignObjectElement|SVGGElement|SVGGlyphElement|SVGGlyphRefElement|SVGGradientElement|SVGLinearGradientElement|SVGRadialGradientElement|SVGHKernElement|SVGImageElement|SVGLineElement|SVGMPathElement|SVGMarkerElement|SVGMaskElement|SVGMetadataElement|SVGMissingGlyphElement|SVGPathElement|SVGPatternElement|SVGPolygonElement|SVGPolylineElement|SVGRectElement|SVGSVGElement|SVGScriptElement|SVGStopElement|SVGStyleElement|SVGSwitchElement|SVGSymbolElement|SVGTextContentElement|SVGTextPathElement|SVGTextPositioningElement|SVGAltGlyphElement|SVGTRefElement|SVGTSpanElement|SVGTextElement|SVGTitleElement|SVGUseElement|SVGVKernElement|SVGViewElement';
  var v2/*CharacterData*/ = 'CharacterData|Comment|Text|CDATASection';
  var v3/*HTMLDocument*/ = 'HTMLDocument|SVGDocument';
  var v4/*DocumentFragment*/ = 'DocumentFragment|ShadowRoot';
  var v5/*Element*/ = [v0/*HTMLMediaElement*/,v1/*SVGElement*/,'Element|HTMLElement|HTMLAnchorElement|HTMLAppletElement|HTMLAreaElement|HTMLBRElement|HTMLBaseElement|HTMLBaseFontElement|HTMLBodyElement|HTMLButtonElement|HTMLCanvasElement|HTMLContentElement|HTMLDListElement|HTMLDetailsElement|HTMLDirectoryElement|HTMLDivElement|HTMLEmbedElement|HTMLFieldSetElement|HTMLFontElement|HTMLFormElement|HTMLFrameElement|HTMLFrameSetElement|HTMLHRElement|HTMLHeadElement|HTMLHeadingElement|HTMLHtmlElement|HTMLIFrameElement|HTMLImageElement|HTMLInputElement|HTMLKeygenElement|HTMLLIElement|HTMLLabelElement|HTMLLegendElement|HTMLLinkElement|HTMLMapElement|HTMLMarqueeElement|HTMLMenuElement|HTMLMetaElement|HTMLMeterElement|HTMLModElement|HTMLOListElement|HTMLObjectElement|HTMLOptGroupElement|HTMLOptionElement|HTMLOutputElement|HTMLParagraphElement|HTMLParamElement|HTMLPreElement|HTMLProgressElement|HTMLQuoteElement|HTMLScriptElement|HTMLSelectElement|HTMLShadowElement|HTMLSourceElement|HTMLSpanElement|HTMLStyleElement|HTMLTableCaptionElement|HTMLTableCellElement|HTMLTableColElement|HTMLTableElement|HTMLTableRowElement|HTMLTableSectionElement|HTMLTextAreaElement|HTMLTitleElement|HTMLTrackElement|HTMLUListElement|HTMLUnknownElement'].join('|');
  var v6/*AbstractWorker*/ = 'AbstractWorker|SharedWorker|Worker';
  var v7/*IDBRequest*/ = 'IDBRequest|IDBVersionChangeRequest';
  var v8/*MediaStream*/ = 'MediaStream|LocalMediaStream';
  var v9/*Node*/ = [v2/*CharacterData*/,v3/*HTMLDocument*/,v4/*DocumentFragment*/,v5/*Element*/,'Node|Attr|DocumentType|Entity|EntityReference|Notation|ProcessingInstruction'].join('|');
  var v10/*WorkerContext*/ = 'WorkerContext|DedicatedWorkerContext|SharedWorkerContext';
  var table = [
    ['AbstractWorker', v6/*AbstractWorker*/]
    , ['AudioParam', 'AudioParam|AudioGain']
    , ['CSSValueList', 'CSSValueList|WebKitCSSTransformValue|WebKitCSSFilterValue']
    , ['CharacterData', v2/*CharacterData*/]
    , ['DOMTokenList', 'DOMTokenList|DOMSettableTokenList']
    , ['HTMLDocument', v3/*HTMLDocument*/]
    , ['DocumentFragment', v4/*DocumentFragment*/]
    , ['HTMLMediaElement', v0/*HTMLMediaElement*/]
    , ['SVGElement', v1/*SVGElement*/]
    , ['Element', v5/*Element*/]
    , ['Entry', 'Entry|DirectoryEntry|FileEntry']
    , ['EntrySync', 'EntrySync|DirectoryEntrySync|FileEntrySync']
    , ['IDBRequest', v7/*IDBRequest*/]
    , ['MediaStream', v8/*MediaStream*/]
    , ['Node', v9/*Node*/]
    , ['WorkerContext', v10/*WorkerContext*/]
    , ['EventTarget', [v6/*AbstractWorker*/,v7/*IDBRequest*/,v8/*MediaStream*/,v9/*Node*/,v10/*WorkerContext*/,'EventTarget|AudioContext|BatteryManager|DOMApplicationCache|DeprecatedPeerConnection|EventSource|FileReader|FileWriter|IDBDatabase|IDBTransaction|MediaController|MessagePort|Notification|PeerConnection00|SpeechRecognition|TextTrack|TextTrackCue|TextTrackList|WebSocket|DOMWindow|XMLHttpRequest|XMLHttpRequestUpload'].join('|')]
    , ['HTMLCollection', 'HTMLCollection|HTMLOptionsCollection']
    , ['StyleSheet', 'StyleSheet|CSSStyleSheet']
    , ['Uint8Array', 'Uint8Array|Uint8ClampedArray']
  ];
  $dynamicSetMetadata(table);
})();
function $static_init(){
  $globals._firstMeasurementRequest = true;
  $globals._nextMeasurementFrameScheduled = false;
}
var const$0000 = Object.create(_DeletedKeySentinel.prototype, {});
var const$0001 = Object.create(NoMoreElementsException.prototype, {});
var const$0002 = Object.create(EmptyQueueException.prototype, {});
var const$0003 = Object.create(UnsupportedOperationException.prototype, {_message: {"value": "", writeable: false}});
var const$0004 = new JSSyntaxRegExp("^#[_a-zA-Z]\\w*$");
var const$0005 = new JSSyntaxRegExp("^[ ]{0,3}>[ ]?(.*)$");
var const$0006 = new JSSyntaxRegExp("^[ ]{0,3}[*+-][ \\t]+(.*)$");
var const$0007 = new JSSyntaxRegExp("^(?:    |\\t)(.*)$");
var const$0008 = new JSSyntaxRegExp("^[ ]{0,3}\\d+\\.[ \\t]+(.*)$");
var const$0009 = new JSSyntaxRegExp("^(#{1,6})(.*?)#*$");
var const$0010 = new JSSyntaxRegExp("^<[ ]*\\w+[ >]");
var const$0011 = new JSSyntaxRegExp("^[ ]{0,3}((-+[ ]{0,2}){3,}|(_+[ ]{0,2}){3,}|(\\*+[ ]{0,2}){3,})$");
var const$0012 = new JSSyntaxRegExp("^([ \\t]*)$");
var const$0013 = new JSSyntaxRegExp("^((=+)|(-+))$");
var const$0014 = Object.create(NotImplementedException.prototype, {});
var const$0015 = Object.create(IllegalAccessException.prototype, {});
var const$0016 = _constMap([]);
var const$0018 = new JSSyntaxRegExp("blockquote|h1|h2|h3|h4|h5|h6|hr|p|pre");
var const$0019 = Object.create(UnsupportedOperationException.prototype, {_message: {"value": "TODO(jacobr): should we impl?", writeable: false}});
var const$0020 = new JSSyntaxRegExp("^\\[name=[\"'][^'\"]+['\"]\\]$");
var const$0021 = new JSSyntaxRegExp("^[*a-zA-Z0-9]+$");
var const$0024 = new JSSyntaxRegExp("<(\\w+)");
var const$0025 = _constMap(["body", "html", "head", "html", "caption", "table", "td", "tr", "colgroup", "table", "col", "colgroup", "tr", "tbody", "tbody", "table", "tfoot", "table", "thead", "table", "track", "audio"]);
var const$0026 = new JSSyntaxRegExp("^(?:([^:/?#.]+):)?(?://(?:([^/?#]*)@)?([\\w\\d\\-\\u0100-\\uffff.%]*)(?::([0-9]+))?)?([^?#]+)?(?:\\?([^#]*))?(?:#(.*))?$");
var const$0017 = ImmutableList.ImmutableList$from$factory([const$0005, const$0009, const$0011, const$0007, const$0006, const$0008]);
var $globals = {};
$static_init();
if (typeof window != 'undefined' && typeof document != 'undefined' &&
    window.addEventListener && document.readyState == 'loading') {
  window.addEventListener('DOMContentLoaded', function(e) {
    main();
  });
} else {
  main();
}
