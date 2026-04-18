import React from 'react';
export const LoadingMask = ({ text }) => {
 return (
   <div className="b-mask b-widget b-mask-dark b-progress b-prevent-transitions b-visible" id="b-mask-1" role="presentation">
     <div id="b-mask-1-maskContent" className="b-mask-content b-drawable" role="presentation">
       <div id="b-mask-1-maskText" className="b-mask-text" role="presentation"><i className="b-mask-icon b-icon b-icon-spinner"></i>{text??''}</div>
     </div>
   </div>)
}