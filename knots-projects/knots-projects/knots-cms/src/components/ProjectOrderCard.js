import { Box, Card, CardContent, Typography } from '@mui/material';
import ContentLoader from 'react-content-loader'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import CheckBoxOutlinedIcon from '@mui/icons-material/CheckBoxOutlined';
import CheckBoxOutlineBlankOutlinedIcon from '@mui/icons-material/CheckBoxOutlineBlankOutlined';
import { toMoney } from '../utils';

export const ProjectOrderCardLoading = () => {
	return (
		<Box sx={{ minWidth: 400, margin: '3px 0px'}}>
			<CardContent>
				<ContentLoader
					speed={2}
					primarycolor="#f3f3f3"
					secondarycolor="#ecebeb">
				</ContentLoader>
			</CardContent>
		</Box>
	)
}

export const ProjectOrderCard = (props) => {

  return (
    <Card sx={{ minWidth: 400, margin: '3px 0px', backgroundColor: props.spotlight }}>
      <CardContent>
        <Typography variant="h6" style={{display: 'flex', marginBottom:10}}>
          <strong style={{minWidth: 50}}>工程-</strong><div>{props.project?.code}</div>
        </Typography>
        <div><span className='border-card-subtitle' variant="body1">明細:</span><span>{props.desc}</span></div>
        <div><span className='border-card-subtitle' variant="body1">供應商:</span><span>{props.supplier}</span></div>
        <div><span className='border-card-subtitle' variant="body1">送貸時間:</span><span>{props.deliveryDate}</span></div>
        <div><span className='border-card-subtitle' variant="body1">價錢:</span><span>{toMoney(props.amount)}</span></div>
        {props.cheque && <div><span className='border-card-subtitle' variant="body1">Cheque No:</span><span>{props.cheque}</span></div>}
        <div style={{display: 'flex', alignItems: 'center'}}><span className='border-card-subtitle' variant="body1">已付款:</span> {props.payment ? <CheckCircleOutlineIcon sx={{color: 'green', fontSize: 20, marginRight: 1}}/> : <RadioButtonUncheckedIcon sx={{color: 'grey', fontSize: 20, marginRight: 1}}/> }</div>
        <div><span className='border-card-subtitle' variant="body1">已驗收:</span><span>{props.delivery ? <CheckBoxOutlinedIcon sx={{color: 'green', fontSize: 20, marginRight: 1}}/> : <CheckBoxOutlineBlankOutlinedIcon sx={{color: 'grey', fontSize: 20, marginRight: 1}}/> }</span></div>
        {/* <Typography variant="body1">Status: {props.status ? "True" : "False"}</Typography> */}
        {/* Add more fields as needed */}
      </CardContent>
    </Card>
  );
};
