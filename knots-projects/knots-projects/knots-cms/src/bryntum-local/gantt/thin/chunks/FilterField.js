/*!
 *
 * Bryntum Gantt 5.0.1
 *
 * Copyright(c) 2022 Bryntum AB
 * https://bryntum.com/contact
 * https://bryntum.com/license
 *
 */
import { Base, _objectSpread2, DynamicObject, TextField } from './Editor.js';

/**
 * @module Core/mixin/Featureable
 */

/**
 * This mixin provides management of a set of features that can be manipulated via the `features` config.
 *
 * The first step in using `Featureable` is to define the family of features using `Factoryable` to declare a base
 * class for features to extend:
 * ```
 *  class SuperWidgetFeature extends InstancePlugin.mixin(Factoryable) {
 *      static get factoryable() {
 *          //
 *      }
 *  }
 * ```
 *
 * The various feature classes extend the `SuperWidgetFeature` base class and call `initClass()` to register themselves:
 * ```
 *  export default class AmazingSuperWidgetFeature extends SuperWidgetFeature {
 *      static get type() {
 *          return 'amazing';
 *      }
 *  }
 *
 *  AmazingSuperWidgetFeature.initClass();
 * ```
 *
 * A class that supports these features via `Featureable` is declared like so:
 * ```
 *  class SuperWidget extends Widget.mixin(Featureable) {
 *      static get featureable() {
 *          return {
 *              factory : SuperWidgetFeature
 *          };
 *      }
 *
 *      static get configurable() {
 *          return {
 *              // Declare the default features. These can be disabled by setting them to a falsy value. Using
 *              // configurable(), the value defined by this class is merged with values defined by derived classes
 *              // and ultimately the instance.
 *              features : {
 *                  amazing : {
 *                      ...
 *                  }
 *              }
 *          };
 *      }
 *  }
 *```
 * @mixin
 * @internal
 */

var Featureable = (Target => class Featureable extends (Target || Base) {
  static get $name() {
    return 'Featureable';
  }

  static get configurable() {
    return {
      /**
       * Specifies the features to create and associated with the instance. The keys of this object are the names
       * of features. The values are config objects for those feature instances.
       *
       * After construction, this property can be used to access the feature instances and even reconfigure them.
       *
       * For example:
       * ```
       *  instance.features.amazing = {
       *      // reconfigure this feature
       *  }
       * ```
       * This can also be done in bulk:
       * ```
       *  instance.features = {
       *      amazing : {
       *          // reconfigure this feature
       *      },
       *      // reconfigure other features
       *  }
       * ```
       * @config {Object}
       */
      features: null
    };
  }

  static get declarable() {
    return [
    /**
     * This property getter returns options that control feature management for the derived class. This
     * property getter must be defined by the class that mixes in `Featureable` in order to initialize the
     * class properly.
     * ```
     *  class SuperWidget extends Widget.mixin(Featureable) {
     *      static get featureable() {
     *          return {
     *              factory : SuperWidgetFeature
     *          };
     *      }
     *      ...
     *  }
     * ```
     * @static
     * @member {Object} featureable
     * @property {Core.mixin.Factoryable} featureable.factory The factoryable class (not one of its instances)
     * that will be used to create feature instances.
     * @property {String} [featureable.ownerName='client'] The config or property to assign on each feature as
     * a reference to its creator, the `Featureable` instance.
     * @internal
     */
    'featureable'];
  }

  static setupFeatureable(cls) {
    const featureable = _objectSpread2({
      ownerName: 'client'
    }, cls.featureable);

    featureable.factory.initClass(); // Replace the class/static getter with a new one that returns the complete featureable object:

    Reflect.defineProperty(cls, 'featureable', {
      get() {
        return featureable;
      }

    });
  }

  doDestroy() {
    const features = this.features;
    super.doDestroy();

    for (const name in features) {
      var _feature$destroy;

      const feature = features[name]; // Feature might be false or destroyed already by Grid (EventList mixes in CalendarMixin which has this mixin)

      (_feature$destroy = feature.destroy) === null || _feature$destroy === void 0 ? void 0 : _feature$destroy.call(feature);
    }
  }
  /**
   * Returns `true` if the specified feature is active for this instance and `false` otherwise.
   * @param {String} name The feature name
   * @returns {Boolean}
   */

  hasFeature(name) {
    var _this$features;

    return Boolean((_this$features = this.features) === null || _this$features === void 0 ? void 0 : _this$features[name]);
  }

  changeFeatures(features, was) {
    if (this.isDestroying) {
      return;
    }

    const me = this,
          {
      featureable
    } = me.constructor,
          manager = me.$features || (me.$features = new DynamicObject({
      configName: 'features',
      factory: featureable.factory,
      owner: me,
      ownerName: featureable.ownerName
    }));
    manager.update(features);

    if (!was) {
      // Only return the target once. Further calls are processed above so we need to return undefined to ensure
      // onConfigChange is called. By returning the same target on 2nd+ call, it passes the === test and won't
      // trigger onConfigChange.
      return manager.target;
    }
  } // This does not need a className on Widgets.
  // Each *Class* which doesn't need 'b-' + constructor.name.toLowerCase() automatically adding
  // to the Widget it's mixed in to should implement thus.

  get widgetClass() {}

  getCurrentConfig(options) {
    const result = super.getCurrentConfig(options),
          {
      features
    } = result;

    if (features) {
      // Replace empty configs with `true`
      for (const featureName in features) {
        if (Object.keys(features[featureName]).length === 0) {
          features[featureName] = true;
        }
      }
    }

    return result;
  }

});

/**
 * @module Core/widget/FilterField
 */

/**
 * A simple text field for filtering a store.
 *
 * Allows filtering by {@link #config-field field}:
 *
 * ```javascript
 * const filterField = new FilterField({
 *    store : eventStore,
 *    field : 'name'
 * });
 * ```
 *
 * Or by using a {@link #config-filterFunction filter function} for greater control/custom logic:
 *
 * ```javascript
 * const filterField = new FilterField({
 *    store          : eventStore,
 *    filterFunction : (record, value) => record.name.includes(value)
 * });
 * ```
 *
 * @extends Core/widget/TextField
 * @classType filterfield
 */

class FilterField extends TextField {
  static get $name() {
    return 'FilterField';
  } // Factoryable type name

  static get type() {
    return 'filterfield';
  }

  static get configurable() {
    return {
      /**
       * The model field name to filter by. Can optionally be replaced by {@link #config-filterFunction}
       * @config {String}
       * @category Filtering
       */
      field: null,

      /**
       * The store to filter.
       * @config {Core.data.Store}
       * @category Filtering
       */
      store: null,

      /**
       * Optional filter function to be called with record and value as parameters for store filtering.
       * ```javascript
       * {
       *     type           : 'filterfield',
       *     store          : myStore,
       *     filterFunction : (record, value)  => {
       *        return record.text.includes(value);
       *     }
       * }
       * ```
       * @param {Core.data.Model} record Record for comparison
       * @param {String} value Value to compare with
       * @return {Boolean} Return true if record matches comparison requirements
       * @config {Function}
       * @category Filtering
       */
      filterFunction: null,
      clearable: true,
      keyStrokeChangeDelay: 100,

      onChange({
        value
      }) {
        const {
          store,
          field,
          filterFunction
        } = this;

        if (store) {
          const filterId = `${field || this.id}-Filter`;

          if (value.length === 0) {
            store.removeFilter(filterId);
          } else {
            let filterBy;

            if (filterFunction) {
              filterBy = record => filterFunction(record, value);
            } else {
              // We filter using a RegExp, so quote significant characters
              value = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

              filterBy = record => record.get(field).match(new RegExp(value, 'i'));
            } // A filter with an id replaces any previous filter with that id.
            // Leave any other filters which may be in use in place.

            store.filter({
              id: filterId,
              filterBy
            });
          }
        }
      }

    };
  }

  updateValue(value, old) {
    super.updateValue(value, old); // Initial value, apply it

    if (value && this.isConfiguring) {
      this.onChange({
        value
      });
    }
  }

}
FilterField.initClass();
FilterField._$name = 'FilterField';

export { Featureable, FilterField };
//# sourceMappingURL=FilterField.js.map
