import * as React from 'react';
import { Card, Grid } from '@mui/material';

export default function (props) {
  return (
    <Grid container style={{width:"100%", backgroundColor: 'white'}}>
      <Grid item xs={12}>
        <div style={{padding: 10}}>
            {props.children}
        </div>
      </Grid>
    </Grid>
  );
}