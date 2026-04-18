import * as React from 'react';
import { keyframes } from '@mui/system';
import { styled } from '@mui/material/styles';
import CircleIcon from '@mui/icons-material/Circle';

const spin = keyframes`
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(255, 82, 82, 0.7);
  }

  70% {
      transform: scale(1);
      box-shadow: 0 0 0 10px rgba(255, 82, 82, 0);
  }

  100% {
      transform: scale(0.95);
      box-shadow: 0 0 0 0 rgba(255, 82, 82, 0);
  }
`;

const RotatedBox = styled(CircleIcon)((color) => {
    return {
        borderRadius: '50%',
        boxShadow: '0 0 0 0 rgba(255, 82, 82, 1)',
        transform: 'scale(1)',
        animation: `${spin} 2s infinite`,
        color: 'red',
        fontSize: '13px'
    }
});

export default ()=> {
  return (<><RotatedBox /></>)
}