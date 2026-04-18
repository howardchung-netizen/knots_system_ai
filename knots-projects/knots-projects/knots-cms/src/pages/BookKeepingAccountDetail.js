import * as React from 'react';
import { Box, Tab, Tabs, useTheme, Grid, Stack } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import BackdropLoading from '../components/BackdropLoading';
import { useSnackbar } from 'notistack';
import { UserContext } from '../contexts/UserContext';
import PropTypes from 'prop-types';
import SwipeableViews from 'react-swipeable-views';
import { makeStyles } from '@mui/styles';
import { gql, useLazyQuery } from '@apollo/client';
import { BOOK_KEEPING_ACCOUNTS_QUERY } from '../apollo/queries';
import { bookKeepingAccountFragment } from '../apollo/fragments';
import { InfoCard, InfoRow } from '../components/InfoCard';
import { toMoney } from '../utils';
import BookKeepingTransactionList from './BookKeepingTransactionList';

const REACT_APP_TOKEN = process.env.REACT_APP_TOKEN;
const REACT_APP_KQS_HTTPS_ENDPOINT = process.env.REACT_APP_KQS_HTTPS_ENDPOINT;
const REACT_APP_TODO_HTTP_ENDPOINT = process.env.REACT_APP_TODO_HTTP_ENDPOINT;
const REACT_APP_TODO_WEBSOCKET_ENDPOINT= process.env.REACT_APP_TODO_WEBSOCKET_ENDPOINT;
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
  const {accountId} = useParams();
  const queryParam = new URLSearchParams(window.location.search);
  const [tab, setTab] = React.useState(parseInt(queryParam.get('tab'))??0);
  const componentRef = React.useRef();
  const { enqueueSnackbar } = useSnackbar();
  const [iframeHeight, setIframeHeight] = React.useState(0);

  const handleTabChange = (event, newValue) => {
    let url = `/cms/book_keeping_account_detail/${accountId}?tab=${newValue}`
    setTab(newValue);
    navigate( url, { replace: true });
  };

  const handleTabChangeIndex = (index) => {
    let url = `/cms/book_keeping_account_detail/${accountId}?tab=${index}`
    setTab(index);
    navigate( url, { replace: true });
  };

	const [dataUseQuery, dataQueryStatus] = useLazyQuery(gql`${BOOK_KEEPING_ACCOUNTS_QUERY} ${bookKeepingAccountFragment}`, {
		fetchPolicy: 'cache-and-network',
		variables: { 
			id: accountId ,
			first: 1,
		},
    onCompleted: (res) => {
      if (res.bookKeepingAccounts?.edges.length == 0 ) {
        enqueueSnackbar("讀取失敗...", {
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

  const detail = React.useMemo(() => {
    let detail = null;
    if (dataQueryStatus.data?.bookKeepingAccounts.edges.length) detail = dataQueryStatus?.data?.bookKeepingAccounts.edges[0].node
    return detail
  }, [accountId, dataQueryStatus])

  const [openedModal, setOpenedModal] = React.useState({})

  React.useLayoutEffect(() => {
		dataUseQuery();
  }, [accountId])

  return (
    <div>
      <Grid container spacing={2} padding={3}>
        {
          // (dataQueryStatus.loading) && <BackdropLoading />
        }
        {
          detail?.id && (
            <>
              <Grid item xs={12} sm={12} md={3} lg={2} padding={0}>
                <Grid container spacing={2} padding={0}>
                  <Grid item xs={12} sx={{ position: 'relative' }}>
                    {/* <div className="MuiCardActions-root MuiCardActions-spacing css-1617jao" style={{ position: 'absolute', top: '19px', right: '0px', padding: 0 }}>
                      <button className="css-1e9th7b" style={{ margin: '0px', padding: 5 }} type="button" onClick={updateProjectClick}>編輯<span className="MuiTouchRipple-root css-w0pj6f"></span></button>
                    </div> */}
                    <InfoCard title={`${detail.accountType?.name}:${detail.name}`}>
                      <InfoRow flexDirection='column' label={"公司"} value={detail.company?.companyName} />
                      <InfoRow flexDirection='column' label={"名稱"} value={detail.name} />
                      <InfoRow flexDirection='column' label={"類別"} value={detail.accountType?.name} />
                      <InfoRow flexDirection='column' label={"項目標題?"} value={detail.isPlaceholder ? "是" : "否"} />
                      <InfoRow flexDirection='column' label={"員工報銷專用?"} value={detail.isClaim ? "是" : "否"} />
                      <InfoRow flexDirection='column' label={"金額"} value={toMoney(detail.balance)} />
                    </InfoCard>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12} sm={12} md={9} lg={10}>
                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ marginBottom: 1 }}>
                  {/* <Button variant="contained" onClick={onGanttChartBtnClick}>工程進度表</Button> */}
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
                  <Tab label="入帳紀錄" {...a11yProps(0)} />
                </Tabs>
                <SwipeableViews
                  axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
                  index={tab}
                  onChangeIndex={() => { }}
                >
                  <div className={classes.tab} role="tabpanel" value={tab} index={0} dir={theme.direction}>
                    <BookKeepingTransactionList accountTypeId={detail.accountType.id} refetchAccount={dataQueryStatus.refetch}/>
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
