/*!
 *
 * Bryntum Gantt 5.0.1
 *
 * Copyright(c) 2022 Bryntum AB
 * https://bryntum.com/contact
 * https://bryntum.com/license
 *
 */
import { Base, Delayable, Events, Identifiable, EventHelper, DomDataStore, DomHelper, Objects, Factoryable, ObjectHelper, Tooltip, _objectSpread2 } from './Editor.js';

/**
 * @module Core/data/stm/action/ActionBase
 */

const throwAbstractMethodCall$1 = () => {
  throw new Error('Abstract method call!');
};
/**
 * Base class for STM actions.
 *
 * @abstract
 */

class ActionBase extends Base {
  /**
   * Gets the type of the action (stringified class name).
   * @readonly
   * @property {String}
   */
  get type() {
    return this.constructor.name;
  }
  /**
   * Undoes an action
   */

  undo() {
    throwAbstractMethodCall$1();
  }
  /**
   * Redoes an action
   */

  redo() {
    throwAbstractMethodCall$1();
  }

}
ActionBase._$name = 'ActionBase';

/**
 * @module Core/data/stm/state/StateBase
 */
const throwAbstractMethodCall = () => {
  throw new Error('Abstract method call!');
};
const throwInvalidMethodCall = () => {
  throw new Error('Method cannot be called at this state!');
};
/**
 * Abstract class for STM states
 *
 * Every on* method should return a state for the STM which it should switch to
 * or throw an exception that this call at this state is illegal.
 *
 * Interface of this class mirrors interface of {@link Core.data.stm.StateTrackingManager}.
 *
 * @abstract
 */

class StateBase extends Base {
  canUndo(stm) {
    throwAbstractMethodCall();
  }

  canRedo(stm) {
    throwAbstractMethodCall();
  }

  onUndo(stm) {
    throwAbstractMethodCall();
  }

  onRedo(stm) {
    throwAbstractMethodCall();
  }

  onStartTransaction(stm) {
    throwAbstractMethodCall();
  }

  onStopTransaction(stm) {
    throwAbstractMethodCall();
  }

  onStopTransactionDelayed(stm) {
    throwAbstractMethodCall();
  }

  onRejectTransaction(stm) {
    throwAbstractMethodCall();
  }

  onEnable(stm) {
    throwAbstractMethodCall();
  }

  onDisable(stm) {
    throwAbstractMethodCall();
  }

  onAutoRecordOn(stm) {
    throwAbstractMethodCall();
  }

  onAutoRecordOff(stm) {
    throwAbstractMethodCall();
  }

  onResetQueue(stm) {
    throwAbstractMethodCall();
  }

  onModelUpdate(stm) {
    throwAbstractMethodCall();
  }

  onStoreModelAdd(stm) {
    throwAbstractMethodCall();
  }

  onStoreModelInsert(stm) {
    throwAbstractMethodCall();
  }

  onStoreModelRemove(stm) {
    throwAbstractMethodCall();
  }

  onStoreModelRemoveAll(stm) {
    throwAbstractMethodCall();
  }

  onModelInsertChild(stm) {
    throwAbstractMethodCall();
  }

  onModelRemoveChild(stm) {
    throwAbstractMethodCall();
  }

}
StateBase._$name = 'StateBase';

/**
 * @module Core/data/stm/Props.js
 * @internal
 */
const STATE_PROP = Symbol('STATE_PROP');
const STORES_PROP = Symbol('STORES_PROP');
const QUEUE_PROP = Symbol('QUEUE_PROP');
const POS_PROP = Symbol('POS_PROP');
const TRANSACTION_PROP = Symbol('TRANSACTION_PROP');
const TRANSACTION_TIMER_PROP = Symbol('TRANSACTION_TIMER_PROP');
const AUTO_RECORD_PROP = Symbol('AUTO_RECORD_PROP');
Object.freeze([STATE_PROP, STORES_PROP, QUEUE_PROP, POS_PROP, TRANSACTION_PROP, TRANSACTION_TIMER_PROP, AUTO_RECORD_PROP]);

/**
 * @module Core/data/stm/state/Registry
 *
 * Provides map of registered STM states.
 *
 * Needed to remove states circular dependency.
 *
 * @internal
 */

const registry = new Map();
/**
 * Registers STM state class with the given name.
 *
 * @private
 *
 * @param {String} name
 * @param {Core.data.stm.state.StateBase} state
 */

const registerStmState = (name, state) => {
  registry.set(name, state);
};
/**
 * Resolves STM state class with the given name.
 *
 * @private
 *
 * @param {String} name
 * @return {Core.data.stm.state.StateBase} state
 */

const resolveStmState = state => {
  if (typeof state === 'string') {
    state = registry.get(state);
  }

  return state;
}; // UMD/module compatible export
// NOTE: the most compatible way of exporting is:
//       import registry from './Registry.js';
//       { registerStmState, resolveStmState } = registry;
//          or
//       registry.registerStmState(...);

var Registry = {
  registerStmState,
  resolveStmState
};

const resetQueue = (stm, options) => {
  const {
    undo,
    redo
  } = options;
  let newProps;

  if (undo && !redo) {
    newProps = {
      [QUEUE_PROP]: stm[QUEUE_PROP].slice(stm.position),
      [POS_PROP]: 0
    };
  } else if (redo && !undo) {
    newProps = {
      [QUEUE_PROP]: stm[QUEUE_PROP].slice(0, stm.position)
    };
  } else {
    newProps = {
      [QUEUE_PROP]: [],
      [POS_PROP]: 0
    };
  }
  return [newProps, () => {
    stm.notifyStoresAboutQueueReset(options);
  }];
};

/**
 * @module Core/data/stm/state/DisabledState
 */
/**
 * STM disabled state class.
 *
 * @internal
 */

class DisabledStateClass extends StateBase {
  canUndo() {
    return false;
  }

  canRedo() {
    return false;
  }

  onUndo() {
    throwInvalidMethodCall();
  }

  onRedo() {
    throwInvalidMethodCall();
  }

  onEnable(stm) {
    return stm.autoRecord ? 'autoreadystate' : 'readystate';
  }

  onDisable() {
    throwInvalidMethodCall();
  }

  onAutoRecordOn() {
    return {
      [AUTO_RECORD_PROP]: true
    };
  }

  onAutoRecordOff() {
    return {
      [AUTO_RECORD_PROP]: false
    };
  }

  onStartTransaction() {
    throwInvalidMethodCall();
  }

  onStopTransaction() {
    throwInvalidMethodCall();
  }

  onStopTransactionDelayed() {
    throwInvalidMethodCall();
  }

  onRejectTransaction() {
    throwInvalidMethodCall();
  }

  onResetQueue(stm, options) {
    return resetQueue(stm, options);
  }

  onModelUpdate() {}

  onModelInsertChild() {}

  onModelRemoveChild() {}

  onStoreModelAdd() {}

  onStoreModelInsert() {}

  onStoreModelRemove() {}

  onStoreRemoveAll() {}

}
/**
 * STM disabled state.
 *
 * @internal
 */

const DisabledState = new DisabledStateClass();
Registry.registerStmState('disabledstate', DisabledState);

/**
 * @module Core/data/stm/Transaction
 */
const ACTION_QUEUE_PROP = Symbol('ACTION_QUEUE_PROP');
/**
 * STM transaction class, holds list of actions constituting a transaction.
 *
 * A transaction can be undone and redone. Upon undo all the actions being held
 * are undone in reverse order. Upon redo all the actions being held are redone
 * in forward order.
 */

class Transaction extends Base {
  get defaultConfig() {
    return {
      /**
       * Transaction title
       *
       * @config {String}
       * @default
       */
      title: null
    };
  }

  construct(...args) {
    this[ACTION_QUEUE_PROP] = [];
    super.construct(...args);
  }
  /**
   * Gets transaction's actions queue
   *
   * @property {Core.data.stm.action.ActionBase[]}
   */

  get queue() {
    return this[ACTION_QUEUE_PROP].slice(0);
  }
  /**
   * Gets transaction's actions queue length
   *
   * @property {Number}
   */

  get length() {
    return this[ACTION_QUEUE_PROP].length;
  }
  /**
   * Adds an action to the transaction.
   *
   * @param {Core.data.stm.action.ActionBase|Object} action
   */

  addAction(action) {
    this[ACTION_QUEUE_PROP].push(action);
  }
  /**
   * Undoes actions held
   */

  undo() {
    const queue = this[ACTION_QUEUE_PROP];

    for (let i = queue.length - 1; i >= 0; --i) {
      queue[i].undo();
    }
  }
  /**
   * Redoes actions held
   */

  redo() {
    const queue = this[ACTION_QUEUE_PROP];

    for (let i = 0, len = queue.length; i < len; ++i) {
      queue[i].redo();
    }
  }

}
Transaction._$name = 'Transaction';

/**
 * @module Core/data/stm/state/ReadyState
 */
/**
 * STM ready state class.
 *
 * @internal
 */

class ReadyStateClass extends StateBase {
  canUndo(stm) {
    //      v
    // |*|*|
    return 0 < stm.position && stm.position <= stm.length;
  }

  canRedo(stm) {
    //  v
    // |*|*|
    return 0 <= stm.position && stm.position < stm.length;
  }

  onUndo(stm, steps) {
    const queue = stm[QUEUE_PROP];
    let curPos = stm.position,
        newPos = Math.max(0, curPos - steps);

    const next = () => {
      stm.notifyStoresAboutStateRestoringStart();

      while (curPos != newPos) {
        queue[--curPos].undo();
      }

      return [stm.autoRecord ? 'autoreadystate' : 'readystate', () => {
        stm.notifyStoresAboutStateRestoringStop();
      }];
    };

    return [{
      [STATE_PROP]: 'restoringstate',
      [POS_PROP]: newPos
    }, next];
  }

  onRedo(stm, steps) {
    const queue = stm[QUEUE_PROP];
    let curPos = stm.position,
        newPos = Math.min(queue.length, curPos + steps);

    const next = () => {
      stm.notifyStoresAboutStateRestoringStart();

      do {
        queue[curPos++].redo();
      } while (curPos != newPos);

      return [stm.autoRecord ? 'autoreadystate' : 'readystate', () => {
        stm.notifyStoresAboutStateRestoringStop();
      }];
    };

    return [{
      [STATE_PROP]: 'restoringstate',
      [POS_PROP]: newPos
    }, next];
  }

  onEnable() {
    throwInvalidMethodCall();
  }

  onDisable() {
    return 'disabledstate';
  }

  onAutoRecordOn() {
    return {
      [STATE_PROP]: 'autoreadystate',
      [AUTO_RECORD_PROP]: true
    };
  }

  onAutoRecordOff() {
    throwInvalidMethodCall();
  }

  onStartTransaction(stm, title) {
    const transaction = new Transaction({
      title: title
    });
    return [{
      [STATE_PROP]: 'recordingstate',
      [TRANSACTION_PROP]: transaction
    }, () => {
      stm.notifyStoresAboutStateRecordingStart(transaction);
    }];
  }

  onStopTransaction() {
    throwInvalidMethodCall();
  }

  onStopTransactionDelayed() {
    throwInvalidMethodCall();
  }

  onRejectTransaction() {
    throwInvalidMethodCall();
  }

  onResetQueue(stm, options) {
    return resetQueue(stm, options);
  }

  onModelUpdate() {}

  onModelInsertChild() {}

  onModelRemoveChild() {}

  onStoreModelAdd() {}

  onStoreModelInsert() {}

  onStoreModelRemove() {}

  onStoreRemoveAll() {}

}
/**
 * STM ready state.
 *
 * @internal
 */

let ReadyState = new ReadyStateClass();
Registry.registerStmState('readystate', ReadyState);

/**
 * @module Core/data/stm/state/RecordingState
 */
/**
 * STM recording state class.
 *
 * @internal
 */

class RecordingStateClass extends StateBase {
  canUndo() {
    return false;
  }

  canRedo() {
    return false;
  }

  onEnable() {}

  onDisable(stm) {
    const transaction = stm[TRANSACTION_PROP];
    stm.notifyStoresAboutStateRecordingStop(transaction, {
      disabled: true
    });
    return {
      [STATE_PROP]: 'disabledstate',
      [TRANSACTION_PROP]: null
    };
  }

  onAutoRecordOn(stm) {
    return [{
      [STATE_PROP]: 'autorecordingstate',
      [AUTO_RECORD_PROP]: true
    }, () => {
      stm.stopTransactionDelayed();
    }];
  }

  onAutoRecordOff() {
    throwInvalidMethodCall();
  }

  onStartTransaction() {
    throwInvalidMethodCall();
  }

  onStopTransaction(stm, title) {
    const transaction = stm[TRANSACTION_PROP];
    let position = stm[POS_PROP];
    const queue = stm[QUEUE_PROP];

    if (transaction.length) {
      if (!transaction.title && !title && stm.getTransactionTitle) {
        transaction.title = stm.getTransactionTitle(transaction);
      } else if (title) {
        transaction.title = title;
      }

      queue[position] = transaction;
      queue.length = ++position;
    }

    return [{
      [STATE_PROP]: 'readystate',
      [POS_PROP]: position,
      [TRANSACTION_PROP]: null
    }, () => {
      stm.notifyStoresAboutStateRecordingStop(transaction, {
        stop: true
      });
    }];
  }

  onRejectTransaction(stm) {
    const transaction = stm[TRANSACTION_PROP];
    return [{
      [STATE_PROP]: 'restoringstate',
      [TRANSACTION_PROP]: null
    }, () => {
      if (transaction.length) {
        transaction.undo();
      }

      return ['readystate', () => {
        stm.notifyStoresAboutStateRecordingStop(transaction, {
          rejected: true
        });
      }];
    }];
  }

  onStopTransactionDelayed() {
    throwInvalidMethodCall();
  }

  onResetQueue(stm, options) {
    return resetQueue(stm, options);
  }

  onModelUpdate(stm, model, newData, oldData) {
    const transaction = stm[TRANSACTION_PROP];
    transaction.addAction(stm.makeModelUpdateAction(model, newData, oldData));
  }

  onModelInsertChild(stm, parentModel, index, childModel, previousParent, previousIndex) {
    const transaction = stm[TRANSACTION_PROP];
    transaction.addAction(stm.makeModelInsertChildAction(parentModel, index, childModel, previousParent, previousIndex));
  }

  onModelRemoveChild(stm, parentModel, childModels, context) {
    const transaction = stm[TRANSACTION_PROP];
    transaction.addAction(stm.makeModelRemoveChildAction(parentModel, childModels, context));
  }

  onStoreModelAdd(stm, store, models, silent) {
    const transaction = stm[TRANSACTION_PROP];
    transaction.addAction(stm.makeStoreModelAddAction(store, models, silent));
  }

  onStoreModelInsert(stm, store, index, models, context, silent) {
    const transaction = stm[TRANSACTION_PROP];
    transaction.addAction(stm.makeStoreModelInsertAction(store, index, models, context, silent));
  }

  onStoreModelRemove(stm, store, models, context, silent) {
    const transaction = stm[TRANSACTION_PROP];
    transaction.addAction(stm.makeStoreModelRemoveAction(store, models, context, silent));
  }

  onStoreRemoveAll(stm, store, allRecords, silent) {
    const transaction = stm[TRANSACTION_PROP];
    transaction.addAction(stm.makeStoreRemoveAllAction(store, allRecords, silent));
  }

}
/**
 * STM recording state.
 *
 * @internal
 */

const RecordingState = new RecordingStateClass();
Registry.registerStmState('recordingstate', RecordingState);

/**
 * @module Core/data/stm/state/RestoringState
 */
/**
 * STM restoring state class.
 *
 * @internal
 */

class RestoringStateClass extends StateBase {
  canUndo() {
    return false;
  }

  canRedo() {
    return false;
  }

  onUndo() {
    throwInvalidMethodCall();
  }

  onRedo() {
    throwInvalidMethodCall();
  }

  onEnable() {
    throwInvalidMethodCall();
  }

  onDisable() {
    throwInvalidMethodCall();
  }

  onAutoRecordOn() {
    return {
      [AUTO_RECORD_PROP]: true
    };
  }

  onAutoRecordOff() {
    return {
      [AUTO_RECORD_PROP]: false
    };
  }

  onStartTransaction() {
    throwInvalidMethodCall();
  }

  onStopTransaction() {
    throwInvalidMethodCall();
  }

  onStopTransactionDelayed() {
    throwInvalidMethodCall();
  }

  onRejectTransaction() {
    throwInvalidMethodCall();
  }

  onQueueReset() {
    throwInvalidMethodCall();
  }

  onModelUpdate() {}

  onModelInsertChild() {}

  onModelRemoveChild() {}

  onStoreModelAdd() {}

  onStoreModelInsert() {}

  onStoreModelRemove() {}

  onStoreRemoveAll() {}

}
/**
 * STM restoring state.
 *
 * @internal
 */

const RestoringState = new RestoringStateClass();
Registry.registerStmState('restoringstate', RestoringState);

/**
 * @module Core/data/stm/state/AutoReadyState
 */
/**
 * STM transaction autostart ready state class.
 *
 * @internal
 */

class AutoReadyStateClass extends ReadyStateClass {
  onAutoRecordOn() {
    throwInvalidMethodCall();
  }

  onAutoRecordOff() {
    return {
      [STATE_PROP]: 'readystate',
      [AUTO_RECORD_PROP]: false
    };
  }

  onStartTransaction(stm, title) {
    const transaction = new Transaction({
      title: title
    });
    return [{
      [STATE_PROP]: 'autorecordingstate',
      [TRANSACTION_PROP]: transaction
    }, () => {
      stm.notifyStoresAboutStateRecordingStart(transaction);
      stm.stopTransactionDelayed();
    }];
  }

  onModelUpdate(stm, model, newData, oldData) {
    stm.startTransaction();
    stm.onModelUpdate(model, newData, oldData);
  }

  onModelInsertChild(stm, parentModel, index, childModels, context) {
    stm.startTransaction();
    stm.onModelInsertChild(parentModel, index, childModels, context);
  }

  onModelRemoveChild(stm, parentModel, childModels, context) {
    stm.startTransaction();
    stm.onModelRemoveChild(parentModel, childModels, context);
  }

  onStoreModelAdd(stm, store, models, silent) {
    stm.startTransaction();
    stm.onStoreModelAdd(store, models, silent);
  }

  onStoreModelInsert(stm, store, index, models, context, silent) {
    stm.startTransaction();
    stm.onStoreModelInsert(store, index, models, silent);
  }

  onStoreModelRemove(stm, store, models, context, silent) {
    stm.startTransaction();
    stm.onStoreModelRemove(store, models, context, silent);
  }

  onStoreRemoveAll(stm, store, allRecords, silent) {
    stm.startTransaction();
    stm.onStoreRemoveAll(store, allRecords, silent);
  }

}
/**
 * STM transaction autostart ready state.
 *
 * @internal
 */

const AutoReadyState = new AutoReadyStateClass();
Registry.registerStmState('autoreadystate', AutoReadyState);

/**
 * @module Core/data/stm/state/AutoRecordingState
 */
/**
 * STM recording state class.
 *
 * @internal
 */

class AutoRecordingStateClass extends RecordingStateClass.mixin(Delayable) {
  onDisable(stm) {
    const transaction = stm[TRANSACTION_PROP];
    const timer = stm[TRANSACTION_TIMER_PROP];

    if (timer) {
      this.clearTimeout(timer);
    }

    stm.notifyStoresAboutStateRecordingStop(transaction, {
      disabled: true
    });
    return {
      [STATE_PROP]: 'disabledstate',
      [TRANSACTION_PROP]: null,
      [TRANSACTION_TIMER_PROP]: null
    };
  }

  onAutoRecordOn(stm) {
    throwInvalidMethodCall();
  }

  onAutoRecordOff(stm) {
    const timer = stm[TRANSACTION_TIMER_PROP];

    if (timer) {
      this.clearTimeout(timer);
    }

    return {
      [STATE_PROP]: 'recordingstate',
      [AUTO_RECORD_PROP]: false,
      [TRANSACTION_TIMER_PROP]: null
    };
  }

  onStopTransaction(stm, title) {
    const transaction = stm[TRANSACTION_PROP];
    const timer = stm[TRANSACTION_TIMER_PROP];
    let position = stm[POS_PROP];
    const queue = stm[QUEUE_PROP];

    if (timer) {
      this.clearTimeout(timer);
    }

    if (transaction.length) {
      if (!transaction.title && !title && stm.getTransactionTitle) {
        transaction.title = stm.getTransactionTitle(transaction);
      } else if (title) {
        transaction.title = title;
      }

      queue[position] = transaction;
      queue.length = ++position;
    }

    return [{
      [STATE_PROP]: 'autoreadystate',
      [POS_PROP]: position,
      [TRANSACTION_PROP]: null,
      [TRANSACTION_TIMER_PROP]: null
    }, () => {
      stm.notifyStoresAboutStateRecordingStop(transaction, {
        stop: true
      });
    }];
  }

  onStopTransactionDelayed(stm) {
    let timer = stm[TRANSACTION_TIMER_PROP];

    if (timer) {
      this.clearTimeout(timer);
    }

    timer = this.setTimeout(() => {
      stm.stopTransaction();
    }, stm.autoRecordTransactionStopTimeout);
    return {
      [STATE_PROP]: AutoRecordingState,
      [TRANSACTION_TIMER_PROP]: timer
    };
  }

  onResetQueue(stm, options) {
    return resetQueue(stm, options);
  }

  onRejectTransaction(stm) {
    const transaction = stm[TRANSACTION_PROP],
          timer = stm[TRANSACTION_TIMER_PROP];

    if (timer) {
      this.clearTimeout(timer);
    }

    return [{
      [STATE_PROP]: 'restoringstate',
      [TRANSACTION_PROP]: null,
      [TRANSACTION_TIMER_PROP]: null
    }, () => {
      if (transaction.length) {
        transaction.undo();
      }

      return ['autoreadystate', () => {
        stm.notifyStoresAboutStateRecordingStop(transaction, {
          rejected: true
        });
      }];
    }];
  }

  onModelUpdate(stm, ...rest) {
    super.onModelUpdate(stm, ...rest);
    stm.stopTransactionDelayed();
  }

  onModelInsertChild(stm, ...rest) {
    super.onModelInsertChild(stm, ...rest);
    stm.stopTransactionDelayed();
  }

  onModelRemoveChild(stm, ...rest) {
    super.onModelRemoveChild(stm, ...rest);
    stm.stopTransactionDelayed();
  }

  onStoreModelAdd(stm, ...rest) {
    super.onStoreModelAdd(stm, ...rest);
    stm.stopTransactionDelayed();
  }

  onStoreModelInsert(stm, ...rest) {
    super.onStoreModelInsert(stm, ...rest);
    stm.stopTransactionDelayed();
  }

  onStoreModelRemove(stm, ...rest) {
    super.onStoreModelRemove(stm, ...rest);
    stm.stopTransactionDelayed();
  }

  onStoreRemoveAll(stm, ...rest) {
    super.onStoreRemoveAll(stm, ...rest);
    stm.stopTransactionDelayed();
  }

}
/**
 * STM recording state.
 *
 * @internal
 */

const AutoRecordingState = new AutoRecordingStateClass();
Registry.registerStmState('autorecordingstate', AutoRecordingState);

/**
 * @module Core/data/stm/action/UpdateAction
 */
const MODEL_PROP = Symbol('MODEL_PROP');
const NEW_DATA_PROP = Symbol('NEW_DATA_PROP');
const OLD_DATA_PROP = Symbol('OLD_DATA_PROP');
/**
 * Action to record the fact that a model has been updated.
 * @extends Core/data/stm/action/ActionBase
 */

class UpdateAction extends ActionBase {
  static get defaultConfig() {
    return {
      /**
       * Reference to a model which has been updated.
       *
       * @config {Core.data.Model}
       * @default
       */
      model: undefined,

      /**
       * Map of updated properties with new values.
       *
       * @config {Object}
       * @default
       */
      newData: undefined,

      /**
       * Map of updated properties with old values.
       *
       * @config {Object}
       * @default
       */
      oldData: undefined
    };
  }

  get type() {
    return 'UpdateAction';
  }

  get model() {
    return this[MODEL_PROP];
  }

  set model(value) {
    this[MODEL_PROP] = value;
  }

  get newData() {
    return this[NEW_DATA_PROP];
  }

  set newData(value) {
    this[NEW_DATA_PROP] = Object.assign({}, value);
  }

  get oldData() {
    return this[OLD_DATA_PROP];
  }

  set oldData(value) {
    this[OLD_DATA_PROP] = Object.assign({}, value);
  }

  undo() {
    // it seems STM has to use `model.set()` because of `model.inSet` overrides or smth
    // w/o this call, just with `Object.assign()` below, the view is not refreshed
    // Since invoking accessor will just forward change to the engine, we need to pass `skipAccessors = true`
    // to this call to make this change on data level. Engine will be updated below.
    // Covered by TaskEdit.t `autoSync` subtest
    this.model.set(this.oldData, null, null, null, true); // in the same time, engine needs the setters to be activated, since there's some
    // additional logic (for example, invalidate dispatcher)
    // This will make change in the engine

    if (this.model.$) {
      Object.assign(this.model, this.oldData);
    }
  }

  redo() {
    this.model.set(this.newData, null, null, null, true); // see comments above

    if (this.model.$) {
      Object.assign(this.model, this.newData);
    }
  }

}
UpdateAction._$name = 'UpdateAction';

/**
 * @module Core/data/stm/action/InsertChildAction
 */
const PARENT_MODEL_PROP$1 = Symbol('PARENT_MODEL_PROP');
const CHILD_MODELS_PROP$1 = Symbol('CHILD_MODELS_PROP');
const INSERT_INDEX_PROP$1 = Symbol('INSERT_INDEX_PROP');
const CONTEXT_PROP$3 = Symbol('CONTEXT_PROP');
/**
 * Action to record the fact of adding a children models into a parent model.
 * @extends Core/data/stm/action/ActionBase
 */

class InsertChildAction extends ActionBase {
  static get defaultConfig() {
    return {
      /**
       * Reference to a parent model a child model has been added to.
       *
       * @config {Core.data.Model}
       * @default
       */
      parentModel: undefined,

      /**
       * Children models inserted.
       *
       * @config {Core.data.Model[]}
       * @default
       */
      childModels: undefined,

      /**
       * Index a children models are inserted at
       *
       * @config {Number}
       * @default
       */
      insertIndex: undefined,

      /**
       * Map having children models as keys and values containing previous parent
       * of each model and index at the previous parent.
       *
       * @config {Object}
       * @default
       */
      context: undefined
    };
  }

  get type() {
    return 'InsertChildAction';
  }

  get parentModel() {
    return this[PARENT_MODEL_PROP$1];
  }

  set parentModel(model) {
    this[PARENT_MODEL_PROP$1] = model;
  }

  get childModels() {
    return this[CHILD_MODELS_PROP$1];
  }

  set childModels(models) {
    this[CHILD_MODELS_PROP$1] = models.slice(0);
  }

  get insertIndex() {
    return this[INSERT_INDEX_PROP$1];
  }

  set insertIndex(index) {
    this[INSERT_INDEX_PROP$1] = index;
  }

  get context() {
    return this[CONTEXT_PROP$3];
  }

  set context(ctx) {
    this[CONTEXT_PROP$3] = ctx;
  }

  undo() {
    const {
      parentModel,
      context,
      childModels
    } = this; // Let's sort models by parent index such that models with lesser index
    // were inserted back first, thus making valid parent index of models following.

    childModels.sort((lhs, rhs) => {
      const {
        lhsParent,
        lhsIndex
      } = context.get(lhs) || {},
            {
        rhsParent,
        rhsIndex
      } = context.get(rhs) || {};
      return lhsParent && lhsParent === rhsParent ? lhsIndex - rhsIndex : 0;
    }); // Now let's re-insert records back to where they were or remove them
    // if they weren't anywhere

    childModels.forEach(m => {
      const {
        parent,
        index
      } = context.get(m) || {};

      if (parent) {
        // If we move within same parent then index must be adjusted
        if (parent === parentModel) {
          let adjustedIndex; // we need to increment index if the node was moved up

          adjustedIndex = index > m.parentIndex ? index + 1 : index; // null index if we need to move to the end

          adjustedIndex = index === parent.children.length - 1 ? null : adjustedIndex; // if insertBefore is undefined the node will be appended to the end

          const insertBefore = parent.children[adjustedIndex];
          parent.insertChild(m, insertBefore);
        } else {
          // Insert at previous index
          parent.insertChild(m, parent.children[index]);
        }
      } else {
        // Just remove
        parentModel.removeChild(m);
      }
    });
  }

  redo() {
    const {
      parentModel,
      insertIndex,
      childModels
    } = this,
          insertBefore = parentModel.children[insertIndex];
    parentModel.insertChild(childModels, insertBefore);
  }

}
InsertChildAction._$name = 'InsertChildAction';

/**
 * @module Core/data/stm/action/RemoveChildAction
 */
const PARENT_MODEL_PROP = Symbol('PARENT_MODEL_PROP');
const CHILD_MODELS_PROP = Symbol('CHILD_MODELS_PROP');
const CONTEXT_PROP$2 = Symbol('CONTEXT_PROP');
/**
 * Action to record store remove child operation.
 * @extends Core/data/stm/action/ActionBase
 */

class RemoveChildAction extends ActionBase {
  static get defaultConfig() {
    return {
      /**
       * Reference to a parent model a child model has been removed to.
       *
       * @config {Core.data.Model}
       * @default
       */
      parentModel: undefined,

      /**
       * Children models removed.
       *
       * @config {Core.data.Model[]}
       * @default
       */
      childModels: undefined,

      /**
       * Map having children models as keys and values containing previous parent
       * index at the parent.
       *
       * @config {Object}
       * @default
       */
      context: undefined
    };
  }

  get type() {
    return 'RemoveChildAction';
  }

  get parentModel() {
    return this[PARENT_MODEL_PROP];
  }

  set parentModel(model) {
    this[PARENT_MODEL_PROP] = model;
  }

  get childModels() {
    return this[CHILD_MODELS_PROP];
  }

  set childModels(models) {
    this[CHILD_MODELS_PROP] = models.slice(0);
  }

  get context() {
    return this[CONTEXT_PROP$2];
  }

  set context(ctx) {
    this[CONTEXT_PROP$2] = ctx;
  }

  undo() {
    const {
      parentModel,
      context,
      childModels
    } = this; // Let's sort models by parent index such that models with lesser index
    // were inserted back first, thus making valid parent index of models following.

    childModels.sort((lhs, rhs) => {
      const lhsIndex = context.get(lhs),
            rhsIndex = context.get(rhs);
      return lhsIndex - rhsIndex;
    }); // Now let's re-insert records back to where they were

    childModels.forEach(m => {
      parentModel.insertChild(m, context.get(m));
    });
  }

  redo() {
    this.parentModel.removeChild(this.childModels);
  }

}
RemoveChildAction._$name = 'RemoveChildAction';

/**
 * @module Core/data/stm/action/AddAction
 */

const STORE_PROP$3 = Symbol('STORE_PROP');
const MODEL_LIST_PROP$2 = Symbol('MODEL_LIST_PROP');
/**
 * Action to record the fact of models adding to a store.
 * @extends Core/data/stm/action/ActionBase
 */

class AddAction extends ActionBase {
  static get defaultConfig() {
    return {
      /**
       * Reference to a store models have been added into.
       *
       * @config {Core.data.Store}
       * @default
       */
      store: undefined,

      /**
       * List of models added into the store.
       *
       * @config {Core.data.Model[]}
       * @default
       */
      modelList: undefined,

      /**
       * Flag showing if undo/redo should be done silently i.e. with events suppressed
       *
       * @config {Boolean}
       * @default
       */
      silent: false
    };
  }

  get type() {
    return 'AddAction';
  }

  get store() {
    return this[STORE_PROP$3];
  }

  set store(store) {
    this[STORE_PROP$3] = store;
  }

  get modelList() {
    return this[MODEL_LIST_PROP$2];
  }

  set modelList(list) {
    this[MODEL_LIST_PROP$2] = list.slice(0);
  }

  undo() {
    const me = this;
    me.store.remove(me.modelList, me.silent);
  }

  redo() {
    const me = this;
    me.store.add(me.modelList, me.silent);
  }

}
AddAction._$name = 'AddAction';

/**
 * @module Core/data/stm/action/InsertAction
 */

const STORE_PROP$2 = Symbol('STORE_PROP');
const MODEL_LIST_PROP$1 = Symbol('MODEL_LIST_PROP');
const INSERT_INDEX_PROP = Symbol('INSERT_INDEX_PROP');
const CONTEXT_PROP$1 = Symbol('CONTEXT_PROP');
/**
 * Action to record the fact of models inserting into a store.
 * @extends Core/data/stm/action/ActionBase
 */

class InsertAction extends ActionBase {
  static get defaultConfig() {
    return {
      /**
       * Reference to a store models have been inserted into.
       *
       * @config {Core.data.Store}
       * @default
       */
      store: undefined,

      /**
       * List of models inserted into the store.
       *
       * @config {Core.data.Model[]}
       * @default
       */
      modelList: undefined,

      /**
       * Index the models have been inserted at.
       *
       * @config {Number}
       * @default
       */
      insertIndex: undefined,

      /**
       * Models move context (if models has been moved), if any.
       * Map this {@link Core/data/Model} instances as keys and their
       * previous index as values
       *
       * @config {Map}
       * @default
       */
      context: undefined,

      /**
       * Flag showing if undo/redo should be done silently i.e. with events suppressed
       *
       * @config {Boolean}
       * @default
       */
      silent: false
    };
  }

  get type() {
    return 'InsertAction';
  }

  get store() {
    return this[STORE_PROP$2];
  }

  set store(store) {
    this[STORE_PROP$2] = store;
  }

  get modelList() {
    return this[MODEL_LIST_PROP$1];
  }

  set modelList(list) {
    this[MODEL_LIST_PROP$1] = list.slice(0);
  }

  get insertIndex() {
    return this[INSERT_INDEX_PROP];
  }

  set insertIndex(index) {
    this[INSERT_INDEX_PROP] = index;
  }

  get context() {
    return this[CONTEXT_PROP$1];
  }

  set context(context) {
    this[CONTEXT_PROP$1] = context;
  }

  undo() {
    const {
      store,
      modelList,
      context,
      silent
    } = this; // Let's sort models by index such that models with lesser index
    // were inserted back first, thus making valid index of models following.

    modelList.sort((lhs, rhs) => {
      const lhsIndex = context.get(lhs),
            rhsIndex = context.get(rhs);
      return lhsIndex !== undefined && rhsIndex !== undefined ? lhsIndex - rhsIndex : 0;
    });
    modelList.forEach(m => {
      const index = context.get(m); // Flag the inserted record that we undo to skip adding it to "store.removed"

      m._undoingInsertion = true;

      if (index !== undefined) {
        // Insert at previous index
        store.insert(index, m, silent);
      } else {
        // Just remove
        store.remove(m, silent);
      }

      m._undoingInsertion = false;
    });
  }

  redo() {
    const me = this;
    me.store.insert(me.insertIndex, me.modelList, me.silent);
  }

}
InsertAction._$name = 'InsertAction';

/**
 * @module Core/data/stm/action/RemoveAction
 */
const STORE_PROP$1 = Symbol('STORE_PROP');
const MODEL_LIST_PROP = Symbol('MODEL_LIST_PROP');
const CONTEXT_PROP = Symbol('CONTEXT_PROP');
/**
 * Action to record the fact of models removed from a store.
 * @extends Core/data/stm/action/ActionBase
 */

class RemoveAction extends ActionBase {
  static get defaultConfig() {
    return {
      /**
       * Reference to a store models have been removed from.
       *
       * @config {Core.data.Store}
       * @default
       */
      store: undefined,

      /**
       * List of models removed from the store.
       *
       * @config {Core.data.Model[]}
       * @default
       */
      modelList: undefined,

      /**
       * Models removing context.
       *
       * @config {Object}
       * @default
       */
      context: undefined,

      /**
       * Flag showing if undo/redo should be done silently i.e. with events suppressed
       *
       * @config {Boolean}
       * @default
       */
      silent: false
    };
  }

  get type() {
    return 'RemoveAction';
  }

  get store() {
    return this[STORE_PROP$1];
  }

  set store(store) {
    this[STORE_PROP$1] = store;
  }

  get modelList() {
    return this[MODEL_LIST_PROP];
  }

  set modelList(list) {
    this[MODEL_LIST_PROP] = list.slice(0);
  }

  get context() {
    return this[CONTEXT_PROP];
  }

  set context(context) {
    this[CONTEXT_PROP] = context;
  }

  undo() {
    const {
      store,
      context,
      modelList,
      silent
    } = this; // Let's sort models by index such that models with lesser index
    // were inserted back first, thus making valid index of models following.

    modelList.sort((lhs, rhs) => {
      const lhsIndex = context.get(lhs),
            rhsIndex = context.get(rhs); // Here, in contrast to InsertAction, index is always present

      return lhsIndex - rhsIndex;
    });
    modelList.forEach(m => {
      const index = context.get(m); // Insert at previous index

      store.insert(index, m, silent);
    });
  }

  redo() {
    const me = this;
    me.store.remove(me.modelList, me.silent);
  }

}
RemoveAction._$name = 'RemoveAction';

/**
 * @module Core/data/stm/action/RemoveAllAction
 */
const STORE_PROP = Symbol('STORE_PROP');
const ALL_RECORDS_PROP = Symbol('ALL_RECORDS_PROP');
/**
 * Action to record store remove all operation.
 * @extends Core/data/stm/action/ActionBase
 */

class RemoveAllAction extends ActionBase {
  static get defaultConfig() {
    return {
      /**
       * Reference to a store cleared.
       *
       * @config {Core.data.Store}
       * @default
       */
      store: undefined,

      /**
       * All store records removed
       *
       * @config {Core.data.Model[]}
       * @default
       */
      allRecords: undefined,

      /**
       * Flag showing if undo/redo should be done silently i.e. with events suppressed
       *
       * @config {Boolean}
       * @default
       */
      silent: false
    };
  }

  get type() {
    return 'RemoveAllAction';
  }

  get store() {
    return this[STORE_PROP];
  }

  set store(store) {
    this[STORE_PROP] = store;
  }

  get allRecords() {
    return this[ALL_RECORDS_PROP];
  }

  set allRecords(records) {
    this[ALL_RECORDS_PROP] = records.slice(0);
  }

  undo() {
    const {
      store,
      allRecords,
      silent
    } = this;
    store.add(allRecords, silent);
  }

  redo() {
    const me = this;
    me.store.removeAll(me.silent);
  }

}
RemoveAllAction._$name = 'RemoveAllAction';

/**
 * @module Core/data/stm/StateTrackingManager
 */
const makeModelUpdateAction = (model, newData, oldData) => {
  return new UpdateAction({
    model,
    newData,
    oldData
  });
};
const makeModelInsertChildAction = (parentModel, insertIndex, childModels, context) => {
  return new InsertChildAction({
    parentModel,
    childModels,
    insertIndex,
    context
  });
};
const makeModelRemoveChildAction = (parentModel, childModels, context) => {
  return new RemoveChildAction({
    parentModel,
    childModels,
    context
  });
};
const makeStoreModelAddAction = (store, modelList, silent) => {
  return new AddAction({
    store,
    modelList,
    silent
  });
};
const makeStoreModelInsertAction = (store, insertIndex, modelList, context, silent) => {
  return new InsertAction({
    store,
    insertIndex,
    modelList,
    context,
    silent
  });
};
const makeStoreModelRemoveAction = (store, modelList, context, silent) => {
  return new RemoveAction({
    store,
    modelList,
    context,
    silent
  });
};
const makeStoreRemoveAllAction = (store, allRecords, silent) => {
  return new RemoveAllAction({
    store,
    allRecords,
    silent
  });
};

const stateTransition = (stm, event, ...args) => {
  const oldState = stm.state,
        newState = event.call(stm[STATE_PROP], stm, ...args);

  if (typeof newState === 'string') {
    stm[STATE_PROP] = Registry.resolveStmState(newState);
  } else if (newState instanceof StateBase) {
    stm[STATE_PROP] = newState;
  } else if (Array.isArray(newState)) {
    const [state, next] = newState;

    if (typeof state === 'string') {
      stm[STATE_PROP] = Registry.resolveStmState(state);
    } else if (state instanceof StateBase) {
      stm[STATE_PROP] = state;
    } else if (state && typeof state === 'object') {
      stm = Object.assign(stm, state);
      stm[STATE_PROP] = Registry.resolveStmState(stm[STATE_PROP]);
    }

    if (typeof next === 'function') {
      stateTransition(stm, next, ...args);
    }
  } else if (newState && typeof newState === 'object') {
    stm = Object.assign(stm, newState);
    stm[STATE_PROP] = Registry.resolveStmState(stm[STATE_PROP]);
  }

  if (oldState !== ReadyState && oldState !== AutoReadyState && newState !== ReadyState && newState !== AutoReadyState) {
    stm.trigger('ready');
  }
};
/**
 * Tracks the state of every store registered via {@link #function-addStore}. It is {@link #config-disabled} by default
 * so remember to call {@link #function-enable} when your stores are registered and initial dataset is loaded.
 * Use {@link #function-undo} / {@link #function-redo} method calls to restore state to a particular
 * point in time
 *
 * ```javascript
 * stm = new StateTrackingManager({
 *     autoRecord : true,
 *     listeners  : {
 *        'recordingstop' : () => {
 *            // your custom code to update undo/redo GUI controls
 *            updateUndoRedoControls();
 *        },
 *        'restoringstop' : ({ stm }) => {
 *            // your custom code to update undo/redo GUI controls
 *            updateUndoRedoControls();
 *        }
 *    },
 *    getTransactionTitle : (transaction) => {
 *        // your custom code to analyze the transaction and return custom transaction title
 *        const lastAction = transaction.queue[transaction.queue.length - 1];
 *
 *        if (lastAction instanceof AddAction) {
 *            let title = 'Add new record';
 *        }
 *
 *        return title;
 *    }
 * });
 *
 * stm.addStore(userStore);
 * stm.addStore(companyStore);
 * stm.addStore(otherStore);
 *
 * stm.enable();
 * ```
 *
 * **Note:** STM currently does not support undoing server side added and saved records.
 * Therefore it's recommended to {@link #function-resetQueue reset the queue}
 * each time a tracked store(s) loads from or saves its changes to the server.
 * If Crud Manager is used it can be done like this:
 * ```javascript
 * crudManager.on({
 *     requestDone() {
 *         stm.resetQueue();
 *     }
 * });
 * ```
 * and in case individual stores are used:
 * ```javascript
 * ajaxStore.on({
 *     afterRequest({ exception }) {
 *         if (!exception) {
 *             stm.resetQueue();
 *         }
 *     }
 * });
 * ```
 *
 * @mixes Core/mixin/Events
 * @extends Core/Base
 */

class StateTrackingManager extends Events(Base) {
  static get defaultConfig() {
    return {
      /**
       * Default manager disabled state
       *
       * @config {Boolean}
       * @default
       */
      disabled: true,

      /**
       * Whether to start transaction recording automatically in case the Manager is enabled.
       *
       * In the auto recording mode, the manager waits for the first change in any store being managed and starts a transaction, i.e.
       * records any changes in its monitored stores. The transaction lasts for {@link #config-autoRecordTransactionStopTimeout} and
       * afterwards creates one undo/redo step, including all changes in the stores during that period of time.
       *
       * In non auto recording mode you have to call {@link #function-startTransaction} / {@link #function-stopTransaction} to start and end
       * a transaction.
       *
       * @config {Boolean}
       * @default
       */
      autoRecord: false,

      /**
       * The transaction duration (in ms) for the auto recording mode {@link #config-autoRecord}
       *
       * @config {Number}
       * @default
       */
      autoRecordTransactionStopTimeout: 100,

      /**
       * Store model update action factory
       *
       * @config {Function}
       * @default
       * @private
       */
      makeModelUpdateAction: makeModelUpdateAction,

      /**
       * Store insert child model action factory.
       *
       * @config {Function}
       * @default
       * @private
       */
      makeModelInsertChildAction: makeModelInsertChildAction,

      /**
       * Store remove child model action factory.
       *
       * @config {Function}
       * @default
       * @private
       */
      makeModelRemoveChildAction: makeModelRemoveChildAction,

      /**
       * Store add model action factory.
       *
       * @config {Function}
       * @default
       * @private
       */
      makeStoreModelAddAction: makeStoreModelAddAction,

      /**
       * Store insert model action factory.
       *
       * @config {Function}
       * @default
       * @private
       */
      makeStoreModelInsertAction: makeStoreModelInsertAction,

      /**
       * Store remove model action factory.
       *
       * @config {Function}
       * @default
       * @private
       */
      makeStoreModelRemoveAction: makeStoreModelRemoveAction,

      /**
       * Store remove all models action factory.
       *
       * @config {Function}
       * @default
       * @private
       */
      makeStoreRemoveAllAction: makeStoreRemoveAllAction,

      /**
       * Function to create a transaction title if none is provided.
       *
       * The function receives a transaction and should return a title.
       *
       * @config {Function}
       * @default
       */
      getTransactionTitle: null
    };
  }

  construct(...args) {
    const me = this;
    Object.assign(me, {
      [STATE_PROP]: ReadyState,
      [STORES_PROP]: [],
      [QUEUE_PROP]: [],
      [POS_PROP]: 0,
      [TRANSACTION_PROP]: null,
      [TRANSACTION_TIMER_PROP]: null,
      [AUTO_RECORD_PROP]: false
    });
    super.construct(...args);
  } // TODO: This destroys the current state, which makes successive tests fail. Not sure what should be done
  // doDestroy() {
  //     super.doDestroy();
  //     this.destroyProperties(STATE_PROP);
  // }

  /**
   * Gets current state of the manager
   *
   * @property {Core.data.stm.state.StateBase}
   */

  get state() {
    return this[STATE_PROP];
  }
  /**
   * Gets current undo/redo queue position
   *
   * @property {Number}
   */

  get position() {
    return this[POS_PROP];
  }
  /**
   * Gets current undo/redo queue length
   *
   * @property {Number}
   */

  get length() {
    return this[QUEUE_PROP].length;
  }
  /**
   * Gets all the stores registered in STM
   *
   * @property {Core.data.Store[]}
   */

  get stores() {
    return Array.from(this[STORES_PROP]);
  }
  /**
   * Checks if a store has been added to the manager
   *
   * @param  {Core.data.Store} store
   * @return {Boolean}
   */

  hasStore(store) {
    return this[STORES_PROP].includes(store);
  }
  /**
   * Adds a store to the manager
   *
   * @param {Core.data.Store} store
   */

  addStore(store) {
    if (!this.hasStore(store)) {
      this[STORES_PROP].push(store);
      store.stm = this;
    }
  }
  /**
   * Removes a store from the manager
   *
   * @param {Core.data.Store} store
   */

  removeStore(store) {
    if (this.hasStore(store)) {
      this[STORES_PROP] = this[STORES_PROP].filter(s => s !== store);
      store.stm = null;
    }
  }
  /**
   * Calls `fn` for each store registered in STM.
   *
   * @param {Function} fn (store, id) => ...
   */

  forEachStore(fn) {
    this[STORES_PROP].forEach(s => fn(s, s.id));
  }
  /**
   * Get/set manager disabled state
   *
   * @property {Boolean}
   */

  get disabled() {
    return this.state === DisabledState;
  }

  set disabled(val) {
    const me = this;

    if (me.disabled != val) {
      if (val) {
        stateTransition(me, me.state.onDisable, me);
      } else {
        stateTransition(me, me.state.onEnable, me);
      }

      me.trigger('stmDisabled', {
        disabled: val
      });
      /**
       * Fired when the disabled state of the STM changes
       *
       * @event disabled
       * @param {Core.data.stm.StateTrackingManager} source
       * @param {Boolean} disabled The current disabled state of the STM
       */

      me.trigger('disabled', {
        disabled: val
      });
    }
  }
  /**
   * Enables manager
   */

  enable() {
    this.disabled = false;
  }
  /**
   * Disables manager
   */

  disable() {
    this.disabled = true;
  }
  /**
   * Checks manager ready state
   * @readonly
   * @property {Boolean}
   */

  get isReady() {
    return this.state === ReadyState || this.state === AutoReadyState;
  }

  waitForReadiness() {
    return this.await('ready', false);
  }
  /**
   * Checks manager recording state
   * @readonly
   * @property {Boolean}
   */

  get isRecording() {
    return this.state === RecordingState || this.state === AutoRecordingState;
  }
  /**
   * Gets/sets manager auto record option
   *
   * @property {Boolean}
   */

  get autoRecord() {
    return this[AUTO_RECORD_PROP];
  }

  set autoRecord(value) {
    const me = this;

    if (me.autoRecord != value) {
      if (value) {
        stateTransition(me, me.state.onAutoRecordOn, me);
      } else {
        stateTransition(me, me.state.onAutoRecordOff, me);
      }
    }
  }
  /**
   * Starts undo/redo recording transaction.
   *
   * @param {String} [title=nul]
   */

  startTransaction(title = null) {
    stateTransition(this, this.state.onStartTransaction, title);
  }
  /**
   * Stops undo/redo recording transaction
   *
   * @param {String} [title=null]
   */

  stopTransaction(title = null) {
    stateTransition(this, this.state.onStopTransaction, title);
  }
  /**
   * Stops undo/redo recording transaction after {@link #config-autoRecordTransactionStopTimeout} delay.
   *
   * @private
   */

  stopTransactionDelayed() {
    stateTransition(this, this.state.onStopTransactionDelayed);
  }
  /**
   * Rejects currently recorded transaction.
   */

  rejectTransaction() {
    stateTransition(this, this.state.onRejectTransaction);
  }
  /**
   * Gets currently recording STM transaction.
   * @readonly
   * @property {Core.data.stm.Transaction}
   */

  get transaction() {
    return this[TRANSACTION_PROP];
  }
  /**
   * Gets titles of all recorded undo/redo transactions
   * @readonly
   * @property {String[]}
   */

  get queue() {
    return this[QUEUE_PROP].map(t => t.title);
  }
  /**
   * Gets manager restoring state.
   * @readonly
   * @property {Boolean}
   */

  get isRestoring() {
    return this.state === RestoringState;
  }
  /**
   * Checks if the manager can undo.
   *
   * @property {Boolean}
   */

  get canUndo() {
    return this.state.canUndo(this);
  }
  /**
   * Checks if the manager can redo.
   *
   * @property {Boolean}
   */

  get canRedo() {
    return this.state.canRedo(this);
  }
  /**
   * Undoes current undo/redo transaction.
   * @param {Number} [steps=1]
   * @returns {Promise} A promise which is resolved when undo action has been performed
   */

  async undo(steps = 1) {
    if (!this.isReady) {
      await this.waitForReadiness();
    }

    stateTransition(this, this.state.onUndo, steps);
  }
  /**
   * Undoes all transactions.
   * @returns {Promise} A promise which is resolved when undo actions has been performed
   */

  async undoAll() {
    if (!this.isReady) {
      await this.waitForReadiness();
    }

    this.undo(this.length);
  }
  /**
   * Redoes current undo/redo transaction.
   *
   * @param {Number} [steps=1]
   * @returns {Promise} A promise which is resolved when redo action has been performed
   */

  async redo(steps = 1) {
    if (!this.isReady) {
      await this.waitForReadiness();
    }

    stateTransition(this, this.state.onRedo, steps);
  }
  /**
   * Redoes all transactions.
   * @returns {Promise} A promise which is resolved when redo actions has been performed
   */

  async redoAll() {
    if (!this.isReady) {
      await this.waitForReadiness();
    }

    this.redo(this.length);
  }
  /**
   * Resets undo/redo queue.
   */

  resetQueue(
  /* private */
  options = {
    undo: true,
    redo: true
  }) {
    stateTransition(this, this.state.onResetQueue, options);
  }
  /**
   * Resets undo queue.
   */

  resetUndoQueue() {
    this.resetQueue({
      undo: true
    });
  }
  /**
   * Resets redo queue.
   */

  resetRedoQueue() {
    this.resetQueue({
      redo: true
    });
  }

  notifyStoresAboutStateRecordingStart(transaction) {
    this.forEachStore(store => {
      store.onStmRecordingStart && store.onStmRecordingStart(this, transaction);
    });
    /**
     * Fired upon state recording operation starts.
     *
     * @event recordingStart
     * @param {Core.data.stm.StateTrackingManager} stm
     * @param {Core.data.stm.Transaction} transaction
     */

    this.trigger('recordingStart', {
      stm: this,
      transaction
    });
  }

  notifyStoresAboutStateRecordingStop(transaction, reason) {
    this.forEachStore(store => {
      store.onStmRecordingStop && store.onStmRecordingStop(this, transaction, reason);
    });
    /**
     * Fired upon state recording operation stops.
     *
     * @event recordingStop
     * @param {Core.data.stm.StateTrackingManager} stm
     * @param {Core.data.stm.Transaction} transaction
     * @param {Object} reason Transaction stop reason
     * @param {Boolean} reason.stop Transaction recording has been stopped in a normal way.
     * @param {Boolean} reason.disabled Transaction recording has been stopped due to STM has been disabled.
     * @param {Boolean} reason.rejected Transaction recording has been stopped due to transaction has been rejected.
     */

    this.trigger('recordingStop', {
      stm: this,
      transaction,
      reason
    });
  }

  notifyStoresAboutStateRestoringStart() {
    this.forEachStore(store => {
      store.onStmRestoringStart && store.onStmRestoringStart(this);
    });
    /**
     * Fired upon state restoration operation starts.
     *
     * @event restoringStart
     * @param {Core.data.stm.StateTrackingManager} stm
     */

    this.trigger('restoringStart', {
      stm: this
    });
  }

  notifyStoresAboutStateRestoringStop() {
    this.forEachStore(store => {
      store.onStmRestoringStop && store.onStmRestoringStop(this);
    });
    /**
     * Fired upon state restoration operation stops.
     *
     * @event restoringStop
     * @param {Core.data.stm.StateTrackingManager} stm
     */

    this.trigger('restoringStop', {
      stm: this
    });
  }

  notifyStoresAboutQueueReset(options) {
    this.forEachStore(store => {
      store.onStmQueueReset && store.onStmQueueReset(this, options);
    });
    /**
     * Fired upon state undo/redo queue reset.
     *
     * @event queueReset
     * @param {Core.data.stm.StateTrackingManager} stm
     */

    this.trigger('queueReset', {
      stm: this,
      options
    });
  }
  /**
   * Method to call from model STM mixin upon model update
   *
   * @param {Core.data.Model} model
   * @param {Object} newData
   * @param {Object} oldData
   *
   * @private
   */

  onModelUpdate(model, newData, oldData) {
    stateTransition(this, this.state.onModelUpdate, model, newData, oldData);
  }
  /**
   * Method to call from model STM mixin upon tree model child insertion
   *
   * @param {Core.data.Model} parentModel Parent model
   * @param {Number} index Insertion index
   * @param {Core.data.Model[]} childModels Array of models inserted
   * @param {Map} context Map with inserted models as keys and objects with previous parent,
   *                      and index at previous parent.
   *
   * @private
   */

  onModelInsertChild(parentModel, index, childModels, context) {
    stateTransition(this, this.state.onModelInsertChild, parentModel, index, childModels, context);
  }
  /**
   * Method to call from model STM mixin upon tree model child removal
   *
   * @param {Core.data.Model} parentModel
   * @param {Core.data.Model[]} childModels
   * @param {Map} context
   *
   * @private
   */

  onModelRemoveChild(parentModel, childModels, context) {
    stateTransition(this, this.state.onModelRemoveChild, parentModel, childModels, context);
  }
  /**
   * Method to call from store STM mixin upon store models adding
   *
   * @param {Core.data.Store} store
   * @param {Core.data.Model[]} models
   * @param {Boolean} silent
   *
   * @private
   */

  onStoreModelAdd(store, models, silent) {
    stateTransition(this, this.state.onStoreModelAdd, store, models, silent);
  }
  /**
   * Method to call from store STM mixin upon store models insertion
   *
   * @param {Core.data.Store} store
   * @param {Number} index
   * @param {Core.data.Model[]} models
   * @param {Map} context
   * @param {Boolean} silent
   *
   * @private
   */

  onStoreModelInsert(store, index, models, context, silent) {
    stateTransition(this, this.state.onStoreModelInsert, store, index, models, context, silent);
  }
  /**
   * Method to call from store STM mixin upon store models removal
   *
   * @param {Core.data.Store} store
   * @param {Core.data.Model[]} models
   * @param {Object} context
   * @param {Boolean} silent
   *
   * @private
   */

  onStoreModelRemove(store, models, context, silent) {
    stateTransition(this, this.state.onStoreModelRemove, store, models, context, silent);
  }
  /**
   * Method to call from store STM mixin upon store clear
   *
   * @param {Core.data.Store} store
   * @param {Core.data.Model[]} allRecords
   * @param {Boolean} silent
   *
   * @private
   */

  onStoreRemoveAll(store, allRecords, silent) {
    stateTransition(this, this.state.onStoreRemoveAll, store, allRecords, silent);
  } // UI key event handling

  onUndoKeyPress(event) {
    if (!this.disabled) {
      if (event.shiftKey) {
        if (this.canRedo) {
          event.preventDefault();
          this.redo();
        }
      } else if (this.canUndo) {
        event.preventDefault();
        this.undo();
      }
    }
  }

}
StateTrackingManager._$name = 'StateTrackingManager';

/**
 * @module Core/mixin/Finalizable
 */

/**
 * This mixin provides an asynchronous completion mechanism. This allows a process to coordinate its async actions
 * (such as Ajax requests or user interaction) with cleanup.
 *
 * Consider a context tracking helper class, for example:
 * ```
 *  class Context extends Base.mixin(Finalizable) {
 *      // ...
 *
 *      async finish() {
 *          this.owner.trigger('finish', {
 *              context : this
 *          });
 *
 *          // Wait for any scheduled finalizer to run...
 *          await this.finalize();
 *      }
 *
 *      doFinalize() {
 *          this.destroy();
 *      }
 *  }
 * ```
 *
 * When the `finish` event is processed, the receiver can register a promise for whatever processing it would like to
 * perform:
 * ```
 *  class Foo {
 *      onFinish({ context }) {
 *          context.finalizer = this.askUser(context);
 *      }
 *
 *      async askUser(context) {
 *          //
 *      }
 *  }
 * ```
 * @mixin
 * @internal
 */

var Finalizable = (Target => class Finalizable extends (Target || Base) {
  static get $name() {
    return 'Finalizable';
  }

  construct(...args) {
    super.construct(...args);
    /**
     * This property can be set any time prior to calling {@link #function-finalize} (i.e., when the
     * {@link #property-isFinalizing} property goes to `true`). When set, this instance will `await` this
     * promise before completing the finalization process by calling {@link #function-doFinalize}.
     * @member {Promise} finalizer
     */

    this.finalizer = null;
    /**
     * This property holds the `Promise` that will resolve when {@link #function-finalize} has completed. It is
     * set when {@link #function-finalize} is called and cleared on return.
     * @member {Boolean} finalizing
     * @readonly
     * @private
     */

    this.finalizing = null;
    /**
     * This property is `true` once the instance completes the {@link #function-finalize} method.
     * @member {Boolean} isFinalized
     * @readonly
     */

    this.isFinalized = false;
    /**
     * This property is set to `true` when {@link #function-finalize} is called.
     * @member {Boolean} isFinalizing
     * @readonly
     */

    this.isFinalizing = false;
  }
  /**
   * This template method is called at the end of {@link #function-finalize}. By default it calls `destroy()`, but
   * can be replaced by the derived class. This can be useful if it is not the `Finalizable` instance that awaits
   * the {@link #function-finalize} method.
   */

  doFinalize() {
    this.destroy();
  }
  /**
   * This method is called (typically by this instance or its owner) to cleanup this instance while possibly first
   * waiting for the {@link #property-finalizer} promise to settle. Once settled, the {@link #function-doFinalize}
   * method is called.
   * @async
   */

  finalize() {
    const me = this;
    let ret = me.finalizing;

    if (!ret && !me.isFinalized) {
      me.isFinalizing = true; // note: we never clear this flag (use isFinalized to know if we're done)
      // If we are called during finalization, we want to return the same promise, so we cache it away.

      me.finalizing = ret = me._awaitFinalizer();
    }

    return ret;
  }

  async _awaitFinalizer() {
    const me = this;

    try {
      await me.finalizer;
    } finally {
      // be sure we clean up even if an exception is thrown by the finalizer...
      me.finalizing = null;
      me.isFinalized = true;
      me.doFinalize();
    }
  }

});

/**
 * @module Core/util/drag/DragContext
 */

const ABORTED = Symbol('dragAbort'),
      // Drag has been aborted
INIT = Symbol('dragInit'),
      // Button is down but insufficient movement to start the drag
DRAGGING = Symbol('dragDrag'),
      // Button is down and movement has started a drag
DROPPED = Symbol('dragDrop'),
      // Button has been released and drop has occurred
lockDirections = {
  x: 'horizontal',
  y: 'vertical'
};
/**
 * This class is created during drag operations of {@link Core/mixin/Draggable}. It holds the state of an ongoing drag
 * operation.
 * @extends Core/Base
 * @internal
 */

class DragContext extends Base.mixin(Finalizable, Delayable, Identifiable) {
  static get configurable() {
    return {
      /**
       * The element that will have the {@link Core.mixin.Draggable#property-draggingItemCls}. This element is
       * determined by the {@link Core.mixin.Draggable#config-dragItemSelector}.
       * @config {HTMLElement}
       */
      itemElement: null,

      /**
       * The `ScrollManager` instance to use for scrolling while dragging.
       * @config {Core.util.ScrollManager}
       * @private
       */
      scrollManager: null,

      /**
       * Config for `startMonitoring` call.
       * @config {Object}
       * @private
       */
      monitoringConfig: null,

      /**
       * The source of the drag operation.
       * @config {Core.mixin.Draggable}
       * @default
       * @readonly
       */
      source: null,

      /**
       * The current target of the drag.
       * @member {Core.mixin.Droppable}
       * @readonly
       */
      target: null,

      /**
       * The current target element of the drag.
       * @member {HTMLElement}
       * @private
       */
      targetElement: null,

      /**
       * The minimum distance from the touchstart/mousedown/pointerdown that must be moved to actually start a
       * drag operation.
       * @config {Number}
       * @default
       * @readonly
       */
      threshold: 5,

      /**
       * The minimum amount of time a touch must be maintained before it will initiate a drag. Movement prior to
       * this time will cancel the drag in order to allow touch scrolling.
       * @config {Number}
       * @default
       */
      touchStartDelay: 300
    };
  }

  static get identifiable() {
    return {};
  }
  /**
   * The current DOM event being processed.
   * @member {Event} event
   * @readonly
   */

  construct(...args) {
    super.construct(...args);
    const me = this,
          {
      event
    } = me;
    Object.assign(me, {
      /**
       * This property holds the `altKey` state of the most recent event.
       * @member {Boolean}
       */
      altKey: null,

      /**
       * An array of functions to call when cleaning up the context instance.
       * @member {Function[]}
       * @private
       */
      cleaners: [],

      /**
       * This property holds the `ctrlKey` state of the most recent event.
       * @member {Boolean}
       */
      ctrlKey: null,

      /**
       * Container for data associated with the drag. Data items are added by the {@link Core.mixin.Draggable}
       * when the drag starts.
       * @member {Map}
       * @private
       */
      data: new Map(),

      /**
       * The element from which the drag operation started.
       * @member {HTMLElement}
       * @readonly
       */
      element: event.target,

      /**
       * The event that completed the drag (a `mouseup`, `pointerup` or `touchend`).
       * @member {Event}
       * @readonly
       */
      endEvent: null,

      /**
       * The most recent `mousemove`, `pointermove` or `touchmove` event.
       * @member {Event}
       * @private
       */
      lastMoveEvent: null,

      /**
       * This property holds the `metaKey` state of the most recent event.
       * @member {Boolean}
       */
      metaKey: null,

      /**
       * The previous {@link #property-target} of the drag.
       * @member {Core.mixin.Droppable}
       * @readonly
       */
      previousTarget: null,

      /**
       * The scroll actions reported by the {@link #config-scrollManager}.
       * @member {Object}
       * @private
       */
      scrollerAction: null,

      /**
       * This property holds the `shiftKey` state of the most recent event.
       * @member {Boolean}
       */
      shiftKey: null,

      /**
       * This property holds the current state of the drag process.
       *
       * This will be one of the following values:
       *
       *  - `DragContext.STATE.INIT` - The button is down but there is insufficient movement to start the drag.
       *  - `DragContext.STATE.DRAGGING` - The button is down and movement has started the drag.
       *  - `DragContext.STATE.DROPPED` - The button has been released and drop has occurred.
       *  - `DragContext.STATE.ABORTED` - The drag has been aborted (this happens if the user presses the `ESC`
       *    key or if the {@link #function-abort} method is called).
       *
       * @member {Symbol}
       * @readonly
       * @internal
       */
      state: INIT,

      /**
       * The event that started the drag operation.
       * @member {Event}
       * @readonly
       */
      startEvent: event,

      /**
       * The timer that fires when a touch pointermove is allowed to start the drag. A touch pointermove event
       * prior to this will `abort()` the drag to allow touch scrolling.
       * @member {Number}
       * @private
       */
      touchStartTimer: null,

      /**
       * Stores the value from writes to the {@link #property-valid} property.
       * @member {Boolean}
       * @private
       */
      _valid: true
    });

    if ('touches' in event && me.touchStartDelay) {
      me.touchStartTimer = me.setTimeout(() => me.touchStartTimer = null, me.touchStartDelay, 'touchStartDelay');
    }

    EventHelper.on({
      element: globalThis,
      blur: 'onWindowBlur',
      thisObj: me
    });
  }

  doDestroy() {
    const me = this,
          {
      source,
      target
    } = me;
    me.cleanup();

    if ((target === null || target === void 0 ? void 0 : target.dropping) === me) {
      target.dropping = null;
    }

    if ((source === null || source === void 0 ? void 0 : source.dragging) === me) {
      source.dragging = null;
    }

    super.doDestroy();
  }

  onWindowBlur() {
    if (this.started) {
      this.abort();
    }
  }
  /**
   * This property is `true` if the {@link #function-abort} method was called and `false` otherwise. This
   * is typically because the user pressed the ESC key, however, a drag can be aborted for other reasons.
   * @property {Boolean}
   * @readonly
   */

  get aborted() {
    return this.state === ABORTED;
  }
  /**
   * Returns `true` if the drag has completed either by mouse/pointerup or the {@link #function-abort} method.
   * @property {Boolean}
   * @readonly
   */

  get completed() {
    return this.isDestroying || this.aborted || this.endEvent !== null;
  }
  /**
   * This property is `true` if the drag {@link #config-threshold} has not yet been reached.
   * @property {Boolean}
   * @readonly
   */

  get pending() {
    return this.state === INIT;
  }
  /**
   * This property is `true` if the drag {@link #config-threshold} has been reached and the drag operation is active.
   * @property {Boolean}
   * @readonly
   */

  get started() {
    return this.state !== INIT && !this.aborted;
  }
  /**
   * This property is `true` when the drag is in a valid drop state. This can be set to `false` to indicate the drop
   * is invalid. Setting to `true` does not ensure that the property will be `true` when next read due to other factors
   * that are required to make the drop valid. For example, setting `valid = true` will still return `false` if called
   * before the drag {@link #config-threshold} has not been reached or if the {@link #function-abort} method has been
   * called.
   * @property {Boolean}
   */

  get valid() {
    return this.started && this.targetElement != null && this._valid;
  }

  set valid(v) {
    this._valid = v;
  } //region Data Access

  /**
   * Retrieves a data item from the drag source. This method can only be called after the drag has completed.
   * @param {String|String[]} name The name of the data item.
   * @returns {*}
   * @async
   */

  async get(name) {
    if (this.aborted) {
      throw new Error('Data is not available on aborted drag');
    }

    if (!this.completed) {
      throw new Error('Data is not available until drag completion');
    }

    if (Array.isArray(name)) {
      return Promise.all(name.map(s => this.get(s)));
    }

    let value = this.data.get(name);

    if (typeof value === 'function') {
      value = await value();
      this.data.set(name, value);
    }

    return value;
  }
  /**
   * Returns `true` if the named data item is present.
   * @param {String} name The name of the data item.
   * @returns {Boolean}
   */

  has(name) {
    return this.data.has(name);
  }
  /**
   * Retrieves a data item from the drag source if it is available. This will return `true` for an item that was
   * {@link #function-set} using a renderer function.
   * @param {String|String[]} name The name of the data item.
   * @returns {*}
   */

  peek(name) {
    if (this.aborted) {
      throw new Error('Data is not available on aborted drag');
    }

    if (Array.isArray(name)) {
      return name.map(s => this.peek(s));
    }

    let value = this.data.get(name);

    if (typeof value === 'function') {
      value = true;
    }

    return value;
  }
  /**
   * Sets a data item for the drag. If a function is passed, it is called to render the data only if that data is
   * actually requested via the {@link #function-get} method. A data renderer function can be `async`.
   * @param {String} name The name of the data item.
   * @param {*} value The value of the data item.
   */

  set(name, value) {
    this.data.set(name, value);
  } //endregion
  //region Configs

  changeTarget(target, was) {
    if (target !== was) {
      const me = this;
      me._target = target;
      me.previousTarget = was;

      if (was) {
        was.dropping = null;
      }

      if (target) {
        target.dropping = me; // calls dragEnter/Leave on the target

        if (target.dropping !== me) {
          // if (target did not accept us)
          target = null;
          me.valid = false;
        }
      }

      me._target = was;
    }

    return target;
  }

  updateTarget(target, was) {
    const me = this;

    if (was) {
      me.source.dragLeaveTarget(me, was);
    }

    if (target) {
      me.valid = true; // Always give the target an initial dragMove since feedback/indicators will need to update on move and
      // the lack of a move on entry will just make that a special case.

      target.dragMove(me);
      me.source.dragEnterTarget(me);
    }
  }

  updateTargetElement(targetElement) {
    let droppable, droppables, droppableSelector, i, t; // We interrogate all encapsulating DOM elements to see if we are in a Droppable's element.
    // If we find an element which has Droppables registered for it, we attempt to set each as
    // our target, and go with the first one that accepts us.
    // changeTarget sets target.dropping to this Context, and the target's dragEnter implementation
    // may reject it by returning false.

    for (t = targetElement; t; t = t.parentElement) {
      droppables = DomDataStore.get(t, 'droppables');

      if (droppables) {
        for (i = 0; i < droppables.length; ++i) {
          droppable = droppables[i]; // If the event target is *inside* the Droppable's root, we can ask the Droppable
          // to accept this DragContext.
          // Otherwise we can get a hit on borders.

          if (droppable.dropRootElement.contains(targetElement)) {
            droppableSelector = droppable.droppableSelector; // If the target element is not inside the Droppable's selector, give up.

            if (!droppableSelector || targetElement.closest(`#${DomHelper.getId(droppable.dropRootElement)} ${droppableSelector}`)) {
              this.target = droppable; // The found Droppable accepted this DragContext, so we're done -
              // we are using this Droppable.

              if (this.target === droppable) {
                return;
              }
            }
          }
        }
      }
    }
  } //endregion
  //region Operations

  /**
   * Aborts the drag. After calling this method, {@link #property-aborted} will be `true`, {@link #property-valid}
   * will be `false` and {@link #property-completed} will be `true`.
   */

  abort() {
    const me = this,
          {
      element,
      source
    } = me; // Force a synchronous layout so that transitions from this point will work.

    element === null || element === void 0 ? void 0 : element.getBoundingClientRect();

    if (me.state !== DROPPED) {
      me.state = ABORTED;
      me.cleanup();
    }

    source === null || source === void 0 ? void 0 : source.endDrag(me);
  }

  begin() {
    const me = this,
          {
      source
    } = me,
          ret = source.beforeDrag(me);

    if (ret !== false) {
      source.dragging = me;
    }

    return ret;
  }

  cleanup() {
    let cleaner;

    while (cleaner = this.cleaners.pop()) {
      cleaner();
    }
  }

  end(event) {
    const me = this,
          {
      lastMoveEvent: lastEvent,
      target
    } = me,
          {
      dragSwallowClickTime
    } = me.source;
    me.event = me.endEvent = event;
    me.syncFlags();

    if (me.started) {
      if ((lastEvent === null || lastEvent === void 0 ? void 0 : lastEvent.clientX) !== event.clientX || (lastEvent === null || lastEvent === void 0 ? void 0 : lastEvent.clientY) !== event.clientY || (lastEvent === null || lastEvent === void 0 ? void 0 : lastEvent.target) !== event.target) {
        // Make sure the drop event is preceded by a move to the final position...
        me.track();
      }

      if (dragSwallowClickTime) {
        // Prevent the impending document click from the mouseup event from propagating
        // into a click on our element.
        EventHelper.on({
          element: document,
          capture: true,
          expires: dragSwallowClickTime,
          // In case a click did not ensue, remove the listener
          once: true,

          click(event) {
            event.stopPropagation();
          }

        });
      }

      me.state = DROPPED;

      if (target !== me.source) {
        // If we are the target and not also the source, we need to call dragDrop() now. If we are
        // the source, dragDrop() will be called by Draggable.
        target === null || target === void 0 ? void 0 : target.dragDrop(me);
      }
    }
  }

  fakeKey(event, down) {
    const me = this,
          {
      lastMoveEvent
    } = me;

    if (lastMoveEvent && me.element) {
      let changed; // Indicate that this is a 'fake' mousemove event as a result of the keydown

      lastMoveEvent.isKey = true;

      if (event.key === 'Alt') {
        if (me.altKey !== down) {
          me.altKey = down;
          changed = true;
        }
      } else if (event.key === 'Control') {
        if (me.ctrlKey !== down) {
          me.ctrlKey = down;
          changed = true;
        }
      }

      if (changed) {
        me.event = lastMoveEvent;
        me.track();
      }
    }
  }

  keyDown(event) {
    if (!this.completed) {
      if (event.key === 'Escape') {
        this.abort();
      } else if (this.isDragToggleKey(event.key)) {
        this.fakeKey(event, true);
      }
    }
  }

  keyUp(event) {
    if (!this.completed && this.isDragToggleKey(event.key)) {
      this.fakeKey(event, false);
    }
  }

  getDistance(event) {
    return EventHelper.getDistanceBetween(this.startEvent, event);
  }

  isDragToggleKey(key) {
    return key === 'Control' || key === 'Alt';
  }

  move(event) {
    const me = this,
          {
      target
    } = event,
          distance = me.getDistance(event),
          significant = distance >= me.threshold;
    me.syncFlags();

    if (me.touchStartTimer) {
      if (significant) {
        me.abort();
      }

      return;
    }

    if (target && target.nodeType === Node.ELEMENT_NODE) {
      if (significant && !me.started) {
        me.event = event; // triggers beforeDragStart, dragStart. returning false from beforeDragStart aborts drag

        if (me.start() === false) {
          me.abort();
          return;
        }
      }

      if (me.started) {
        me.lastMoveEvent = me.event = event; // to prevent view drag (scroll) on ipad

        if (event.type === 'touchmove') {
          event.preventDefault();
          event.stopImmediatePropagation();
        }

        me.track();
      }
    }
  }

  start() {
    const me = this,
          {
      scrollManager,
      monitoringConfig,
      source
    } = me,
          {
      draggingBodyCls: activeCls,
      dragLock
    } = source,
          element =
    /* source.dragWithin || */
    source.dragRootElement;
    me.state = DRAGGING; // Now that the drag drop is confirmed to be starting, activate the configured scrollManager if present

    if (scrollManager) {
      const detacher = scrollManager.startMonitoring(Objects.merge({
        scrollables: [{
          element
        }],
        direction: lockDirections[dragLock] || dragLock || 'both',

        callback(scrollerAction) {
          const {
            lastMoveEvent
          } = me;

          if (lastMoveEvent && me.element) {
            // Indicate that this is a 'fake' mousemove event as a result of the scrolling
            lastMoveEvent.isScroll = true;
            me.event = lastMoveEvent;
            me.scrollerAction = scrollerAction;
            me.track();
            me.scrollerAction = null;
          }
        }

      }, monitoringConfig));
      me.cleaners.push(detacher);
    } // Global informational class for when DragHelper is dragging

    const rootEl = source.dragRootElement.closest('.b-outer') || document.body;
    rootEl.classList.add(activeCls);
    me.cleaners.push(() => rootEl.classList.remove(activeCls));

    if (source.startDrag(me) === false) {
      me.cleanup();
      return false;
    }
  }

  syncFlags() {
    const me = this,
          {
      event
    } = me;
    me.altKey = event.altKey;
    me.ctrlKey = event.ctrlKey;
    me.metaKey = event.metaKey;
    me.shiftKey = event.shiftKey;
  }

  track() {
    const me = this,
          {
      event,
      source,
      target
    } = me;
    let targetElement = event.target,
        touch; // NOTE: we cannot syncFlags here since we are called to pass along keydown events as movement updates
    // "pointer-events:none" touchmove has no effect for the touchmove event target, meaning we cannot know
    // what's under the cursor as easily in touch devices

    if (event.type === 'touchmove') {
      touch = event.changedTouches[0]; // From MDN:
      //  * clientX/Y - the coordinates of the touch point relative to the left/top edge of the browser viewport,
      //    not including any scroll offset.
      //  * The elementFromPoint() method returns the topmost Element at the specified coordinates (relative to
      //    the viewport).

      targetElement = DomHelper.elementFromPoint(touch.clientX, touch.clientY);
    }

    me.targetElement = targetElement; // when we change elements, update me.target

    if (target === me.target) {
      // if we have a target and that did not change due to setting targetElement, we need to inform the target
      // of the drag move
      target === null || target === void 0 ? void 0 : target.dragMove(me);
    }

    source.trackDrag(me);
  } //endregion

}
DragContext.prototype.STATE = DragContext.STATE = Object.freeze({
  ABORTED,
  INIT,
  DRAGGING,
  DROPPED
});
DragContext._$name = 'DragContext';

/**
 * @module Core/util/drag/DragProxy
 */

/**
 * Drag proxies are helper classes that represent the object being dragged in some visual way. This is an abstract
 * base with which particular drag proxy classes (such as, {@link Core.util.drag.DragTipProxy} are registered.
 *
 * Derived classes the various template methods of this class to manage their particular form of visual feedback.
 * @extends Core/Base
 * @internal
 */

class DragProxy extends Base.mixin(Factoryable) {
  static get type() {
    return 'default';
  }

  static get configurable() {
    return {
      /**
       * The currently active `DragContext`. This context will be active prior to be passed to the proxy. This
       * config is set by {@link #function-dragStart} and cleared by {@link #function-dragEnd}.
       * @config {Core.util.drag.DragContext}
       */
      dragging: null
    };
  }

  static get factoryable() {
    return {
      defaultType: DragProxy
    };
  }
  /**
   * The `Draggable` instance that owns this drag proxy.
   * @member {Core.mixin.Draggable} owner
   * @readonly
   */
  //region Configs

  updateDragging(drag, was) {
    if (was) {
      this.close(was);
    }

    if (drag) {
      this.open(drag);
    }
  } //endregion
  //region Operations

  /**
   * This template method is called when {@link #config-dragging} is reset to `null`.
   * @param {Core.util.drag.DragContext} drag The drag instance.
   */

  close(drag) {// template
  }
  /**
   * This template method is called when {@link #config-dragging} is set to a non-`null` value.
   * @param {Core.util.drag.DragContext} drag The drag instance.
   */

  open(drag) {// template
  } //endregion
  //region Drag Processing

  /**
   * This template method is called by the `Draggable` instance when the drag officially starts.
   * This sets the {@link #config-dragging} config to `drag`, which triggers the call to {@link #function-open}.
   * @param {Core.util.drag.DragContext} drag The drag instance.
   */

  dragStart(drag) {
    this.dragging = drag;
  }
  /**
   * This template method is called by the `Draggable` instance as drag movement occurs.
   * @param {Core.util.drag.DragContext} drag The drag instance.
   */

  dragMove(drag) {// template
  }
  /**
   * This template method is called by the `Draggable` instance when the drag completes.
   *
   * This sets the {@link #config-dragging} config to `null`, which triggers the call to {@link #function-close}.
   * @param {Core.util.drag.DragContext} drag The drag instance.
   */

  dragEnd(drag) {
    this.dragging = null;
  } //endregion

}
DragProxy.initClass();
DragProxy._$name = 'DragProxy';

/**
 * @module Core/mixin/Draggable
 */

/**
 * Mix this into another class to enable drag/drop support.
 *
 * To use a draggable, it must be associated with an element that contains draggable content:
 *
 * ```javascript
 *  let draggable = new MyDraggable({
 *      dragRootElement : someElement
 *  });
 * ```
 *
 * Once the `dragRootElement` is assigned, any element inside that root is a candidate for dragging. To limit the
 * allowed element, set the {@link #config-dragSelector} config.
 *
 * ```javascript
 *  let draggable = new MyDraggable({
 *      dragRootElement : someElement,
 *      dragSelector    : '.drag-this'
 *  });
 * ```
 * @mixin
 * @internal
 */

var Draggable = (Target => class Draggable extends (Target || Base) {
  static get $name() {
    return 'Draggable';
  } //region Configs

  static get configurable() {
    return {
      /**
       * The current `DragContext`. This is created immediately on pointerdown but does not become active until
       * some movement occurs. This {@link #config-dragThreshold threshold} is configurable.
       * @member {Core.util.drag.DragContext}
       * @readonly
       */
      dragging: {
        $config: 'nullify',
        value: null
      },

      /**
       * A CSS selector to use to ascend from the {@link #config-dragRootElement} to find the element that will
       * gain the {@link #property-draggingCls} and {@link #property-draggingStartedCls} CSS classes.
       * @config {String}
       */
      draggingClsSelector: null,

      /**
       * The listeners to add to the `document` during a drag.
       * @config {Object}
       * @private
       */
      dragDocumentListeners: {
        element: document,
        keydown: 'onDragKeyDown',
        keyup: 'onDragKeyUp',
        // On mobile, a long-press will (sometimes) trigger a context menu, so we suppress it:
        contextmenu: 'onDragContextMenu',
        // We don't use pointermove/up because they get snared in the "touch-action" vs "pan-x/y" trap and we
        // cannot prevent panning (aka scrolling) in response to move events if we go that way:
        mousemove: 'onDragPointerMove',
        mouseup: 'onDragPointerUp',
        // Touch desktops don't fire touchend event when touch has ended, instead pointerup is fired. iOS does
        // fire touchend:
        pointerup: 'onDragPointerUp',
        touchend: 'onDragPointerUp',
        touchmove: {
          handler: 'onDragPointerMove',
          passive: false // We need to be able to preventDefault on the touchmove

        }
      },

      /**
       * A CSS selector to use to ascend from the drag element to find the element that will gain the
       * {@link #property-draggingItemCls} CSS class. If not supplied, the drag element will gain this CSS
       * class.
       * @config {String}
       */
      dragItemSelector: null,

      /**
       * A CSS class to add to items identified by the {@link #config-dragItemSelector} when the mouse
       * enters.
       * @config {String}
       */
      dragItemOverCls: null,

      /**
       * A function to call when the pointer enters a {@link #config-dragItemSelector}.
       * @config {Function} onDragItemMouseEnter
       */

      /**
       * A function to call when the pointer moves inside a {@link #config-dragItemSelector}.
       * @config {Function} onDragItemMouseMove
       */

      /**
       * A function to call when the pointer leaves a {@link #config-dragItemSelector}.
       * @config {Function} onDragItemMouseLeave
       */

      /**
       * Configure as `'x'` to lock dragging to the `X` axis (the drag will only move horizontally) or `'y'`
       * to lock dragging to the `Y` axis (the drag will only move vertically).
       * @config {String}
       */
      dragLock: null,

      /**
       * The minimum distance a drag must move to be considered a drop and not
       * {@link Core.util.drag.DragContext#property-aborted aborted}.
       * @config {Number}
       * @default
       */
      dragMinDistance: 1,

      /**
       * The {@link Core.util.drag.DragProxy drag proxy} is a helper object that can be used to display feedback
       * during a drag.
       * @config {Object|Core.util.drag.DragProxy}
       */
      dragProxy: {
        $config: ['lazy', 'nullify'],
        value: null
      },

      /**
       * The outer element where dragging will operate (attach events to it and use as root limit when looking
       * for ancestors).
       * @config {HTMLElement}
       */
      dragRootElement: {
        $config: 'nullify',
        value: null
      },

      /**
       * Set to `true` to allow a drag to drop on to the same element from which the drag started.
       * @config {Boolean}
       * @default
       */
      dragSameTargetDrop: false,

      /**
       * A CSS selector used to determine which element(s) can be dragged.
       * @config {String}
       * @default
       */
      dragSelector: null,

      /**
       * The number of milliseconds after a pointerup to ignore click events on the document. This
       * is used to avoid the "up" event itself generating a `click` on the target.
       * @config {Number}
       * @default
       */
      dragSwallowClickTime: 50,

      /**
       * The amount of pixels to move pointer/mouse before it counts as a drag operation.
       * @config {Number}
       * @default
       */
      dragThreshold: 5,

      /**
       * The number of milliseconds that must elapse after a `touchstart` event before it is considered a drag. If
       * movement occurs before this time, the drag is aborted. This is to allow touch swipes and scroll gestures.
       * @config {Number}
       * @default
       */
      dragTouchStartDelay: 300,

      /**
       * The CSS selector to use to identify the closest valid target from the event target.
       * @config {String}
       */
      dropTargetSelector: null,

      /**
       * The {@link #config-dragSelector} item the mouse is currently over.
       * @member {HTMLElement} overItem
       * @readonly
       */
      overItem: null,
      testConfig: {
        dragSwallowClickTime: 50
      }
    };
  }

  static get properties() {
    return {
      /**
       * The CSS class to add to the {@link #config-dragRootElement} (or {@link #config-draggingClsSelector} from
       * there) as soon as the pointerdown event occurs.
       * @member {String}
       * @readonly
       */
      draggingCls: 'b-draggable-active',

      /**
       * The CSS class to add to the `body` element as soon as the {@link #config-dragThreshold} is reached and
       * an actual drag is in progress.
       * @member {String}
       * @readonly
       */
      draggingBodyCls: 'b-draghelper-active',
      // match DragHelper since we need the same treatment

      /**
       * The CSS class to add to the element being dragged as soon as the pointerdown event occurs.
       * @member {String}
       * @readonly
       */
      draggingItemCls: 'b-dragging-item',

      /**
       * The CSS class to add to the {@link #config-dragRootElement} (or {@link #config-draggingClsSelector} from
       * there) as soon as the {@link #config-dragThreshold} is reached and an actual drag is in progress.
       * @member {String}
       * @readonly
       */
      draggingStartedCls: 'b-draggable-started',

      /**
       * The CSS class that is added to the {@link #config-dragRootElement}, i.e., `'b-draggable'`.
       * @property {String}
       * @readonly
       */
      draggableCls: 'b-draggable'
    };
  } //endregion
  //region Drag Processing
  // These template methods are implemented by derived classes as desired. There is only one overlap with Droppable's
  // template methods (dragDrop) so that a class can easily mixin both Draggable and Droppable and always distinguish
  // whether it is acting as the source, the target, or both.

  /**
   * This template method is called when the mousedown of a potential drag operation occurs. This happens before the
   * gesture is known to be a drag, meaning the {@link #config-dragThreshold} has not been reached. This method
   * should initialize the {@link Core.util.drag.DragContext} using the {@link Core.util.drag.DragContext#function-set}
   * method. Alternatively, this method may return `false` to prevent the drag operation.
   *
   * *Important:* Because no drag has occurred at the time this method is called, only minimal processing should be
   * done (such as initializing the {@link Core.util.drag.DragContext}). Anything more should be done in the
   * {@link #function-dragStart} method or in response to the {@link #event-dragStart} event which happen only if
   * the user drags the mouse before releasing the mouse button.
   * @param {Core.util.drag.DragContext} drag
   */

  beforeDrag(drag) {
    const {
      dragRootElement,
      dragSelector
    } = this,
          target = dragSelector && drag.element.closest(dragSelector);
    return !dragSelector || Boolean(target && target === dragRootElement || dragRootElement.contains(target));
  }
  /**
   * This template method is called when the drag operation starts. This occurs when the {@link #config-dragThreshold}
   * has been reached.
   * Your implementation may return `false` to prevent the startup of the drag operation.
   * @param {Core.util.drag.DragContext} drag
   */

  dragStart(drag) {// template
  }
  /**
   * This template method is called as the drag moves. This occurs on each mouse/pointer/touchmove event.
   * @param {Core.util.drag.DragContext} drag
   */

  dragOver(drag) {// template
  }
  /**
   * This template method is called when the drag enters a {@link Core.mixin.Droppable target}.
   * @param {Core.util.drag.DragContext} drag
   */

  dragEnterTarget(drag) {// template
  }
  /**
   * This template method is called when the drag leaves a {@link Core.mixin.Droppable target}.
   * @param {Core.util.drag.DragContext} drag
   * @param {Core.mixin.Droppable} oldTarget The previous value of `drag.target`.
   */

  dragLeaveTarget(drag, oldTarget) {// template
  }
  /**
   * This template method is called when the drag operation completes. This occurs on the pointerup event.
   *
   * This method is not called if the drag is {@link Core.util.drag.DragContext#property-aborted aborted}.
   * @param {Core.util.drag.DragContext} drag
   */

  dragDrop(drag) {// template
  }
  /**
   * This template method is called when the drag operation completes. This occurs on the pointerup event or perhaps
   * a keypress event.
   *
   * This method is always called, even if the drag is {@link Core.util.drag.DragContext#property-aborted aborted}.
   * @param {Core.util.drag.DragContext} drag
   */

  dragEnd(drag) {// template
  } //endregion
  //region Drag Management
  // These methods are called by the DragContext and generally manage element updates (adding/removing classes) or
  // event firing. In most cases these methods then call a corresponding Drag Processing template method intended
  // for derived classes to implement.

  get activeDrag() {
    const {
      dragging: drag
    } = this;
    return drag !== null && drag !== void 0 && drag.started && !drag.completed ? drag : null;
  }
  /**
   * Return the `Events` instance from which drag events are fired.
   * @internal
   * @property {Core.mixin.Events}
   */

  get dragEventer() {
    return this.trigger ? this : null; // simple Events feature detector
  }

  get draggingClassElement() {
    const {
      draggingClsSelector,
      dragRootElement
    } = this;
    return draggingClsSelector ? dragRootElement === null || dragRootElement === void 0 ? void 0 : dragRootElement.closest(draggingClsSelector) : dragRootElement;
  }

  beginDrag(drag) {
    const {
      draggingCls,
      draggingClassElement
    } = this;

    if (draggingCls && draggingClassElement) {
      draggingClassElement.classList.add(draggingCls);
      drag.cleaners.push(() => draggingClassElement.classList.remove(draggingCls));
    }
  }

  async endDrag(drag) {
    const me = this,
          {
      dragEventer,
      dragProxy
    } = me;

    if (drag.valid) {
      // The implementation may be async. If so, any Promise must always be
      // propagated back to a point which may have to await it
      await me.dragDrop(drag);
    }

    if (me.isDestroyed) {
      return;
    }

    if (drag.pending) {
      drag.destroy();
    } else {
      me.dragEnd(drag);
      dragProxy === null || dragProxy === void 0 ? void 0 : dragProxy.dragEnd(drag);
      /**
       * This event is fired when a drag gesture is completed due to the user aborting it (with the `ESC` key) or
       * if the {@link Core.util.drag.DragContext#function-abort} method was called.
       * @event dragCancel
       * @param {Core.mixin.Draggable} source The draggable instance that fired the event.
       * @param {Core.util.drag.DragContext} drag The drag context.
       * @param {Event} event The browser event.
       */

      /**
       * This event is fired when a drag gesture is completed successfully.
       *
       * This event is **not** fired if the drag was aborted by the user pressing the `ESC` key or if the
       * {@link Core.util.drag.DragContext#function-abort} method was called.
       * @event drop
       * @param {Core.mixin.Draggable} source The draggable instance that fired the event.
       * @param {Core.util.drag.DragContext} drag The drag context.
       * @param {Event} event The browser event.
       */

      dragEventer === null || dragEventer === void 0 ? void 0 : dragEventer.trigger(drag.valid ? 'drop' : 'dragCancel', {
        drag,
        event: drag.event
      }); // The drag context could have registered finalizers added by the above methods or event. If so, we need to
      // wait for finalization of the drag before we clear our "dragging" config.

      me.finalizeDrag(drag);
    }
  }

  async finalizeDrag(drag) {
    await drag.finalize(); // The doFinalize() method of DragContext is called by the above await... which nulls our "dragging" config
  }

  moveDrag(drag) {
    if (this.dragOver(drag) !== false) {
      const {
        dragEventer,
        dragProxy
      } = this;
      dragProxy === null || dragProxy === void 0 ? void 0 : dragProxy.dragMove(drag);
      /**
       * This event is fired as a drag gesture progresses due to cursor movement.
       * @event drag
       * @param {Core.mixin.Draggable} source The draggable instance that fired the event.
       * @param {Core.util.drag.DragContext} drag The drag context.
       * @param {Event} event The browser event.
       */

      dragEventer === null || dragEventer === void 0 ? void 0 : dragEventer.trigger('drag', {
        drag,
        event: drag.event
      });
    }
  }

  setupDragContext(event) {
    const me = this,
          {
      dragItemSelector,
      id
    } = me,
          {
      target
    } = event;
    return {
      event,
      id: id ? `${id}-drag-${me._nextDragId = (me._nextDragId || 0) + 1}` : null,
      itemElement: dragItemSelector ? target.closest(dragItemSelector) : target,
      touchStartDelay: me.dragTouchStartDelay,
      source: me,
      threshold: me.dragThreshold
    };
  }

  startDrag(drag) {
    const {
      draggingStartedCls,
      draggingClassElement,
      draggingItemCls,
      dragEventer,
      dragProxy
    } = this,
          {
      itemElement
    } = drag;
    /**
     * This event is fired prior to starting a drag gesture. This does not occur immediately after the user
     * performs the pointer/mousedown/touchstart but only after the {@link #config-dragThreshold} amount of
     * movement has taken place.
     *
     * The drag is canceled if a listener returns `false`.
     * @event beforeDragStart
     * @param {Core.mixin.Draggable} source The draggable instance that fired the event.
     * @param {Core.util.drag.DragContext} drag The drag context.
     * @param {Event} event The browser event.
     * @preventable
     */

    if ((dragEventer === null || dragEventer === void 0 ? void 0 : dragEventer.trigger('beforeDragStart', {
      drag,
      event: drag.event
    })) === false) {
      return false;
    }

    if (draggingStartedCls && draggingClassElement) {
      draggingClassElement.classList.add(draggingStartedCls);
      drag.cleaners.push(() => draggingClassElement.classList.remove(draggingStartedCls));
    }

    if (draggingItemCls && itemElement) {
      itemElement.classList.add(draggingItemCls);
      drag.cleaners.push(() => itemElement.classList.remove(draggingItemCls));
    }

    dragProxy === null || dragProxy === void 0 ? void 0 : dragProxy.dragStart(drag);
    const result = this.dragStart(drag);

    if (result !== false) {
      /**
       * This event is fired when a drag gesture has started. This does not occur immediately after the user
       * performs the pointer/mousedown/touchstart but only after the {@link #config-dragThreshold} amount of
       * movement has taken place.
       * @event dragStart
       * @param {Core.mixin.Draggable} source The draggable instance that fired the event.
       * @param {Core.util.drag.DragContext} drag The drag context.
       * @param {Event} event The browser event.
       */
      dragEventer === null || dragEventer === void 0 ? void 0 : dragEventer.trigger('dragStart', {
        drag,
        event: drag.event
      });
    }

    return result;
  }

  trackDrag(drag) {
    var _drag$targetElement;

    const {
      dropTargetSelector
    } = this;
    drag.valid = !(dropTargetSelector && !((_drag$targetElement = drag.targetElement) !== null && _drag$targetElement !== void 0 && _drag$targetElement.closest(dropTargetSelector)));
    this.moveDrag(drag);
  } //endregion
  //region Configs

  configureListeners(drag) {
    const me = this,
          listeners = ObjectHelper.assign({
      thisObj: me
    }, me.dragDocumentListeners); // Only listen for the events related to how the drag was initiated:

    if ('touches' in drag.startEvent) {
      delete listeners.mousemove;
      delete listeners.mouseup;
    } else {
      delete listeners.contextmenu;
      delete listeners.touchmove;
      delete listeners.touchend;
      delete listeners.pointerup;
    }

    return listeners;
  } //endregion
  //region Configs

  updateDragging(drag, old) {
    const me = this;

    if (drag) {
      const listeners = me.configureListeners(drag);
      drag.cleaners.push(EventHelper.on(listeners));
      me.beginDrag(drag);
    } else if (old) {
      old.destroy();
    }
  }

  changeDragProxy(config, existing) {
    return DragProxy.reconfigure(existing, config, {
      owner: this,
      defaults: {
        owner: this
      }
    });
  }

  updateDragRootElement(rootEl, was) {
    var _me$_dragRootDetacher;

    const me = this,
          {
      draggableCls,
      dragItemSelector,
      onDragItemMouseMove
    } = me;
    was === null || was === void 0 ? void 0 : was.classList.remove(draggableCls);
    (_me$_dragRootDetacher = me._dragRootDetacher) === null || _me$_dragRootDetacher === void 0 ? void 0 : _me$_dragRootDetacher.call(me);

    if (rootEl) {
      const listeners = {
        thisObj: me,
        element: rootEl,
        mousedown: 'onDragMouseDown',
        // We have touchstart listener in place since Siesta/Chrome can send these events even on non-touch
        // devices:
        touchstart: 'onDragTouchStart',
        // On iOS, because we use pointerup to represent the drop gesture,
        // the initiating pointerdown event is captured, and its target is
        // the original start target. We must always release pointer capture.
        // https://github.com/bryntum/support/issues/4111
        pointerdown: e => {
          var _e$target$releasePoin, _e$target;

          return e.pointerId && ((_e$target$releasePoin = (_e$target = e.target).releasePointerCapture) === null || _e$target$releasePoin === void 0 ? void 0 : _e$target$releasePoin.call(_e$target, e.pointerId));
        }
      };

      if (onDragItemMouseMove) {
        listeners.mousemove = {
          delegate: dragItemSelector,
          handler: 'onDragItemMouseMove'
        };
      }

      if (me.dragItemOverCls || onDragItemMouseMove || me.onDragItemMouseEnter || me.onDragItemMouseLeave) {
        Object.assign(listeners, {
          mouseover: {
            delegate: dragItemSelector,
            handler: 'onDragItemMouseOver'
          },
          mouseout: {
            delegate: dragItemSelector,
            handler: 'onDragItemMouseOut'
          }
        });
      }

      rootEl.classList.add(draggableCls);
      me._dragRootDetacher = EventHelper.on(listeners);
    }
  } //endregion
  //region Events

  onDragItemMouseOver(event) {
    this.overItem = event;
  }

  onDragItemMouseOut(event) {
    if (!this.dragging) {
      this.overItem = event;
    }
  }

  changeOverItem(event) {
    this.enterLeaveEvent = event;

    if (event.type === 'mouseout') {
      var _event$relatedTarget;

      // Must return null, not undefined to unset the overItem property
      return ((_event$relatedTarget = event.relatedTarget) === null || _event$relatedTarget === void 0 ? void 0 : _event$relatedTarget.closest(this.dragItemSelector)) || null;
    } else {
      return event.target.closest(this.dragItemSelector);
    }
  }

  updateOverItem(overItem, oldOverItem) {
    const me = this,
          {
      dragItemOverCls
    } = me;

    if (oldOverItem) {
      var _me$onDragItemMouseLe;

      dragItemOverCls && oldOverItem.classList.remove(dragItemOverCls);
      (_me$onDragItemMouseLe = me.onDragItemMouseLeave) === null || _me$onDragItemMouseLe === void 0 ? void 0 : _me$onDragItemMouseLe.call(me, me.enterLeaveEvent, oldOverItem);
    }

    if (overItem) {
      var _me$onDragItemMouseEn;

      dragItemOverCls && overItem.classList.add(dragItemOverCls);
      (_me$onDragItemMouseEn = me.onDragItemMouseEnter) === null || _me$onDragItemMouseEn === void 0 ? void 0 : _me$onDragItemMouseEn.call(me, me.enterLeaveEvent, overItem);
    }
  }

  onDragContextMenu(event) {
    event.preventDefault();
  }

  onDragKeyDown(event) {
    this.dragging.keyDown(event);
  }

  onDragKeyUp(event) {
    this.dragging.keyUp(event);
  }
  /**
   * Grab draggable element on mouse down.
   * @param {Event} event
   * @private
   */

  onDragMouseDown(event) {
    // only dragging with left mouse button
    if (event.button === 0) {
      this.onDragPointerDown(event);
    }
  }
  /**
   * Grab draggable element on pointerdown.
   * @param {Event} event
   * @private
   */

  onDragPointerDown(event) {
    let {
      dragging: drag
    } = this; // If a drag is ongoing already, finalize it and don't proceed with new drag (happens if user does pointerup
    // outside browser window). Also handles the edge case of trying to start a new drag while previous is awaiting
    // finalization, in which case it just bails out.

    if (!drag) {
      drag = this.setupDragContext(event); // The DragContext consults our beforeDrag handler, and if that succeeds, the Context injects itself into
      // this instance as our draggable ("this.dragging").
      // NOTE: This is not yet an actual drag. At this stage, the context is used to detect movement prior to
      // mouseup (aka "a drag"). Should the requisite amount of movement occur, the drag will be started.

      if (drag) {
        drag = new DragContext(drag);

        if (drag.begin() === false) {
          drag.destroy();
        }
      }
    } else if (!drag.isFinalizing) {
      drag.abort();
    }
  } // Set by the DragContext in its begin method, and auto-nullified at destruction.

  changeDragging(value, was) {
    was === null || was === void 0 ? void 0 : was.destroy();
    return value;
  }

  onDragPointerMove(event) {
    const {
      dragging: drag
    } = this;

    if (drag && !drag.completed) {
      drag === null || drag === void 0 ? void 0 : drag.move(event);
    }
  }

  onDragPointerUp(event) {
    const {
      dragging: drag
    } = this;

    if (drag && !drag.completed) {
      drag.end(event);
      this.endDrag(drag);
    }
  }
  /**
   * @param {Event} event
   * @private
   */

  onDragTouchStart(event) {
    // only allowing one finger for now...
    if (event.touches.length === 1) {
      this.onDragPointerDown(event);
    }
  } //endregion

});

/**
 * @module Core/mixin/Droppable
 */

/**
 * Mix this into another class to enable drop support and receive drops from {@link Core.mixin.Draggable draggables}.
 *
 * There are 4 basic methods that a droppable implements. These methods are called as drag operations occur:
 *
 * ```javascript
 *  class MyDroppable extends Base.mixin(Droppable) {
 *      dragEnter(drag) {
 *          // a drag has entered the drop zone... create some type of drop indicator perhaps
 *      }
 *
 *      dragMove(drag) {
 *          // a drag has changed position... update drop indicators
 *      }
 *
 *      dragDrop(drag) {
 *          // drop has occurred... process data from the drag context
 *      }
 *
 *      dragLeave(drag) {
 *          // the drag has left the drop zone... cleanup indicators
 *      }
 *  }
 * ```
 *
 * Instances of `Droppable` are associated with an element to receive drag operations:
 *
 * ```javascript
 *  let target = new MyDroppable({
 *      dropRootElement : someElement
 *  });
 * ```
 * @mixin
 * @internal
 */

var Droppable = (Target => class Droppable extends (Target || Base) {
  static get $name() {
    return 'Droppable';
  } //region Configs

  static get configurable() {
    return {
      /**
       * A selector, which, if specified, narrows the dropability to child elements of the
       * {@link #config-dropRootElement} which match this selector.
       * @config {String}
       */
      droppableSelector: null,

      /**
       * The current `DragContext`. This is set when a drag enters this target. Changing this config causes the
       * {@link #function-dragEnter} and {@link #function-dragLeave} methods to be called. If `dragEnter` returns
       * `false` for a drag, this value will be set to `null`.
       * @member {Core.util.drag.DragContext}
       * @readonly
       */
      dropping: null,

      /**
       * Set this config to the element where drops should be received. When set, the `b-droppable` CSS class is
       * added to the element and the `Droppable` instance is associated with that element so that it can be
       * found by {@link Core.mixin.Draggable draggables}.
       * @config {HTMLElement}
       */
      dropRootElement: {
        $config: 'nullify',
        value: null
      }
    };
  }
  /**
   * Return the `Events` instance from which drop events are fired.
   * @internal
   * @property {Core.mixin.Events}
   */

  get dropEventer() {
    return this.trigger ? this : null; // simple Events feature detector
  }
  /**
   * Returns the CSS class that is added to the {@link #config-dropRootElement}, i.e., `'b-droppable'`.
   * @property {String}
   * @readonly
   */

  get droppableCls() {
    return 'b-droppable';
  } //endregion
  //region Drop Management

  /**
   * This method is called when a drag enters this droppable's `dropRootElement`. In many cases, this method is used
   * to create some sort of drop indicator to provide user feedback.
   *
   * If this method does not return `false`, the {@link #property-dropping} config will retain the given `drag` context
   * which was set prior to this method being called.
   *
   * If this method returns `false`, the drop will not be accepted. Neither {@link #function-dragDrop} nor
   * {@link #function-dragLeave} will be called for this drop. If the drag leaves this target and re-enters, this
   * method will be called again. While `dropping` will already be updated before this method is called, it will be
   * reset to `null` in this case.
   *
   * The base class implementation of this method fires the {@link #event-dragEnter} event.
   * @param {Core.util.drag.DragContext} drag
   * @returns {Boolean}
   */

  dragEnter(drag) {
    var _this$dropEventer;

    /**
     * This event is fired when a drag enters this droppable's `dropRootElement`. It is fired by the droppable's
     * {@link #function-dragEnter} method.
     * @event dragEnter
     * @param {Core.mixin.Draggable} source The draggable instance that fired the event.
     * @param {Core.util.drag.DragContext} drag The drag context.
     * @param {Event} event The browser event.
     */
    return (_this$dropEventer = this.dropEventer) === null || _this$dropEventer === void 0 ? void 0 : _this$dropEventer.trigger('dragEnter', {
      drag,
      event: drag.event
    });
  }
  /**
   * This method is called when the drag that was previously announced via {@link #function-dragEnter} moves to a new
   * position. This is typically where drop indicators are updated to reflect the new position.
   *
   * The base class implementation of this method fires the {@link #event-dragMove} event.
   * @param {Core.util.drag.DragContext} drag
   */

  dragMove(drag) {
    var _this$dropEventer2;

    /**
     * This event is fired when the drag that was previously announced via {@link #event-dragEnter} moves to a new
     * position. It is fired by the droppable's {@link #function-dragMove} method.
     * @event dragMove
     * @param {Core.mixin.Draggable} source The draggable instance that fired the event.
     * @param {Core.util.drag.DragContext} drag The drag context.
     * @param {Event} event The browser event.
     */
    return (_this$dropEventer2 = this.dropEventer) === null || _this$dropEventer2 === void 0 ? void 0 : _this$dropEventer2.trigger('dragMove', {
      drag,
      event: drag.event
    });
  }
  /**
   * This method is called when the drag that was previously announced via {@link #function-dragEnter} has ended with
   * a drop. In addition to any cleanup (since {@link #function-dragLeave} will not be called), this method handles
   * any updates associated with the data from the drag context and the position of the drop.
   *
   * The base class implementation of this method fires the {@link #event-drop} event.
   * @param {Core.util.drag.DragContext} drag
   */

  dragDrop(drag) {
    var _this$dropEventer3;

    /**
     * This event is fired when the drag that was previously announced via {@link #event-dragEnter} has ended with
     * a drop. It is fired by the droppable's {@link #function-dragDrop} method.
     *
     * This event is **not** fired when a drag gesture is aborted by the user pressing the `ESC` key or if the
     * {@link Core.util.drag.DragContext#function-abort} method is called.
     * @event drop
     * @param {Core.mixin.Draggable} source The draggable instance that fired the event.
     * @param {Core.util.drag.DragContext} drag The drag context.
     * @param {Event} event The browser event.
     */
    return (_this$dropEventer3 = this.dropEventer) === null || _this$dropEventer3 === void 0 ? void 0 : _this$dropEventer3.trigger('drop', {
      drag,
      event: drag.event
    });
  }
  /**
   * This method is called when the drag that was previously announced via {@link #function-dragEnter} leaves this
   * droppable's `dropRootElement`, or the drag is {@link Core.util.drag.DragContext#property-aborted} by the user
   * pressing the `ESC` key, or the {@link Core.util.drag.DragContext#function-abort} method is called.
   *
   * This is the time to cleanup anything created by `dragEnter`.
   *
   * The base class implementation of this method fires the {@link #event-dragLeave} event.
   * @param {Core.util.drag.DragContext} drag
   */

  dragLeave(drag) {
    var _this$dropEventer4;

    /**
     * This event is fired when the drag that was previously announced via {@link #event-dragEnter} leaves this
     * droppable's `dropRootElement`. It is fired by the droppable's {@link #function-dragLeave} method.
     * @event dragLeave
     * @param {Core.mixin.Draggable} source The draggable instance that fired the event.
     * @param {Core.util.drag.DragContext} drag The drag context.
     * @param {Event} event The browser event.
     */
    return (_this$dropEventer4 = this.dropEventer) === null || _this$dropEventer4 === void 0 ? void 0 : _this$dropEventer4.trigger('dragLeave', {
      drag,
      event: drag.event
    });
  } //endregion
  //region Configs

  changeDropping(dropping, was) {
    if (dropping !== was) {
      const me = this;

      if (was) {
        if (was.aborted || !was.completed) {
          me.dragLeave(was);
        }
      }

      if (dropping) {
        me._dropping = dropping; // update config value early in case dragEnter et al refer to it

        if (me.dragEnter(dropping) === false) {
          dropping = null;
        }

        me._dropping = was; // restore the value so that updateDropping is called as it should be
      }
    }

    return dropping;
  }

  updateDropRootElement(rootEl, was) {
    const me = this,
          {
      droppableCls
    } = me;
    let droppables, i, removeCls;

    if (was) {
      droppables = DomDataStore.get(was, 'droppables');
      removeCls = true;

      if (Array.isArray(droppables) && (i = droppables.indexOf(me)) > -1) {
        if (droppables.length < 2) {
          DomDataStore.remove(was, 'droppables');
        } else {
          droppables.splice(i, 1);
          droppables.forEach(d => {
            if (droppableCls === d.droppableCls) {
              removeCls = false; // our droppableCls may need to stay
            }
          });
        }
      }

      removeCls && was.classList.remove(droppableCls);
    }

    if (rootEl) {
      droppables = DomDataStore.get(rootEl, 'droppables');

      if (droppables) {
        droppables.push(me);
      } else {
        DomDataStore.set(rootEl, 'droppables', [me]);
      }

      rootEl.classList.add(droppableCls);
    }
  } //endregion

});

/**
 * @module Core/widget/util/AvatarRendering
 */

/**
 * Internal utility class providing rendering of avatars / resource initials.
 *
 * @internal
 * @extends Core/Base
 */

class AvatarRendering extends Base {
  static get $name() {
    return 'AvatarRendering';
  }

  static get configurable() {
    return {
      /**
       * Element used to listen for load errors on. Normally the owning widgets own element.
       * @config {HTMLElement}
       */
      element: null,

      /**
       * Prefix prepended to a supplied color to create a CSS class applied when showing initials.
       * @config {String}
       * @default
       */
      colorPrefix: 'b-sch-',

      /**
       * A tooltip config object to enable using a custom tooltip for the avatars. Listen for `beforeShow` and set
       * your html there.
       * @config {Object}
       */
      tooltip: null,
      size: null
    };
  }

  doDestroy() {
    var _this$tooltip;

    (_this$tooltip = this.tooltip) === null || _this$tooltip === void 0 ? void 0 : _this$tooltip.destroy();
    super.doDestroy();
  }

  updateElement(element) {
    // Error listener
    EventHelper.on({
      element,
      delegate: '.b-resource-image',
      error: 'onImageErrorEvent',
      thisObj: this,
      capture: true
    });
  }

  changeTooltip(config) {
    return Tooltip.new({
      forElement: this.element,
      forSelector: '.b-resource-avatar',
      cls: 'b-resource-avatar-tooltip'
    }, config);
  }

  static get failedUrls() {
    if (!this._failedUrls) {
      this._failedUrls = new Set();
    }

    return this._failedUrls;
  }
  /**
   * Returns a DOM config object containing a resource avatar, icon or resource initials. Display priority in that
   * order.
   * @param {Object} options Avatar options
   * @param {String} options.initials Resource initials
   * @param {String} options.color Background color for initials
   * @param {String} options.iconCls Icon cls
   * @param {String} options.imageUrl Image url
   * @param {String} options.defaultImageUrl Default image url, fallback if image fails to load or there is none
   * specified. Leave out to show initials instead.
   * @param {Object} [options.dataset] Dataset to apply to the resulting element
   * @param {String} [options.alt] Image description
   * @returns {Object}
   * @internal
   */

  getResourceAvatar({
    initials,
    color,
    iconCls,
    imageUrl,
    defaultImageUrl,
    dataset = {},
    alt
  }) {
    return this.getImageConfig(initials, color, imageUrl, defaultImageUrl, dataset, alt) || this.getIconConfig(iconCls, dataset) || this.getResourceInitialsConfig(initials, color, dataset);
  }

  getImageConfig(initials, color, imageUrl, defaultImageUrl, dataset, alt) {
    const {
      size
    } = this; // Fall back to defaultImageUrl if imageUrl is known to fail

    imageUrl = AvatarRendering.failedUrls.has(imageUrl) ? defaultImageUrl : imageUrl || defaultImageUrl;

    if (imageUrl) {
      return _objectSpread2(_objectSpread2({
        tag: 'img',
        draggable: 'false',
        class: {
          'b-resource-avatar': 1,
          'b-resource-image': 1
        }
      }, size ? {
        style: {
          height: size + 'px',
          width: size + 'px'
        }
      } : undefined), {}, {
        // Prevent iOS from zooming and showing image full screen
        ontouchstart: 'return false',
        alt,
        elementData: {
          defaultImageUrl,
          imageUrl,
          initials,
          color,
          dataset
        },
        src: imageUrl,
        dataset
      });
    }
  }

  getIconConfig(iconCls, dataset) {
    if (iconCls) {
      return iconCls && {
        tag: 'i',
        class: {
          'b-resource-avatar': 1,
          'b-resource-icon': 1,
          [iconCls]: 1
        },
        dataset
      };
    }
  }

  getResourceInitialsConfig(initials, color, dataset) {
    const {
      size
    } = this,
          // eventColor = #FF5555, apply as background-color
    namedColor = DomHelper.isNamedColor(color) && color,
          // eventColor = red, add b-sch-red cls
    hexColor = !namedColor && color;
    return {
      tag: 'div',
      class: {
        'b-resource-avatar': 1,
        'b-resource-initials': 1,
        [`${this.colorPrefix}${namedColor}`]: namedColor
      },
      style: _objectSpread2({
        backgroundColor: hexColor || null
      }, size ? {
        height: size + 'px',
        width: size + 'px'
      } : undefined),
      children: [initials],
      dataset
    };
  }

  onImageErrorEvent({
    target
  }) {
    if (!target.matches('.b-resource-avatar')) {
      return;
    }

    const {
      defaultImageUrl,
      initials,
      color,
      imageUrl,
      dataset
    } = target.elementData;

    if (defaultImageUrl && !target.src.endsWith(defaultImageUrl.replace(/^[./]*/gm, ''))) {
      target.src = defaultImageUrl;
    } else {
      const initialsEl = DomHelper.createElement(this.getResourceInitialsConfig(initials, color, dataset));
      initialsEl.elementData = target.elementData;
      target.parentElement.replaceChild(initialsEl, target);
    } // Remember failed urls, to avoid trying to load them again next time

    AvatarRendering.failedUrls.add(imageUrl);
  }

}
AvatarRendering._$name = 'AvatarRendering';

export { ActionBase, AvatarRendering, DragContext, DragProxy, Draggable, Droppable, Finalizable, StateBase, StateTrackingManager, Transaction };
//# sourceMappingURL=AvatarRendering.js.map
