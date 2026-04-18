import * as React from 'react';
import { Box, Tab, Tabs, useTheme, Grid, Divider, Chip, Typography, Stack, Tooltip, Button } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import BackdropLoading from '../components/BackdropLoading';
import { useSnackbar } from 'notistack';
import { UserContext } from '../contexts/UserContext';
import PropTypes from 'prop-types';
import SwipeableViews from 'react-swipeable-views';
import { makeStyles } from '@mui/styles';
import { gql, useLazyQuery, useQuery } from '@apollo/client';
import { projectsQuery } from '../apollo/queries';
import { projectDetailFragment } from '../apollo/fragments';
import { InfoCard, InfoRow } from '../components/InfoCard';
import ProjectQuotationList from './ProjectQuotationList';
import ProjectFormFormModal from '../components/project/ProjectFormModal';
import MemberFormModal from '../components/project/MemberFormModal';
import ClientFormModal from '../components/project/ClientFormModal';
import Input from '../components/Input';
import ProjectDetailInvoiceList from './ProjectDetailInvoiceList';
import ScreenGantt from '../components/ScreenGanttReadMode';
import { ToDoList } from '../components/todolist/ToDoList';
import ProjectOrderList from './ProjectOrderList';

const REACT_APP_TOKEN = process.env.REACT_APP_TOKEN;
const REACT_APP_KQS_HTTPS_ENDPOINT = process.env.REACT_APP_KQS_HTTPS_ENDPOINT;
const REACT_APP_TODO_HTTP_ENDPOINT = process.env.REACT_APP_TODO_HTTP_ENDPOINT;
const REACT_APP_TODO_WEBSOCKET_ENDPOINT = process.env.REACT_APP_TODO_WEBSOCKET_ENDPOINT;
const REACT_APP_KQS_SHARE_LINK = process.env.REACT_APP_KQS_SHARE_LINK;
const REACT_APP_EXPORT_SERVER_HOST = process.env.REACT_APP_EXPORT_SERVER_HOST;

const useStyles = makeStyles(theme => ({
  tab: {
    backgroundColor: 'white',
    '& .MuiBox-root': {
      padding: '0px',
    },
  },
}))

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
}

function a11yProps(index) {
  return {
    id: `full-width-tab-${index}`,
    'aria-controls': `full-width-tabpanel-${index}`,
    padding: 0
  };
}

export default function () {

  const theme = useTheme();
  const classes = useStyles();
  const [user, userDispatch] = React.useContext(UserContext);
  const navigate = useNavigate();
  const { projectId } = useParams();
  const queryParam = new URLSearchParams(window.location.search);
  const [tab, setTab] = React.useState(parseInt(queryParam.get('tab')) ?? 0);
  const componentRef = React.useRef();
  const { enqueueSnackbar } = useSnackbar();
  const [iframeHeight, setIframeHeight] = React.useState(0);

  const handleTabChange = (event, newValue) => {
    let url = `/cms/project/${projectId}?tab=${newValue}`
    setTab(newValue);
    navigate(url, { replace: true });
  };

  const handleTabChangeIndex = (index) => {
    let url = `/cms/project/${projectId}?tab=${index}`
    setTab(index);
    navigate(url, { replace: true });
  };

  const [projectUseQuery, projectQueryStatus] = useLazyQuery(gql`${projectsQuery} ${projectDetailFragment}`, {
    fetchPolicy: 'cache-and-network',
    variables: {
      projectId: parseInt(projectId),
      first: 1,
    },
    onCompleted: (res) => {
      if (res.projects?.edges.length == 0) {
        enqueueSnackbar("讀取失敗...", {
          variant: 'error'
        })
      }
      else if (res.error) {
        enqueueSnackbar(res.error, {
          variant: 'error'
        })
      }
    },
    onError: (error) => {
      enqueueSnackbar(error.message, {
        variant: 'error'
      })
    }
  });

  const project = React.useMemo(() => {
    let project = null;
    if (projectQueryStatus.data?.projects.edges.length) project = projectQueryStatus?.data?.projects.edges[0].node
    return project
  }, [projectId, projectQueryStatus])

  const [openedModal, setOpenedModal] = React.useState({})

  const updateProjectClick = () => {
    setOpenedModal({
      open: 'updateProject',
      mode: 'update',
      data: {
        ...project,
        statusId: project.status?.id,
        typeId: project.projectType?.id,
        hashtags: project.hashtags?.map((hashtag) => hashtag.id),
      },
      onCompleted: projectQueryStatus.refetch
    })
  }

  const updatePicClick = () => {
    setOpenedModal({
      open: 'updatePic',
      mode: 'update',
      data: {
        id: project.id,
        managerId: project.manager?.id,
        assginess: project.assignee.map((user) => user.id)
      },
      // onCompleted: projectQueryStatus.refetch
    })
  }

  const updateClientClick = () => {
    setOpenedModal({
      open: 'updateClient',
      mode: 'update',
      data: {
        id: project.id,
        clientId: project.client?.id,
        contactId: project.contact?.id
      },
      // onCompleted: projectQueryStatus.refetch
    })
  }

  const onGanttChartBtnClick = () => {
    let url = `/cms/gantt_chart/project/${project.realId}?projectName=${project.code}&language=chi`
    // window.open(url, '_blank');
    navigate(url);
  }

  const onUpdloadPdfBtnClick = () => {
    let url = `/cms/pdf_compare/${project.realId}`
    const height = 750;
    const width = 1500;
    const screenWidth = window.screen.width;
    const screenHeight = window.screen.height;
    const left = (screenWidth - width) / 2;
    const top = (screenHeight - height) / 2;
    const features = `width=${width},height=${height},left=${left},top=${top}`;
    navigate(url);
    // window.open(url, '_blank', features);
  }
  const openProfitSheet = () => {
    let url = `/cms/profit_sheet/${project.projectId}`
    window.open(url, "_blank");
  }

  // React.useEffect(() => {
  //   const handleHeightMessage = (event) => {
  //     if (event.data && event.data.height) {
  //       setIframeHeight(event.data.height);
  //     }
  //   };

  //   window.addEventListener('message', handleHeightMessage);

  //   return () => {
  //     window.removeEventListener('message', handleHeightMessage);
  //   };
  // }, []);

  React.useLayoutEffect(() => {
    projectUseQuery();
  }, [projectId])

  return (
    <div>
      <ProjectFormFormModal
        open={openedModal.open == 'updateProject'}
        mode={'update'}
        data={openedModal.data}
        onCompleted={openedModal.onCompleted}
        onCloseClick={() => setOpenedModal({ open: '' })}
      />
      <MemberFormModal
        open={openedModal.open == 'updatePic'}
        mode={'update'}
        data={openedModal.data}
        onCompleted={openedModal.onCompleted}
        onCloseClick={() => setOpenedModal({ open: '' })}
      />
      <ClientFormModal
        open={openedModal.open == 'updateClient'}
        mode={'update'}
        data={openedModal.data}
        onCompleted={openedModal.onCompleted}
        onCloseClick={() => setOpenedModal({ open: '' })}
      />
      <Grid container spacing={2} padding={3}>
        {
          (projectQueryStatus.loading) && <BackdropLoading />
        }
        {
          project?.id && (
            <>
              <Grid item xs={12} sm={12} md={3} lg={2} padding={0}>
                <Grid container spacing={2} padding={0}>
                  <Grid item xs={12} sx={{ position: 'relative' }}>
                    <div className="MuiCardActions-root MuiCardActions-spacing css-1617jao" style={{ position: 'absolute', top: '19px', right: '0px', padding: 0 }}>
                      <button className="css-1e9th7b" style={{ margin: '0px', padding: 5 }} type="button" onClick={updateProjectClick}>編輯<span className="MuiTouchRipple-root css-w0pj6f"></span></button>
                    </div>
                    <InfoCard title={"專案-" + project.projectId}>
                      <Typography variant="body2" sx={{ marginBottom: 1, fontWeight: 'bold', fontSize: 18 }}>
                        專案
                      </Typography>
                      <InfoRow flexDirection='column' label={"名稱"} value={project.code} />
                      <InfoRow label={"狀態"} value={project.status.code + " - " + project.status.nameCht} />
                      <InfoRow label={"顏色"} value={<div className='spotlight-color' style={{ backgroundColor: project.spotlight }}></div>} />
                      <InfoRow flexDirection={'column'} label={"備註:"} />
                      <Input
                        readOnly={true}
                        minRows={4}
                        variant="outlined"
                        value={project.remark}
                        multiline
                      />
                      <Divider sx={{ marginBottom: 1, marginTop: 1 }} />
                      <Typography variant="body2" sx={{ marginBottom: 1, fontWeight: 'bold', fontSize: 18 }}>
                        工程
                      </Typography>
                      <InfoRow flexDirection='column' label={"施工地點"} value={project.address} />
                      <InfoRow label={"類型"} value={project.projectType?.nameCht ?? 'N/A'} />
                      <InfoRow label={"開始日期"} value={project.start} />
                      <InfoRow label={"結束日期"} value={project.end} />
                      <Divider sx={{ marginBottom: 1 }} />
                      <Typography variant="body2" sx={{ marginBottom: 1, fontWeight: 'bold', fontSize: 18 }}>
                        #標籤
                      </Typography>
                      {
                        project.hashtags.map(e => <Chip key={e.id} label={e.nameCht} style={{ margin: 1 }} />)
                      }
                    </InfoCard>
                  </Grid>
                  <Grid item xs={12} sx={{ position: 'relative' }}>
                    <div className="MuiCardActions-root MuiCardActions-spacing css-1617jao" style={{ position: 'absolute', top: '19px', right: '0px', padding: 0 }}>
                      <button className="css-1e9th7b" style={{ margin: '0px', padding: 5 }} type="button" onClick={updatePicClick}>編輯<span className="MuiTouchRipple-root css-w0pj6f"></span></button>
                    </div>
                    <InfoCard title={"成員"}>
                      <Typography variant="body2" sx={{ marginBottom: 1, fontWeight: 'bold', fontSize: 18 }}>
                        P.I.C.
                      </Typography>
                      <InfoRow label={"名稱"} value={project.manager?.nameEn} />
                      <InfoRow label={"電話"} value={project.manager?.tel2 ? project.manager?.tel1 + ' ' + project.manager?.tel2 : ''} />
                      <InfoRow label={"Whatsapp"} value={project.manager?.whatsapp2 ? project.manager?.whatsApp + ' ' + project.manager?.whatsapp2 : ''} />
                      <InfoRow label={"Wechat"} value={project.manager?.wechat2 ? project.manager?.wechat + ' ' + project.manager?.wechat2 : ''} />
                      <InfoRow flexDirection='column' label={"電郵"} value={project.manager?.email} />
                      <Divider sx={{ marginBottom: 1 }} />
                      <Typography variant="body2" sx={{ marginBottom: 1, fontWeight: 'bold', fontSize: 18 }}>
                        員工
                      </Typography>
                      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                        {
                          project.assignee.map((user) => (
                            <Tooltip
                              key={user.id}
                              componentsProps={{ tooltip: { style: { backgroundColor: 'none', padding: 0, border: 'none', minWidth: 300 } } }}
                              title={(
                                <React.Fragment>
                                  <InfoCard title={"員工"}>
                                    {(user.username) && <InfoRow label={"名稱"} value={user.username} />}
                                    {user.tel2 && <InfoRow label={"電話"} value={user.tel1 + ' ' + user.tel2} />}
                                    {user.whatsapp2 && <InfoRow label={"Whatsapp"} value={user.whatsApp + ' ' + user.whatsapp2} />}
                                    {user.wechat2 && <InfoRow label={"Wechat"} value={user.wechat + ' ' + user.wechat2} />}
                                    {user.email && <InfoRow label={"電郵"} value={user.email} />}
                                  </InfoCard>
                                </React.Fragment>
                              )}
                            >
                              <Chip label={user.username} />
                            </Tooltip>
                          ))
                        }
                      </Stack>
                    </InfoCard>
                  </Grid>
                  <Grid item xs={12} sx={{ position: 'relative' }}>
                    <div className="MuiCardActions-root MuiCardActions-spacing css-1617jao" style={{ position: 'absolute', top: '18px', right: '0px', padding: 0 }}>
                      <button className="css-1e9th7b" style={{ margin: '0px', padding: 5 }} type="button" onClick={updateClientClick}>編輯<span className="MuiTouchRipple-root css-w0pj6f"></span></button>
                    </div>
                    <InfoCard title={"客戶資料"}>
                      <Typography variant="body2" sx={{ marginBottom: 1, fontWeight: 'bold', fontSize: 18 }}>
                        客戶
                      </Typography>
                      {project.client?.companyCht && <InfoRow flexDirection='column' label={"公司名稱(中文)"} value={project.client.companyCht} />}
                      {project.client?.companyEn && <InfoRow flexDirection='column' label={"公司名稱(英文)"} value={project.client.companyEn} />}
                      {project.client?.nameCht && <InfoRow label={"名稱(中文)"} value={project.client?.nameCht} />}
                      {project.client?.nameEn && <InfoRow label={"名稱(英文)"} value={project.client?.nameEn} />}
                      {project.client?.tel && <InfoRow label={"電話"} value={project.client.telCode + " " + project.client.tel} />}
                      {project.client?.fax && <InfoRow label={"傳真"} value={project.client.faxCode + " " + project.client.fax} />}
                      {project.client?.whatsapp && <InfoRow label={"Whatsapp"} value={project.client.whatsappCode + " " + project.client.whatsapp} />}
                      {project.client?.wechat && <InfoRow label={"Wechat"} value={project.client.wechatCode + " " + project.client.wechat} />}
                      {project.client?.email && <InfoRow flexDirection='column' label={"電郵"} value={project.client.email} />}
                      {project.client?.address && <InfoRow flexDirection='column' label={"地址"} value={project.client.address} />}
                      <Divider sx={{ marginBottom: 1 }} />
                      <Typography variant="body2" sx={{ marginBottom: 1, fontWeight: 'bold', fontSize: 18 }}>
                        聯絡人
                      </Typography>
                      {project.contact?.nameCht && <InfoRow label={"名稱(中文)"} value={project.contact.nameCht} />}
                      {project.contact?.nameEn && <InfoRow label={"名稱(英文)"} value={project.contact.nameEn} />}
                      {project.contact?.tel && <InfoRow label={"電話"} value={project.contact.telCode + ' ' + project.contact.tel} />}
                      {project.contact?.whatsapp && <InfoRow label={"Whatsapp"} value={project.contact.whatsappCode + ' ' + project.contact.whatsapp} />}
                      {project.contact?.wechat && <InfoRow label={"Wechat"} value={project.contact.wechatCode + ' ' + project.contact.wechat} />}
                      {project.contact?.email && <InfoRow flexDirection='column' label={"電郵"} value={project.contact.email} />}
                    </InfoCard>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} sm={12} md={9} lg={10}>
                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ marginBottom: 1 }}>
                  <Button variant="contained" onClick={onGanttChartBtnClick}>工程進度表</Button>
                  <Button variant="contained" onClick={onUpdloadPdfBtnClick}>上傳PDF</Button>
                  <Button variant="contained" onClick={openProfitSheet}>Profit Sheet</Button>
                </Stack>
                <Tabs
                  value={tab}
                  onChange={handleTabChange}
                  indicatorColor="primary"
                  sx={{
                    // color: 'rgba(58, 53, 65, 0.6)',
                    "& .MuiTab-root.Mui-selected": {
                      backgroundColor: 'white',
                      // color: 'white'
                    },
                    marginBottom: "2px"
                  }}
                >
                  <Tab label="報價單" {...a11yProps(0)} />
                  <Tab label="訂單" {...a11yProps(1)} />
                  <Tab label="發票單" {...a11yProps(2)} />
                  <Tab label="待辦事項" {...a11yProps(3)} />
                  {/* <Tab label="工程進度表" {...a11yProps(4)} /> */}
                </Tabs>
                <SwipeableViews
                  axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
                  index={tab}
                  onChangeIndex={() => { }}
                >
                  <div className={classes.tab} role="tabpanel" value={tab} index={0} dir={theme.direction}>
                    <ProjectQuotationList />
                  </div>
                  <div className={classes.tab} role="tabpanel" value={tab} index={1} dir={theme.direction}>
                    <ProjectOrderList projectId={project.id}/>
                  </div>
                  <div className={classes.tab} role="tabpanel" value={tab} index={2} dir={theme.direction}>
                    <ProjectDetailInvoiceList
                      projectCode={project.code}
                      clientId={project.client?.id}
                      contactId={project.contact?.id}
                    />
                  </div>
                  <div className={classes.tab} role="tabpanel" value={tab} index={2} dir={theme.direction}>
                    <div style={{height: '100vh'}}>
                    <ToDoList appToken={user.token} projectId={project.id}/>
                    </div>
                  </div>
                  {/* <div className={classes.tab} role="tabpanel" value={tab} index={3} dir={theme.direction}>
                    <iframe
                      style={{ height: iframeHeight, width: '100%' }}
                      src={`/cms/gantt_chart/project/${project.realId}?projectName=${project.code}&language=chi`}
                      onLoad={(e) => setIframeHeight(e.target.contentWindow.document.body.scrollHeight)}
                    />
                  </div> */}
                </SwipeableViews>
              </Grid>
            </>
          )
        }
      </Grid>
    </div>
  );

}
