import * as React from 'react';
import { Box, Tab, Tabs, useTheme, Grid, Divider, Chip, Typography, Stack } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import BackdropLoading from '../components/BackdropLoading';
import { useSnackbar } from 'notistack';
import { UserContext } from '../contexts/UserContext';
import PropTypes from 'prop-types';
import SwipeableViews from 'react-swipeable-views';
import { makeStyles } from '@mui/styles';
import { gql, useLazyQuery, useQuery } from '@apollo/client';
import { CLIENTS_QUERY, clientsQuery } from '../apollo/queries';
import { clientFragment, clientDetailFragment } from '../apollo/fragments';
import { InfoCard, InfoRow } from '../components/InfoCard';
import ProjectQuotationList from './ProjectQuotationList';
import ContactChip from '../components/ContactChip';
import ClientFormModal from '../components/client/ClientFormModal';
import ClientQuotaionList from '../components/client/ClientQuotaionList';
import ClientProjectList from '../components/client/ClientProjectList';

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
  const {clientId} = useParams();
  const queryParam = new URLSearchParams(window.location.search);
  const [tab, setTab] = React.useState(parseInt(queryParam.get('tab'))??0);
  const componentRef = React.useRef();
  const { enqueueSnackbar } = useSnackbar();

  const handleTabChange = (event, newValue) => {
    let url = `/cms/client/${clientId}?tab=${newValue}`
    setTab(newValue);
    navigate( url, { replace: true });
  };

  const handleTabChangeIndex = (index) => {
    let url = `/cms/client/${clientId}?tab=${index}`
    setTab(index);
    navigate( url, { replace: true });
  };

	const [clientUseQuery, clientQueryStatus] = useLazyQuery(gql`${CLIENTS_QUERY} ${clientFragment}`, {
		fetchPolicy: 'cache-and-network',
		variables: { 
			id: clientId ,
			first: 1,
		},
    onCompleted: (res) => {
      if (res.clients?.edges.length == 0 ) {
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

  const client = React.useMemo(() => {
    let client = null;
    if (clientQueryStatus.data?.clients.edges.length)client = clientQueryStatus?.data?.clients.edges[0].node
    return client
  }, [clientId, clientQueryStatus])

  const [openedModal, setOpenedModal] = React.useState({})

  React.useLayoutEffect(() => {
		clientUseQuery();
  }, [clientId])

  return (
    <div>
    <ClientFormModal 
      open={openedModal.open == 'client'}
      onCloseClick={() => setOpenedModal({})}
      mode={"edit"}
      data={client}
    />
    <Grid container spacing={2} padding={3}>
      {
        (clientQueryStatus.loading) && <BackdropLoading />
      }
      {
        client?.id && (
          <>
              <Grid item xs={12} sm={12} md={3} lg={2} padding={0}>
                <Grid container spacing={2} padding={0}>
                  <Grid item xs={12} sx={{ position: 'relative' }}>
                    <div className="MuiCardActions-root MuiCardActions-spacing css-1617jao" style={{ position: 'absolute', top: '18px', right: '0px', padding: 0 }}>
                      <button className="css-1e9th7b" style={{ margin: '0px', padding: 5 }} type="button" onClick={() => setOpenedModal({ open: 'client' })}>編輯<span className="MuiTouchRipple-root css-w0pj6f"></span></button>
                    </div>
                    <InfoCard title={"客戶資料"}>
                      {client?.prefix && <InfoRow flexDirection='column' label={"代號"} value={client.prefix} />}
                      {client?.companyCht && <InfoRow flexDirection='column' label={"名稱(中文)"} value={client.companyCht} />}
                      {client?.companyEn && <InfoRow flexDirection='column' label={"名稱(英文)"} value={client.companyEn} />}
                      {client?.nameCht && <InfoRow label={"名稱(中文)"} value={client?.nameCht} />}
                      {client?.nameEn && <InfoRow label={"名稱(英文)"} value={client?.nameEn} />}
                      {client?.tel && <InfoRow label={"電話"} value={client.telCode + " " + client.tel} />}
                      {client?.fax && <InfoRow label={"傳真"} value={client.faxCode + " " + client.fax} />}
                      {client?.whatsapp && <InfoRow label={"Whatsapp"} value={client.whatsappCode + " " + client.whatsapp} />}
                      {client?.wechat && <InfoRow label={"Wechat"} value={client.wechatCode + " " + client.wechat} />}
                      {client?.email && <InfoRow flexDirection='column' label={"電郵"} value={client.email} />}
                      {client?.address && <InfoRow flexDirection='column' label={"地址"} value={client.address} />}
                      <Divider sx={{ marginBottom: 1 }} />
                      <Typography variant="body2" sx={{ marginBottom: 1, fontWeight: 'bold', fontSize: 18 }}>
                        主要聯絡人
                      </Typography>
                      {client.mainContact?.nameCht && <InfoRow label={"名稱(中文)"} value={client.mainContact.nameCht} />}
                      {client.mainContact?.nameEn && <InfoRow label={"名稱(英文)"} value={client.mainContact.nameEn} />}
                      {client.mainContact?.tel && <InfoRow label={"電話"} value={client.mainContact.telCode + ' ' + client.mainContact.tel} />}
                      {client.mainContact?.whatsapp && <InfoRow label={"Whatsapp"} value={client.mainContact.whatsappCode + ' ' + client.mainContact.whatsapp} />}
                      {client.mainContact?.wechat && <InfoRow label={"Wechat"} value={client.mainContact.wechatCode + ' ' + client.mainContact.wechat} />}
                      {client.mainContact?.email && <InfoRow flexDirection='column' label={"電郵"} value={client.mainContact.email} />}
                      <Divider sx={{ marginBottom: 1 }} />
                      <Typography variant="body2" sx={{ marginBottom: 1, fontWeight: 'bold', fontSize: 18 }}>
                        其他聯絡人
                      </Typography>
                      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" title={"客戶資料"}>
                        {
                          client.contacts.map(e => <ContactChip key={e.id} {...e} />)
                        }
                      </Stack>
                    </InfoCard>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} sm={12} md={9} lg={10}>
                <Tabs
                  value={tab}
                  onChange={handleTabChange}
                  indicatorColor="primary"
                  sx={{
                    "& .MuiTab-root.Mui-selected": {
                      backgroundColor: 'white',
                    },
                    marginBottom: "2px"
                  }}
                >
                  <Tab label="報價單" {...a11yProps(0)} />
                  <Tab label="工程" {...a11yProps(1)} />
                </Tabs>
                <SwipeableViews
                  axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
                  index={tab}
                  onChangeIndex={()=>{}}
                >
                  <div className={classes.tab} role="tabpanel" value={tab} index={0} dir={theme.direction}>
                     <ClientQuotaionList />
                  </div>
                  <div className={classes.tab} role="tabpanel" value={tab} index={1} dir={theme.direction}>
                     <ClientProjectList />
                  </div>
                </SwipeableViews>
              </Grid>
          </>
        )
      }
    </Grid>
    </div>
  );

}
