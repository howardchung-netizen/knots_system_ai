/**
 * @module Gantt/data/Wbs
 */

const zeroPad = v => String(v).padStart(6, '0');

/**
 * This class holds a WBS (Work Breakdown Structure) value (e.g., '1.2.1'). This class ensures that such values compare
 * correctly, for example, that '1.2' is less than '1.10' (which do not compare that way as simple text).
 */
export default class Wbs {

    /**
     * Wbs constructor.
     * @param {String|Number} value The value of WBS
     */
    constructor(value) {
        this.value = value;
        this._padded = null;
    }

    /**
     * The WBS value
     * @readonly
     * @member {String} value
     */
    set value(value) {
        this._value = String(value ?? '');
    }

    get value() {
        return this._value;
    }

    /**
     * Returns a `Wbs` instance given a `value`. If the `value` is already a `Wbs` object, it is returned. Otherwise,
     * a new `Wbs` is created. If `value` is `null` or `undefined`, that value is returned.
     * @param {String|Number|Gantt.data.Wbs} value
     * @returns {Gantt.data.Wbs}
     */
    static from(value) {
        // this must preserve null to be useful as a data field, where a null value means no value present.
        return (value == null) ? value : ((value instanceof Wbs) ? value : new Wbs(value));
    }

    /**
     * Returns a WBS code where each component is 0-padded on the left to 6 digits. That is "1.2" is padded to be
     * "000001.000002". These values can be compared for proper semantic order (e.g., Wbs.pad('1.2') < Wbs.pad('1.10')).
     * @param {String|Number|Gantt.data.Wbs} value
     * @returns {String}
     * @private
     */
    static pad(value) {
        return (value instanceof Wbs) ? value.valueOf() : Wbs.split(value).map(zeroPad).join('.');
    }

    /**
     * Returns an array of digits from a given WBS code `value`. If the value cannot be converted, an empty array is
     * returned.
     * @param {String|Number|Gantt.data.Wbs} value
     * @returns {Number[]}
     * @private
     */
    static split(value) {
        let i, ret;

        if (value || value === 0) {
            switch (typeof value) {
                case 'object':
                    value = String(value);
                // noinspection FallThroughInSwitchStatementJS
                case 'string': // eslint-disable-line no-fallthrough
                    ret = value.split('.');

                    for (i = ret.length; i-- > 0; /* empty */) {
                        ret[i] = parseInt(ret[i], 10);
                    }
                    break;

                case 'number':
                    ret = [value];
                    break;
            }
        }

        return ret || [];
    }

    /**
     * Compares two WBS values, returning 0 if equal, -1 if `lhs` is less than `rhs, or 1 if `lhs` is greater than `rhs`.
     * @param {String|Gantt.data.Wbs} lhs
     * @param {String|Gantt.data.Wbs} rhs
     * @returns {Number}
     */
    static compare(lhs, rhs) {
        if (lhs === rhs) {
            return 0;
        }

        if (!lhs || !rhs) {
            return lhs ? 1 : (rhs ? -1 : 0);
        }

        lhs = Wbs.pad(lhs);
        rhs = Wbs.pad(rhs);

        return (lhs < rhs) ? -1 : ((rhs < lhs) ? 1 : 0);
    }

    /**
     * Appends a sub-level WBS value to this WBS code and returns a `Wbs` instance for it.
     * @param {String|Number} value
     * @returns {Gantt.data.Wbs}
     */
    append(value) {
        const s = this.value;

        return Wbs.from(s ? `${s}.${value}` : value);
    }

    /**
     * Returns truthy value if this Wbs equals the passed value.
     * @param {String|Gantt.data.Wbs} value
     * @return {Boolean}
     */
    isEqual(value) {
        return !Wbs.compare(this, value);
    }

    /**
     * Compares this WBS value with a specified pattern, returning `true` if they match. If the `pattern` is simply a
     * sequence of digits and decimal points (e.g., "1.2"), it is a match if it is a substring of this WBS code (e.g.,
     * "3.1.2.4"). If the `pattern` starts with `*` (e.g., "*.1.2"), it is a match if this WBS code ends with the text
     * following the `*` (e.g., "4.3.1.2"). If the `pattern` ends with `*`, it is a match if this WBS code starts with
     * the text up to the `*`.
     *
     * Some examples:
     * ```
     *  console.log(Wbs.from('1.2.3.4').match('2.3'));
     *  > true
     *  console.log(Wbs.from('1.2.3.4').match('*.4'));
     *  > true
     *  console.log(Wbs.from('1.2.3.4').match('1.2.*'));
     *  > true
     *
     *  console.log(Wbs.from('1.2.3.4').match('2.4'));
     *  > false
     *  console.log(Wbs.from('1.2.3.4').match('*.3'));
     *  > false
     *  console.log(Wbs.from('1.2.3.4').match('2.*'));
     *  > false
     * ```
     * @param {String} pattern A partial WBS code (e.g., "1.2"), optionally starting or ending with `*`.
     * @returns {Boolean}
     */
    match(pattern) {
        let ret = false;

        if (pattern) {
            const
                wbs = this.value,
                globLeft = pattern[0] === '*',
                globRight = pattern.endsWith('*'),
                n = pattern.length;

            if (globLeft === globRight) {
                // no globs behavior is the same as both globs ('1.2' is the same as '*1.2*')
                ret = wbs.indexOf(globLeft ? pattern.substr(1, n - 2) : pattern) > -1;
            }
            else if (globLeft) {
                ret = wbs.endsWith(pattern.substr(1));
            }
            else {
                ret = wbs.startsWith(pattern.substr(0, n - 1));
            }
        }

        return ret;
    }

    toString() {
        return this.value;
    }

    toJSON() {
        return this.toString();
    }

    valueOf() {
        // the value we return is implicitly used by < and > operators when comparing instances of this type, so we
        // need to return a value that makes "1.2 < 1.10" evaluate as true:
        return this._padded ?? (this._padded = Wbs.pad(this.value));
    }
}
