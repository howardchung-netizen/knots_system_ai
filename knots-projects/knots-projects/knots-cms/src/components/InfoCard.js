import * as React from 'react';
import { Card, Divider, Typography } from '@mui/material';
import ArrowRightIcon from '@mui/icons-material/ArrowRight';

export const InfoRow = ({label, value, flexDirection, lableStyle, valueStyle}) =>{
  return (
    <div className="css-1ycuyi6" style={{flexDirection: flexDirection??'row'}}>
      <div className="css-1rwd76u" style={lableStyle}>{label}</div>
      <div className="css-dvql1p" style={valueStyle}>{value}</div>
    </div>
  )
}

export const InfoCard = ({ title, ...props }) => {
  return (
    <>
      <Card className='css-sqt54j' sx={{ borderRadius: 0 }}>
        {
          title && <Typography variant="h6" component="div" sx={{ display: 'flex', alignItems: 'center', backgroundColor: '#e8e8e8', color: '#676767', padding: '3px' }}>
            {title}
          </Typography>
        }
        <Divider />
        <React.Fragment>
          <div className="MuiCardContent-root css-1hta359">
            <div className="css-1fu0ejk">
              {props.children}
            </div>
          </div>
        </React.Fragment>
      </Card>
    </>
  );
}

export const CardTitle = ({title}) => {
    return (
        <Typography variant="h6" component="h2" sx={{display: 'flex', alignItems: 'center'}}>
            <ArrowRightIcon /> {title}
        </Typography>
    )
}
