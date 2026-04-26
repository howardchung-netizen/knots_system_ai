/**
 * Header for Bryntum demos
 */
import React, { Fragment } from 'react';
import { propTypes } from 'prop-types';
import BryntumFullscreenButton from './BryntumFullscreenButton';
import BryntumTrialButton from './BryntumTrialButton';

const BryntumDemoHeader = (props) => {
    const { href } = props,
          title    = document.title.split(' - ')[1] || document.title;

    return (
        <Fragment>
            <header className = "demo-header">
                <div id = "title-container">
                    <a id = "title" href = {href}>
                        <h1>{title}</h1>
                    </a>
                </div>
                {props.children}
                <BryntumTrialButton
                    productId = "gantt"
                    cls = "b-green b-raised"
                />
                <BryntumFullscreenButton />
            </header>
        </Fragment>
    );
};

BryntumDemoHeader.propTypes = {
    title: propTypes.string,
    href : propTypes.string
};

BryntumDemoHeader.defaultProps = {
    title: 'Bryntum React demo',
    href : 'https://bryntum.com'
};

export default BryntumDemoHeader;
