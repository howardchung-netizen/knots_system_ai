import { Box, Card, CardContent, Chip, Typography } from '@mui/material';
import ContentLoader from 'react-content-loader'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';

export const QuotationCardLoading = () => {
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

export const QuotationCard = (props) => {
  return (
    <Card sx={{ minWidth: 400, margin: '3px 0px' }}>
      <CardContent>
        <Typography variant="h6" style={{display: 'flex', justifyContent: 'start', alignItems: 'center', marginBottom: 15}}> 
       {props.status ? <CheckCircleOutlineIcon sx={{color: 'green', fontSize: 30, marginRight: 1}}/> : <RadioButtonUncheckedIcon sx={{color: 'grey', fontSize: 30, marginRight: 1}}/> }
        <strong>{props.code}</strong>
        </Typography>
        <div><span className='border-card-subtitle' variant="body1">標題:</span><span>{props.title}</span></div>
        <div>
          <Chip label={props.progress?.nameCht}></Chip>
        </div>
        {/* Add more fields as needed */}
      </CardContent>
    </Card>
  );
};
