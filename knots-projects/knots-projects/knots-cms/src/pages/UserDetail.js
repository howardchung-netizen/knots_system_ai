import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Grid, Tab, Tabs, Divider } from '@mui/material';
import { makeStyles } from '@mui/styles';
import PageLoadingProgress from '../components/PageLoadingProgress';
import AccountRoles from '../components/AccountRoles';
import moment from 'moment';
import { InfoCard, InfoRow } from '../components/InfoCard';
import AccountCircle from '@mui/icons-material/AccountCircle';
import ResetPasswordModal from '../components/account/ResetPasswordModal';
import userResetPasswordMutation from '../hooks/userResetPasswordMutation';
import BackdropLoading from '../components/BackdropLoading';
import { useSnackbar } from 'notistack';
import { gql, useMutation, useQuery } from '@apollo/client';
import { updatePassword } from '../apollo/mutations';
import { GET_ROLES, usersQuery } from '../apollo/queries';
import { useNavigate, useParams } from 'react-router-dom';
import { userFragment } from '../apollo/fragments';
import PropTypes from 'prop-types';
import { useTheme } from '@mui/material/styles';
import SwipeableViews from 'react-swipeable-views';
import StaffBookChequeList from './StaffBookChequeList';
import { toMoney } from '../utils';
import UserFormModal from '../components/user/UserFormModal';
import { userStatus } from '../constants/InputOptions';
import ClaimFormList from './ClaimFormList';

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

export default (props) => {

  const theme = useTheme();
  const classes = useStyles();
  const { enqueueSnackbar } = useSnackbar();
  const {staffId} = useParams();
  const queryParam = new URLSearchParams(window.location.search);
  const navigate = useNavigate();
  const [tab, setTab] = React.useState(parseInt(queryParam.get('tab'))??0);
  const handleTabChange = (event, newValue) => {
    let url = `/cms/staff/${staffId}?tab=${newValue}`
    setTab(newValue);
    navigate( url, { replace: true });
  };
  const queryStatus = useQuery(gql`${usersQuery} ${userFragment}`, {
    variables: { 
      id: staffId,
      first: 1
    },
    onCompleted: (res) => {
      if (res.users?.edges.length == 0 ) {
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
  const detail = React.useMemo(() => {
    let detail = null;
    if (queryStatus.data?.users.edges.length)detail = queryStatus?.data?.users.edges[0].node
    return detail
  }, [staffId, queryStatus])

  const { data: rolesData } = useQuery(GET_ROLES, {
    fetchPolicy: 'network-only',
    notifyOnNetworkStatusChange: true,
    variables: {}
  });

  const rolesList = React.useMemo(() => {
    let rolesList = [];
    if (rolesData?.roles?.length) rolesList = rolesData.roles.map(e => e.name)
    return rolesList;
  }, [rolesData])

  const [openedModal, setOpenedModal] = React.useState({})

  const [resetPasswordModalOpen, setResetPasswordModalOpen] = React.useState(false);
  const handleResetPasswordModalOpen = () => setResetPasswordModalOpen(true);
  const handleResetPasswordModalClose = () => setResetPasswordModalOpen(false);

  const [userResetPassword, userResetPasswordStatus] = useMutation(updatePassword);

  const onUserResetPassword = (data) => {
    userResetPassword({
      variables: {
        data: {
          currentPassword: data.currentPassword,
          newPassword: data.newPassword
        }
      },
      onCompleted: (res) => {
        let userErrors = res.updatePassword.userErrors;
        if (userErrors.length) {
          enqueueSnackbar(`${userErrors[0].message}`, {
            autoHideDuration: 3000,
            variant: "error"
          })
        }
        else if (res.updatePassword.result
        ) {
          enqueueSnackbar("更改密碼成功", {
            variant: 'success'
          })
          handleResetPasswordModalClose();
        }
      },
      onError: (error) => {
        enqueueSnackbar(error.message, {
          variant: 'error'
        })
        return;
      }
    })
  }

  const updateUserClick = () => {
    setOpenedModal({
      open: 'updateModal',
      mode: 'update',
      data: {
        ...detail,
        roles: detail.roles.map(e => e.name)
      },
      rolesList: rolesList,
      onCompleted: queryStatus.refetch
    })
  }

  if (!detail) return <PageLoadingProgress />

  return (
    <Grid container spacing={2} padding={3} sx={{ overflow: 'auto' }}>
      {
        (
          !detail ||
          userResetPasswordStatus.loading
        ) && <BackdropLoading />
      }
      {
      openedModal.open == 'updateModal' && <UserFormModal
        open={openedModal.open == 'updateModal'}
        mode={'update'}
        data={openedModal.data}
        rolesList={openedModal.rolesList}
        onCompleted={openedModal.onCompleted}
        onCloseClick={() => setOpenedModal({ open: '' })}
      />
      }
      <ResetPasswordModal
        open={resetPasswordModalOpen}
        onCloseClick={handleResetPasswordModalClose}
        onConfirmClick={onUserResetPassword}
      />
      <Grid item xs={12} sm={12} md={4} lg={3} padding={0} sx={{ position: 'relative' }}>
        <div className="MuiCardActions-root MuiCardActions-spacing css-1617jao" style={{ position: 'absolute', top: '19px', right: '0px', padding: 0 }}>
          <button className="css-1e9th7b" style={{ margin: '0px', padding: 5 }} type="button" onClick={updateUserClick}>編輯<span className="MuiTouchRipple-root css-w0pj6f"></span></button>
        </div>
      <InfoCard
        title={<><AccountCircle />員工</>}
      >
        <InfoRow
          label="帳號"
          value={detail.username}
        />
        <InfoRow
          label="狀態"
          value={userStatus.find(e => e.value == detail.status)?.label}
        />
        <InfoRow
          label="顏色"
          flexDirection={'column'}
          value={<div className='color-shadow' style={{width: '100%', height: 40, backgroundColor: detail.color}}></div>}
        />
        <Divider />
        <InfoRow
            label="中文名稱"
            value={detail.nameCht}
          />
          <InfoRow
            label="英文名稱"
            value={detail.nameEn}
          />
          <InfoRow
            label="Email"
            value={detail.email}
          />
          <InfoRow
            label="電話"
            value={`${detail.tel1??''} ${detail.tel2??''}`}
          />
          <InfoRow
            label="WhatsApp"
            value={`${detail.whatsApp??''} ${detail.whatsapp2??''}`}
          />
        <Divider />
        <InfoRow
          label="開通"
          value={detail.active ? "是" : "否"}
        />
        <InfoRow
          label="系統管理員"
          value={detail.isSuperAdmin ? "是" : "否"}
        />

        <InfoRow
          label="允許登入"
          value={detail.disableLogin ? "否" : "是"}
        />
        <InfoRow
          label="刪除"
          value={detail.deleted ? "是" : "否"}
        />
        <InfoRow
          label="建立"
          value={moment(detail.createdAt).format('YYYY-MM-DD')}
        />
        <InfoRow
          label="更新"
          value={moment(detail.updatedAt).format('YYYY-MM-DD')}
        />
        <InfoRow
          label="備用金額"
          value={toMoney(detail.pettyCash)}
        />
        <Button 
          variant="outlined"
          color="info" 
          sx={{width: '100%', marginTop: '5px'}}
          onClick={handleResetPasswordModalOpen}
          >
          更改密碼
        </Button>
      </InfoCard>
        <Card className='' style={{ marginTop: 15 }}>
          {
            <Typography variant="h6" component="div" sx={{ display: 'flex', alignItems: 'center', backgroundColor: '#e8e8e8', color: '#676767', padding: '3px' }}>
              職位
            </Typography>
          }
          <div className="">
            <div className="">
              <AccountRoles roles={detail.roles} />
            </div>
          </div>
        </Card>
      </Grid>
      <Grid item xs={12} sm={12} md={8} lg={9}>
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
          <Tab label="增值紀錄" {...a11yProps(0)} />
          <Tab label="報銷紀錄" {...a11yProps(1)} />
        </Tabs>
        <SwipeableViews
          axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
          index={tab}
          onChangeIndex={() => { }}
        >
          <div className={classes.tab} role="tabpanel" value={tab} index={0} dir={theme.direction}>
            <StaffBookChequeList staff={detail} reload={queryStatus.refetch}/>
          </div>
          <div className={classes.tab} role="tabpanel" value={tab} index={1} dir={theme.direction}>
            <ClaimFormList />
          </div>
        </SwipeableViews>

      </Grid>
    </Grid>
  )

}