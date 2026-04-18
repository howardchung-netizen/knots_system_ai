import React, { useEffect, useRef, useState} from 'react';
import H1 from '../components/H1';
import FadeIn from '../components/FadeIn';
import CenterView from '../components/CenterView';
export default function (props) {
  // console.log('AppStart');
  const duration = 1500;
  const start = useRef(Date.now());
  const [end, setEnd] = useState(false)
  useEffect(() => {
    const delayMS = duration - (Date.now() - start.current);
    const timeout = setTimeout(function () {
      if (props.onEnd) onEnd();
      setEnd(true);
    }, delayMS)
    return () => clearTimeout(timeout);
  }, [])
  if (end) return props.children
  return (
      <CenterView>
        <FadeIn duration={duration}>
          <H1>KNOTS To Do List</H1>
        </FadeIn>
      </CenterView>
  )
}