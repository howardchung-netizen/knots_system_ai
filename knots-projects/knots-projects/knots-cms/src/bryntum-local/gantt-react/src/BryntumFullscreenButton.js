/**
 * React Fullscreen button wrapper
 */

import React, { useEffect, useRef } from 'react';
import { Button, Fullscreen } from '@bryntum/gantt';

const BryntumFullscreenButton = () => {

    const elRef = useRef(null);

    useEffect(() => {
        if (Fullscreen.enabled) {
            const button = new Button({
                adopt      : elRef.current,
                icon       : 'b-icon b-icon-fullscreen',
                tooltip    : 'Fullscreen',
                cls        : 'b-raised b-blue',
                toggleable : true,
                onToggle   : ({ pressed }) => {
                    pressed ? Fullscreen.request(document.documentElement) : Fullscreen.exit();
                }
            });

            Fullscreen.onFullscreenChange(() => {
                button.pressed = Fullscreen.isFullscreen;
            });
        }
    });

    return (
        <div ref={elRef} />
    );

};

export default BryntumFullscreenButton;
