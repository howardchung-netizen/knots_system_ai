/**
 * React Fullscreen button wrapper
 */
import React, { useEffect, useRef } from 'react';
import { Button, Fullscreen } from '@bryntum/gantt';

var BryntumFullscreenButton = function BryntumFullscreenButton() {
  var elRef = useRef(null);
  useEffect(function () {
    if (Fullscreen.enabled) {
      var button = new Button({
        adopt: elRef.current,
        icon: 'b-icon b-icon-fullscreen',
        tooltip: 'Fullscreen',
        cls: 'b-raised b-blue',
        toggleable: true,
        onToggle: function onToggle(_ref) {
          var pressed = _ref.pressed;
          pressed ? Fullscreen.request(document.documentElement) : Fullscreen.exit();
        }
      });
      Fullscreen.onFullscreenChange(function () {
        button.pressed = Fullscreen.isFullscreen;
      });
    }
  });
  return /*#__PURE__*/React.createElement("div", {
    ref: elRef
  });
};

export default BryntumFullscreenButton;