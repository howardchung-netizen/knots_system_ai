import Base from '../../Base.js';
import BrowserHelper from '../../helper/BrowserHelper.js';

export default Target => class RTL extends (Target || Base) {
    static $name = 'RTL';

    get widgetClass() {}

    static configurable = {
        // Force rtl
        rtl : null
    };

    updateRtl(rtl) {
        this.element.classList.toggle('b-rtl', rtl === true);
        this.element.classList.toggle('b-ltr', rtl === false);
    }

    // Render is only called on outer widgets, children read their setting from their owner unless explicitly set
    render(...args) {
        super.render && super.render(...args);

        // TODO: Remove in 6.0
        if (
            (BrowserHelper.isChrome && BrowserHelper.chromeVersion < 87) ||
            (BrowserHelper.isFirefox && BrowserHelper.firefoxVersion < 66) ||
            (BrowserHelper.isSafari && BrowserHelper.safariVersion < 14.1)
        ) {
            this.element.classList.add('b-legacy-inset');
        }
        // Detect if rtl (catches both attribute `dir="rtl"` and CSS `direction: rtl`, as well as if owner uses rtl)
        if (getComputedStyle(this.element).direction === 'rtl' || this.owner?.rtl) {
            this.rtl = true;
        }
    }
};
