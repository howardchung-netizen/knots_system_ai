import { Box, Card, CardContent, Chip, Typography, Button } from '@mui/material';
import ContentLoader from 'react-content-loader'

export const ProjectCardLoading = () => {
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

export const ProjectCard = (props) => {

  const onProjectReviewBtnClick = () => {
    let url = `/cms/project/${props.projectId}?tab=0`
    window.open(url, '_blank');
  }
  return (
    <Card sx={{ minWidth: 400, margin: '3px 0px', position: 'relative' }}>
      <CardContent>
        <Typography variant="h6" style={{display: 'flex', marginBottom: 1}}><div className='spotlight-color' style={{ backgroundColor: props.spotlight, marginRight:10 }}></div><strong>{props.projectId}</strong></Typography>
        <Typography variant="h6" style={{display: 'flex', marginBottom: 5}}><strong>專案:{props.code}</strong></Typography>
        <div><span className='border-card-subtitle' variant="body1">施工地點:</span><span>{props.address??"N/A"}</span></div>
        <div><span className='border-card-subtitle' variant="body1">開始:</span><span>{props.start??"N/A"}</span></div>
        <div><span className='border-card-subtitle' variant="body1">結束:</span><span>{props.end??"N/A"}</span></div>
        <div style={{display: 'flex', position: 'absolute', top: 5, right: 5}}>
          <Chip label={props.status?.nameCht}></Chip>
        </div>
        {
          props.status?.id === "UHJvamVjdFN0YXR1czo0" && <Button variant="contained" sx={{width: '100%'}} onClick={onProjectReviewBtnClick}>查看</Button>
        }
      </CardContent>
    </Card>
  );
};
