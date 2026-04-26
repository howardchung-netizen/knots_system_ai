import Base from '../../Base.js';
import ObjectHelper from '../../helper/ObjectHelper.js';

export default Target => class KeyMap extends (Target || Base) {
    static $name = 'KeyMap';

    get widgetClass() {}

    static configurable = {
        keyMap : {
            value : null,

            $config : {
                merge : 'objects'
            }
        }
    }

    performKeyMapAction(keyEvent, bryntumEvent) {
        const { keyMap } = this;

        if (keyMap) {
            const
                // Match a defined key combination, such as `Ctrl + Enter`
                keyCombination = ObjectHelper.keys(keyMap).find(keyString => {
                    const
                        keys         = keyString.split('+'),
                        requireShift = keys.includes('Shift'),
                        requireCtrl  = keys.includes('Ctrl');

                    // Last key should be the actual key, modifiers in any order before it
                    return keys[keys.length - 1].toLowerCase() === keyEvent.key.toLowerCase() &&
                        ((!keyEvent.ctrlKey && !requireCtrl) || (keyEvent.ctrlKey && requireCtrl)) &&
                        ((!keyEvent.shiftKey && !requireShift) || (keyEvent.shiftKey && requireShift));
                }),
                // Get the action (fn to call) for that key combination
                action         = keyMap[keyCombination];

            if (action) {
                if (typeof action === 'string') {
                    this[action](bryntumEvent || keyEvent);
                }
                else {
                    action.call(this);
                }

                return true;
            }
        }

        return false;
    }
};
