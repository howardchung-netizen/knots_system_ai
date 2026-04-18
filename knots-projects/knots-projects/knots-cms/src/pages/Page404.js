import * as React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';


export default () => {
    return (
    <React.Fragment>
      <CssBaseline />
      <Container maxWidth="sm">
        <Box sx={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }} >
        <img src={require('../assets/images/qIufhof.png')} style={{width: 50}}/>
        <h3>This page could not be found</h3>
        </Box>
      </Container>
    </React.Fragment>
        
    )
}