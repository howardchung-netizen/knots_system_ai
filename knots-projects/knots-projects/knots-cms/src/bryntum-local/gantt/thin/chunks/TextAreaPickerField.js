/*!
 *
 * Bryntum Gantt 5.0.1
 *
 * Copyright(c) 2022 Bryntum AB
 * https://bryntum.com/contact
 * https://bryntum.com/license
 *
 */
import { Objects, StringHelper, ObjectHelper, PickerField, VersionHelper, EventHelper } from './Editor.js';

/**
 * @module Core/helper/XMLHelper
 */

/**
 * Helper for XML manipulation.
 */

class XMLHelper {
  /**
   * Convert an javascript object to a XML string.
   *
   * From:
   * ```javascript
   * {
   *     name : 'Task 1',
   *     data : [
   *         {
   *             text : 'foo 1',
   *             ref  : 'fooItem 1'
   *         },
   *         {
   *             text : 'foo 2',
   *             ref  : 'fooItem 2'
   *         }
   *     ]
   * }
   * ```
   *
   * To:
   * ```xml
   * <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
   * <root>
   *     <name>Task 1</name>
   *     <data>
   *         <element>
   *             <text>foo 1</text>
   *             <ref>fooItem 1</ref>
   *         </element>
   *         <element>
   *             <text>foo 2</text>
   *             <ref>fooItem 2</ref>
   *         </element>
   *     </data>
   * </root>
   * ```
   *
   * @param {Object} obj Object to convert.
   * @param {Object} [options] Convert options.
   * @param {String} [options.rootName] Root name for the XML. `root` by default.
   * @param {String} [options.elementName] Element name for each node of the XML. `element` by default.
   * @param {String} [options.xmlns] Add value for xmlns property for the root tag of the XML.
   * @param {Boolean} [options.includeHeader] `false` to not include the header `<?xml version="1.0" encoding="UTF-8"?>` on top of the XML.
   * @param {Boolean} [options.rootElementForArray] `false` to not include a root element for array of items. e.g. for the above example:
   * ```xml
   * <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
   * <root>
   *     <name>Task 1</name>
   *     <element>
   *         <text>foo 1</text>
   *         <ref>fooItem 1</ref>
   *     </element>
   *     <element>
   *         <text>foo 2</text>
   *         <ref>fooItem 2</ref>
   *     </element>
   * </root>
   * ```
   * @returns {String} the XML
   */
  static convertFromObject(obj, options = {}) {
    // override default values
    Objects.assignIf(options, {
      rootName: 'root',
      elementName: 'element',
      includeHeader: true,
      rootElementForArray: true
    });
    const {
      rootName,
      elementName,
      includeHeader,
      rootElementForArray
    } = options;
    let {
      xmlns
    } = options;
    xmlns = xmlns ? ` xmlns="${xmlns}"` : '';
    const header = includeHeader ? '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' : '';

    const converter = o => {
      const xmlItems = [];

      for (const key in o) {
        const item = o[key];

        if (Array.isArray(item)) {
          if (rootElementForArray) {
            xmlItems.push(`<${key}>`);
          }

          for (const subItem of item) {
            if (elementName.length) {
              xmlItems.push(`<${elementName}>`);
            } else {
              xmlItems.push(`<${key}>`);
            }

            xmlItems.push(converter(subItem));

            if (elementName.length) {
              xmlItems.push(`</${elementName}>`);
            } else {
              xmlItems.push(`</${key}>`);
            }
          }

          if (rootElementForArray) {
            xmlItems.push(`</${key}>`);
          }
        } else if (Objects.isObject(item)) {
          xmlItems.push(`<${key}>${converter(item)}</${key}>`);
        } else {
          if (item == null) {
            xmlItems.push(`<${key}/>`);
          } else {
            xmlItems.push(`<${key}>${StringHelper.encodeHtml(item)}</${key}>`);
          }
        }
      }

      return xmlItems.join('');
    };

    return `${header}<${rootName}${xmlns}>${converter(obj)}</${rootName}>`;
  }

}
XMLHelper._$name = 'XMLHelper';

/**
 * @module Core/helper/util/RandomGenerator
 */

/**
 * Generates pseudo random numbers from predefined sequence of 100 numbers
 */
class RandomGenerator {
  constructor() {
    this.random100 = [46, 2, 36, 46, 54, 59, 18, 20, 71, 55, 88, 98, 13, 61, 61, 40, 2, 15, 3, 32, 51, 45, 64, 25, 81, 85, 54, 13, 57, 49, 64, 22, 81, 94, 0, 62, 17, 7, 11, 2, 33, 99, 85, 26, 83, 83, 96, 26, 20, 89, 91, 38, 26, 13, 11, 79, 32, 30, 5, 51, 70, 7, 5, 56, 58, 77, 37, 89, 40, 80, 78, 59, 26, 36, 8, 51, 60, 23, 86, 5, 11, 96, 64, 94, 87, 64, 4, 78, 17, 85, 35, 0, 90, 86, 23, 55, 53, 9, 35, 59, 29, 2, 64, 42, 8, 49, 43, 73, 6, 53, 38, 9, 39, 31, 32, 40, 49, 13, 78, 68, 20, 99, 24, 78, 35, 91, 73, 46, 67, 76, 89, 69, 30, 69, 25, 3, 4, 55, 1, 65, 66, 76, 83, 19, 67, 1, 95, 24, 54, 45, 56, 40, 67, 92, 72, 4, 69, 8, 47, 50, 27, 2, 38, 9, 14, 83, 12, 14, 62, 95, 22, 47, 35, 18, 38, 14, 86, 64, 68, 61, 52, 69, 39, 93, 20, 73, 32, 52, 74, 6, 56, 68, 99, 29, 24, 92, 40, 67, 6, 72, 31, 41, 91, 53, 80, 55, 33, 97, 97, 99, 18, 20, 5, 27, 82, 84, 61, 78, 27, 67, 7, 42, 75, 95, 91, 25, 63, 21, 70, 36, 46, 0, 1, 45, 84, 6, 86, 15, 10, 62, 96, 94, 10, 23, 93, 83, 94, 47, 5, 29, 29, 52, 51, 37, 77, 96, 43, 72, 43, 14, 54, 14, 72, 52, 4, 39, 15, 26, 68, 28, 25, 76, 60, 50, 22, 40, 72, 74, 68, 58, 8, 48, 40, 62, 52, 24, 9, 26, 47, 44, 49, 96, 7, 77, 90, 45, 76, 47, 5, 86, 1, 36, 18, 42, 19, 90, 34, 23, 70, 32, 69, 79, 0, 99, 57, 80, 72, 21, 19, 72, 85, 68, 4, 40, 86, 62, 0, 63, 4, 11, 69, 31, 78, 31, 21, 78, 29, 84, 13, 53, 57, 10, 26, 50, 24, 30, 90, 42, 51, 96, 93, 21, 99, 23, 81, 0, 89, 43, 86, 63, 93, 19, 54, 71, 92, 36, 4, 95, 37, 99, 60, 29, 23, 50, 68, 95, 57, 95, 77, 53, 99, 78, 75, 12, 92, 47, 23, 14, 0, 41, 98, 11, 34, 64, 26, 90, 50, 23, 38, 31, 74, 76, 16, 76, 66, 23, 22, 72, 48, 50, 20, 36, 37, 58, 5, 43, 49, 64, 81, 30, 8, 21, 98, 75, 60, 17, 50, 42, 27, 38, 90, 74, 45, 68, 67, 27, 31, 15, 58, 76, 41, 99, 23, 98, 53, 98, 56, 19, 79, 2, 4, 38, 96, 24, 65, 51, 43, 42, 41, 60, 46, 7, 90, 65, 3, 27, 63, 99, 51, 44, 86, 1, 54, 40, 15, 74, 3, 81, 51, 63, 87, 79, 84, 72, 22, 38, 96, 95, 33, 41, 21, 99, 21, 69, 7, 49, 40, 52, 41, 6, 91, 19, 76, 40, 54, 17, 33, 11, 11, 0, 1, 32, 94, 33, 13, 18, 45, 7, 85, 61, 42, 54, 45, 72, 78, 96, 17, 9, 80, 87, 41, 96, 66, 0, 8, 59, 18, 21, 2, 28, 64, 75, 97, 32, 80, 86, 97, 97, 55, 2, 73, 75, 11, 89, 67, 58, 70, 76, 12, 46, 64, 17, 22, 97, 25, 35, 93, 57, 82, 46, 57, 61, 31, 74, 27, 4, 32, 85, 53, 86, 53, 53, 42, 5, 28, 50, 65, 63, 70, 61, 73, 37, 13, 80, 7, 34, 22, 3, 26, 6, 62, 78, 12, 56, 87, 41, 58, 64, 31, 27, 45, 35, 18, 66, 62, 43, 89, 69, 94, 93, 33, 74, 2, 43, 85, 37, 82, 41, 74, 9, 15, 44, 33, 42, 65, 19, 1, 49, 78, 12, 29, 9, 78, 7, 55, 12, 45, 40, 33, 16, 86, 14, 52, 16, 73, 76, 0, 98, 75, 91, 78, 46, 99, 95, 90, 69, 78, 45, 62, 55, 37, 88, 49, 77, 27, 83, 38, 73, 39, 1, 75, 40, 65, 83, 54, 95, 7, 73, 4, 30, 26, 36, 89, 21, 5, 95, 11, 14, 87, 45, 36, 21, 77, 55, 5, 66, 51, 98, 48, 62, 74, 58, 23, 82, 30, 28, 19, 53, 89, 76, 98, 8, 34, 70, 28, 54, 16, 52, 35, 93, 54, 54, 72, 49, 18, 93, 72, 90, 71, 73, 15, 60, 38, 80, 76, 53, 70, 39, 69, 25, 5, 31, 61, 46, 6, 54, 34, 31, 52, 33, 36, 79, 76, 44, 29, 28, 38, 1, 66, 2, 90, 91, 1, 76, 78, 31, 55, 37, 71, 2, 3, 38, 85, 0, 95, 42, 2, 39, 57, 87, 61, 77, 98, 2, 24, 80, 48, 27, 47, 71, 15, 7, 49, 60, 86, 3, 2, 29, 38, 54, 36, 59, 83, 27, 47, 9, 36, 42, 8, 73, 85, 9, 16, 73, 60, 39, 12, 43, 25, 23, 29, 28, 47, 40, 77, 20, 89, 22, 30, 41, 59, 96, 19, 56, 20, 76, 73, 39, 46, 72, 40, 47, 37, 52, 29, 79, 37, 39, 50, 41, 87, 66, 17, 75, 31, 45, 26, 88, 70, 11, 90, 40, 74, 9, 32, 65, 72, 61, 6, 93, 54, 15, 84, 22, 99, 47, 10, 96, 4, 84, 19, 85, 73, 45, 25, 16, 8, 94, 99, 39, 28, 26, 68, 87, 48, 1, 65, 86, 46, 86, 7, 60, 82, 45, 75, 38, 56, 41, 35, 30, 86, 91, 97, 85, 45, 5, 14, 69, 85, 96, 37, 18, 26, 16, 38, 16, 1, 44, 94, 85, 58, 60, 20, 5, 47, 52, 41, 50, 71, 43, 42, 67, 64, 38, 65, 83, 99, 78, 96, 33, 20, 98, 24, 6, 2, 25, 16, 16, 44, 63, 24, 68, 56, 49, 91, 15, 59, 99, 27, 43, 34, 28, 36, 45, 1, 10, 19, 54, 26, 75, 17, 88, 96, 63, 24, 71, 93, 72, 97, 66, 87, 18, 86];
    this.randomCache = {};
    this.rndIndex = 0;
  }
  /**
   * Returns next pseudo random integer number from sequence between 0 and max parameter value (99 is maximum value)
   * @param {Number} max max value
   * @returns {Number}
   */

  nextRandom(max) {
    let randomCache = this.randomCache,
        randomNumbers;

    if (randomCache[max]) {
      randomNumbers = randomCache[max];
    } else {
      randomNumbers = this.random100.filter(num => num < max);
      randomCache[max] = randomNumbers;
    }

    return randomNumbers[this.rndIndex++ % randomNumbers.length];
  }
  /**
   * Resets sequence to initial number
   */

  reset() {
    this.rndIndex = 0;
  }
  /**
   * Returns pseudo random array element
   * @param {Array} array input array
   * @returns {*}
   */

  fromArray(array) {
    return array[this.nextRandom(array.length)];
  }

}
RandomGenerator._$name = 'RandomGenerator';

/**
 * @module Core/util/Parser
 */
// Tools. Maybe move it to memoization module.

let nextObjectIdentity = 0;
const objectIdentityMap = new WeakMap();

const argsToCacheKey = (...args) => args.map(arg => {
  let result;

  if (arg && typeof arg == 'object' || typeof arg == 'function') {
    result = objectIdentityMap.get(arg);

    if (result === undefined) {
      result = ++nextObjectIdentity;
      objectIdentityMap.set(arg, result);
    }
  } else {
    result = String(arg);
  }

  return result;
}).join('-');
/**
 * Generic memoization function. Wraps `fn` into higher order function which caches `fn` result
 * using stringified arguments as the cache key.
 *
 * @param {Function} fn function to memoize
 */

const memo = fn => {
  const mlist = new Map();
  return (...args) => {
    const mkey = argsToCacheKey(args);
    let result = mlist.get(mkey);

    if (result === undefined) {
      result = fn(...args);
      mlist.set(mkey, result);
    }

    return result;
  };
};
/**
 * Specific memoization function caches `fn` calls. `fn` should receive 2 arguments, the first one
 * is a string, and the second one is a callback which should be called by `fn` with some result.
 * The function returned wraps `fn` and it's callback such that `fn` would be called only once
 * with a particular first argument, other time callback will be called instantly with the result cached.
 *
 * @param {Function} fn function to memoize
 */

const memoCps = fn => {
  const table = new Map(),
        entryContinuations = entry => entry[0],
        entryResults = entry => entry[1],
        pushContinuation = (entry, cont) => entryContinuations(entry).push(cont),
        pushResult = (entry, result) => entryResults(entry).push(result),
        isResultSubsumed = (entry, result) => entryResults(entry).some(r => ObjectHelper.isEqual(r, result)),
        makeEntry = () => [[], []],
        isEmptyEntry = entry => !entryResults(entry).length && !entryContinuations(entry).length,
        tableRef = str => {
    let entry = table.get(str);

    if (entry === undefined) {
      entry = makeEntry();
      table.set(str, entry);
    }

    return entry;
  };

  return (str, cont) => {
    const entry = tableRef(str);

    if (isEmptyEntry(entry)) {
      pushContinuation(entry, cont);
      fn(str, result => {
        if (!isResultSubsumed(entry, result)) {
          pushResult(entry, result);
          entryContinuations(entry).forEach(cont => cont(result));
        }
      });
    } else {
      pushContinuation(entry, cont);
      entryResults(entry).forEach(result => cont(result));
    }
  };
}; // End of tools

const SUCCESS = Symbol('success');
const FAILURE = Symbol('failure');
/**
 * Successful parsing result. Represented as array with 3 items:
 * - SUCCESS symbol which can be checked with {@link #function-isSuccess} function.
 * - Parsed payload
 * - Rest string left to parse
 *
 * @typedef {Array} SuccessResult
 */

/**
 * Creates successful parsing result with parsed `val` and unparsed `rest`
 *
 * @param {String} val Parsed value
 * @param {String} rest Unparsed rest
 * @return {SuccessResult}
 */

const success = (val, rest) => [SUCCESS, val, rest];
/**
 * Failure parsing result. Represented as array with 2 items:
 * - FAILURE symbol which can be checked with {@link #function-isSuccess} function
 * - Rest string left to parse
 *
 * @typedef {Array} FailureResult
 */

/**
 * Creates failed parsing result with unparsed `rest`
 *
 * @param {String} rest Unparsed rest
 * @return {FailureResult}
 */

const failure = rest => [FAILURE, rest];
/**
 * Checks if the given parsing `result` is successful
 *
 * @param {SuccessfulResult|FailureResult} result
 */

const isSuccess = result => result.length && result[0] === SUCCESS;
/**
 * Resolves parser when needed. Parser should be resolved if it's defined as a function
 * with no arguments which returns the actual parser function with more then one argument.
 *
 * @param {Function} p Parser factory
 * @return {Function} Combinable parser function
 */

const resolveParser = p => typeof p === 'function' && !p.length ? p() : p;
/**
 * Returns combinable parser which always return successful parsing result with `val`
 * as parsed result and string parsed as `rest`.
 *
 * @param {*} val Successful parsing result parsed payload
 * @return {Function} Combinable parser function
 *
 * @example
 * const sp = succeed('Ok');
 * sp('My string', (r) => console.dir(r)) // Will output successful parsing result with `Ok` payload and `My string` rest.
 */

const succeed = memo(val => memoCps((str, cont) => cont(success(val, str))));
/**
 * Returns combinable parser which succeeds if string parsed starts with `match`. The parsing
 * result will contain `match` as parsed result and rest of the string characters,
 * the ones after `match` as the unparsed rest.
 *
 * @param {String} match String to match
 * @return {Function} Combinable parser function
 *
 * @example
 * const mp = string('My');
 * mp('My string', (r) => console.dir(r)); // Will output successful parsing result with `My` payload and `string` rest.
 */

const string = memo(match => memoCps((str, cont) => {
  const len = Math.min(match.length, str.length),
        head = str.substr(0, len),
        tail = str.substr(len);
  cont(head === match ? success(head, tail) : failure(tail));
}));
/**
 * Binds parser or parser factory with a `fn` function which should receive one string argument
 * and return a combinable parser function.
 *
 * @param {Function} p Combinable parser function or combinable parser factory which can be
 *                     resolved using with {@link #function-resolveParser}.
 * @param {Function} fn A function receiving one string argument and returning combinable parser function.
 *
 * @internal
 */

const bind = (p, fn) => (str, cont) => resolveParser(p)(str, result => {
  if (isSuccess(result)) {
    const [, val, rest] = result;
    fn(val)(rest, cont);
  } else {
    cont(result);
  }
});
/**
 * Combines several combined parser functions or combinable parser factories in sequence such that second starts after first succeeds
 * third after second etc, if first fails then second will not be called and so on.
 *
 * @param {...Function} parsers Combinable parser function or combinable parser factory which can be
 *                      resolved using with {@link #function-resolveParser}.
 * @returns {Function} Combinable parser function
 *
 * @example
 * const ab = seq(string('a'), string('b'));
 * ab('abc', (r) => console.dir(r)); // Will output successful parsing result with `ab` as parsed payload and `c` as the rest.
 */

const seq = memo((...parsers) => {
  const seq2 = memo((a, b) => memoCps(bind(a, x => bind(b, y => succeed([].concat(x, y))))));
  return parsers.reduce(seq2, succeed([]));
});
/**
 * Combines several combined parser functions or combinable parser factories in alteration such that successful parsing result will be passed into
 * a callback if one of those parsers succeeds.
 *
 * @param {...Function} parsers Combinable parser function or combinable parser factory which can be
 *                      resolved using with {@link #function-resolveParser}.
 * @returns {Function} Combinable parser function
 *
 * @example
 * const aorb = alt(string('a'), string('b'));
 * aorb('abc', (r) => console.dir(r)); // Will output successful parsing result with `a` as parsed payload and `bc` as the rest.
 * aorb('bbc', (r) => console.dir(r)); // Will output successfull parsing result with `b` as parsed payload and `bc` as the rest.
 */

const alt = memo((...parsers) => memoCps((str, cont) => parsers.forEach(p => resolveParser(p)(str, cont))));
/**
 * Creates combinable parser which succeeds if string to parse starts from a substring which succeeds for the regular expression
 * `pattern` the parser is created with.
 *
 * @param {String} pattern Regular expression pattern
 * @return {Function} Combinable parser function
 *
 * @example
 * const rp = regexp('a+');
 * rp('aaabb', (r) => console.dir(r)); // Will output successful parsing result with `aaa` as parsed payload and `bb` as the rest.
 */

const regexp = memo(pattern => (str, cont) => {
  const rexp = new RegExp(`^${pattern}`),
        match = rexp.exec(str);

  if (match) {
    const head = match[0],
          tail = str.substr(head.length);
    cont(success(head, tail));
  } else {
    cont(failure(str));
  }
});
/**
 * Creates reducing combinable parser function which should be used to create semantic actions
 * on parsed results.
 *
 * @param {Function} p Combinable parser function or combinable parser factory which can be
 *                     resolved using with {@link #function-resolveParser}.
 * @param {Function} fn Semantic action function should be the same arity as the successful result arity
 *                      of `p` parser.
 * @return {Function} Combinable parser function
 *
 * @example
 * const nump = red(
 *     regexp('\d'),
 *     Number
 * );
 *
 * const plusp = string('+');
 *
 * const sump = red(
 *     seq(nump, plusp, nump),
 *     (a, _, b) => a + b
 * );
 *
 * sump('7+8', (r) => console.dir(r)); // Will return successful parsing result with `15` as parsing payload and `` as rest.
 */

const red = memo((p, fn) => bind(p, (...val) => succeed(fn(...[].concat.apply([], val)))));
/**
 * Runs combinable parsing function returning totally parsed results only, i.e. such results which have
 * parsed the `str` string completely.
 *
 * @param {Function} body Combinable parser function
 * @param {String} str String to parse
 * @return {SuccessfulResult[]} All totally parsed results possible for the given parsing function.
 */

const runParser = (body, str) => {
  const results = [];
  body(str, result => {
    if (isSuccess(result)) {
      const [,, left] = result;

      if (left === '') {
        results.push(result);
      }
    }
  });
  return results;
};
/**
 * Helper function for combinable parser definition supplements combinable parser function
 * returning a higher order function which when called with 2 arguments (string to parse and
 * a callback function) behaves exactly like parser function, but when called with 1 argument
 * it wraps call to parser function with {@link function-runParser} thus returning array of
 * totally parsed results.
 *
 * @param {Function} body Combinable parser function
 */

const defineParser = body => (str, cont) => cont ? resolveParser(body)(str, cont) : runParser(resolveParser(body), str); //Combines exports in an object such that it was possible to export parser utilities
// in UMD/module bundles.

var Parser = {
  memo,
  memoCps,
  success,
  failure,
  isSuccess,
  resolveParser,
  succeed,
  string,
  bind,
  seq,
  alt,
  regexp,
  red,
  runParser,
  defineParser
};

/**
 * @module Core/widget/TextAreaPickerField
 */

/**
 * TextAreaPickerField is a picker field with a drop down showing a `textarea` element for multiline text input. See also
 * {@link Core.widget.TextAreaField}.
 *
 *
 * ```javascript
 * let textAreaField = new TextAreaPickerField({
 *   placeholder: 'Enter some text'
 * });
 *```
 *
 * This field can be used as an {@link Grid.column.Column#config-editor editor} for {@link Grid.column.Column Columns}.
 *
 * @extends Core/widget/PickerField
 * @classType textareapickerfield
 * @inlineexample Core/widget/TextAreaPickerField.js
 */

class TextAreaPickerField extends PickerField {
  static get $name() {
    return 'TextAreaPickerField';
  } // Factoryable type name

  static get type() {
    return 'textareapickerfield';
  }

  static get configurable() {
    return {
      picker: {
        type: 'widget',
        tag: 'textarea',
        cls: 'b-textareapickerfield-picker',
        scrollAction: 'realign',
        align: {
          align: 't-b',
          axisLock: true
        },
        autoShow: false
      },
      triggers: {
        expand: {
          cls: 'b-icon-picker',
          handler: 'onTriggerClick'
        }
      },

      /**
       * The resize style to apply to the `<textarea>` element.
       * @config {String}
       * @default
       */
      resize: 'none',
      inputType: null
    };
  }

  startConfigure(config) {
    if (typeof config.inline === 'boolean') {
      VersionHelper.deprecate('Core', '6.0.0', 'TextAreaPickerField.inline config is no longer supported');
    }

    super.startConfigure(config);
  }

  get inputElement() {
    const result = super.inputElement;
    result.readOnly = 'readonly';
    result.reference = 'displayElement';
    this.ariaElement = 'displayElement';
    return result;
  }

  get focusElement() {
    return this._picker && this._picker.isVisible ? this.input : this.displayElement;
  }

  showPicker() {
    const me = this,
          {
      picker
    } = me; // Block picker if inline

    if (!me.inline) {
      picker.width = me.pickerWidth || me[me.pickerAlignElement].offsetWidth; // Always focus the picker.

      super.showPicker(true);
    }
  }

  focusPicker() {
    this.input.focus();
  }

  onPickerKeyDown(keyEvent) {
    const me = this,
          realInput = me.input;

    switch (keyEvent.key.trim() || keyEvent.code) {
      case 'Escape':
        // TODO: revert value?
        me.picker.hide();
        return;

      case 'Enter':
        if (keyEvent.ctrlKey) {
          me.syncInputFieldValue();
          me.picker.hide();
        }

        break;
    } // Super's onPickerKeyDown fires through this.input, so avoid infinite recursion
    // by redirecting it through the displayElement.

    me.input = me.displayElement;
    const result = super.onPickerKeyDown(keyEvent);
    me.input = realInput;
    return result;
  }

  syncInputFieldValue(skipHighlight) {
    if (this.displayElement) {
      this.displayElement.value = this.inputValue;
    }

    super.syncInputFieldValue(skipHighlight);
  }

  changeValue(value) {
    return value == null ? '' : value;
  }

  changePicker(picker, oldPicker) {
    var _picker, _me$value;

    const me = this,
          pickerWidth = me.pickerWidth || ((_picker = picker) === null || _picker === void 0 ? void 0 : _picker.width);
    picker = TextAreaPickerField.reconfigure(oldPicker, picker ? Objects.merge({
      owner: me,
      forElement: me[me.pickerAlignElement],
      align: {
        matchSize: pickerWidth == null,
        anchor: me.overlayAnchor,
        target: me[me.pickerAlignElement]
      },
      id: me.id + '-input',
      style: {
        resize: me.resize
      },
      html: (_me$value = me.value) !== null && _me$value !== void 0 ? _me$value : ''
    }, picker) : null, me); // May have been set to null (destroyed)

    if (picker) {
      const input = me.input = picker.element;
      me.inputListenerRemover = EventHelper.on({
        element: input,
        thisObj: me,
        focus: 'internalOnInputFocus',
        change: 'internalOnChange',
        input: 'internalOnInput',
        keydown: 'internalOnKeyEvent',
        keypress: 'internalOnKeyEvent',
        keyup: 'internalOnKeyEvent'
      });
    }

    return picker;
  }

} // Register this widget type with its Factory

TextAreaPickerField.initClass();
TextAreaPickerField._$name = 'TextAreaPickerField';

export { Parser, RandomGenerator, TextAreaPickerField, XMLHelper };
//# sourceMappingURL=TextAreaPickerField.js.map
