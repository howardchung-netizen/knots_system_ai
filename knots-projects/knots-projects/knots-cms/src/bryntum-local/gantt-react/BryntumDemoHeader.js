/**
 * Header for Bryntum demos
 */
import React, { Fragment } from 'react';
import BryntumFullscreenButton from './BryntumFullscreenButton';
import BryntumTrialButton from './BryntumTrialButton';

var BryntumDemoHeader = function BryntumDemoHeader(props) {
  var href = props.href,
      title = document.title.split(' - ')[1] || document.title;
  return /*#__PURE__*/React.createElement(Fragment, null, /*#__PURE__*/React.createElement("header", {
    className: "demo-header"
  }, /*#__PURE__*/React.createElement("div", {
    id: "title-container"
  }, /*#__PURE__*/React.createElement("a", {
    id: "title",
    href: href
  }, /*#__PURE__*/React.createElement("h1", null, title))), props.children, /*#__PURE__*/React.createElement(BryntumTrialButton, {
    productId: "gantt",
    cls: "b-green b-raised"
  }), /*#__PURE__*/React.createElement(BryntumFullscreenButton, null)));
};

BryntumDemoHeader.defaultProps = {
  title: 'Bryntum React demo',
  href: 'https://bryntum.com'
};
export default BryntumDemoHeader;