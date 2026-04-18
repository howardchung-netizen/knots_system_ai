import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import language from '../localization/language';
import { UserContext } from '../contexts/UserContext';
import { Chip, Divider, FormControl, Grid, InputLabel, MenuItem, Select, TextField } from '@mui/material';
import PageLoadingProgress from '../components/PageLoadingProgress';
import AccountRoles from '../components/AccountRoles';
import moment from 'moment';
import { InfoCard, InfoRow } from '../components/InfoCard';
import AccountCircle from '@mui/icons-material/AccountCircle';
import ResetPasswordModal from '../components/account/ResetPasswordModal';
import userResetPasswordMutation from '../hooks/userResetPasswordMutation';
import BackdropLoading from '../components/BackdropLoading';
import { useSnackbar } from 'notistack';
import { useMutation, useQuery } from '@apollo/client';
import { CONNECT_GOOGLE, DISCONNECT_GOOGLE, updatePassword } from '../apollo/mutations';
import { gapi } from 'gapi-script';
import { ModalContext } from '../contexts/ModalContextProvider';
import UserFormModal from '../components/user/UserFormModal';
import { GET_ROLES } from '../apollo/queries';
import { userStatus } from '../constants/InputOptions';

const REACT_APP_TODO_HTTP_ENDPOINT = process.env.REACT_APP_TODO_HTTP_ENDPOINT;

export default () => {

  const { enqueueSnackbar } = useSnackbar();
  const [myConfirmModalOpen, handleMyConfirmModalOpen, handleMyConfirmModalClose] = React.useContext(ModalContext);
  const [user, userDispatch] = React.useContext(UserContext);
  const [info, setInfo] = React.useState(null);
  const [connectGoogle, connectGoogleStatus] = useMutation(CONNECT_GOOGLE);
  const [disconnectGoogle, disconnectGoogleStatus] = useMutation(DISCONNECT_GOOGLE);
  const [resetPasswordModalOpen, setResetPasswordModalOpen] = React.useState(false);
  const handleResetPasswordModalOpen = () => setResetPasswordModalOpen(true);
  const handleResetPasswordModalClose = () => setResetPasswordModalOpen(false);

  const [openedModal, setOpenedModal] = React.useState({})

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

  const detail = React.useMemo(() => {
    let detail = info
    return detail
  }, [info])

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

  const connectGoogleAccount = async () => {
    try {
      const auth2 = gapi.auth2.getAuthInstance();
      const googleUser = await auth2.signIn({ prompt: 'select_account' });
      const idToken = googleUser.getAuthResponse().id_token;
      connectGoogle({
        variables: {
          data:
          {
            googleIdToken: idToken
          }
        },
        onCompleted: (res) => {
          if (res.connectGoogle.userErrors.length) {
            res.connectGoogle.userErrors.map(e => {
              enqueueSnackbar(e.message, {
                variant: 'error'
              })
            })
          }
          else if (res.connectGoogle.user) {
            userDispatch({ type: "SET_CURRENT_USER", payload: { info: res.connectGoogle.user } });
            enqueueSnackbar(`連結成功`, {
              variant: 'success'
            })
          }
        },
        onError: (error) => {
          enqueueSnackbar(error.message, {
            variant: 'error'
          })
          return;
        }
      })
    } catch (error) {
      console.error('連結失敗:', error);
    }
  }

  const disconnectGoogleAccount = async () => {
    handleMyConfirmModalOpen("取消連結Google帳號?", "", "warning", async () => {
      try {
        const idToken = user.info.googleID;
        disconnectGoogle({
          variables: {
            data:
            {
              googleIdToken: idToken
            }
          },
          onCompleted: (res) => {
            console.log(res)
            if (res.disconnectGoogle.userErrors.length) {
              res.disconnectGoogle.userErrors.map(e => {
                enqueueSnackbar(e.message, {
                  variant: 'error'
                })
              })
            }
            else if (res.disconnectGoogle.user) {
              userDispatch({ type: "SET_CURRENT_USER", payload: { info: res.disconnectGoogle.user } });
              enqueueSnackbar(`取消成功`, {
                variant: 'success'
              })
            }
          },
          onError: (error) => {
            enqueueSnackbar(error.message, {
              variant: 'error'
            })
            return;
          }
        })
      } catch (error) {
        console.error('連結失敗:', error);
      } finally {
        handleMyConfirmModalClose();
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
      onCompleted: (res) => {
        userDispatch({ type: "SET_CURRENT_USER", payload: { info: res.userUpdate.user } });
      }
    })
  }

  React.useLayoutEffect(() => {
    if (user.info) setInfo(user.info);
  }, [user.info])

  if (!info) return <PageLoadingProgress />

  return (
    <Grid container spacing={2} padding={3} sx={{ overflow: 'auto' }}>
      {
        (
          !info ||
          userResetPasswordStatus.loading ||
          connectGoogleStatus.loading ||
          disconnectGoogleStatus.loading
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
          title={<><AccountCircle />帳號</>}
        >
          <InfoRow
            label="帳號"
            value={info.username}
          />
          <InfoRow
            label="狀態"
            value={userStatus.find(e=> e.value == info.status)?.label}
          />
          <InfoRow
            label="顏色"
            flexDirection={'column'}
            value={<div className='color-shadow' style={{width: '100%', height: 40, backgroundColor: info.color}}></div>}
          />
          <Divider />
          <InfoRow
            label="中文名稱"
            value={info.nameCht}
          />
          <InfoRow
            label="英文名稱"
            value={info.nameEn}
          />
          <InfoRow
            label="Email"
            value={info.email}
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
            value={info.active ? "是" : "否"}
          />
          <InfoRow
            label="系統管理員"
            value={info.isSuperAdmin ? "是" : "否"}
          />

          <InfoRow
            label="允許登入"
            value={info.disableLogin ? "否" : "是"}
          />
          <InfoRow
            label="刪除"
            value={info.deleted ? "是" : "否"}
          />
          <InfoRow
            label="建立"
            value={moment(info.createdAt).format('YYYY-MM-DD')}
          />
          <InfoRow
            label="更新"
            value={moment(info.updatedAt).format('YYYY-MM-DD')}
          />
          {
            user?.info?.googleID ?
              <Button
                variant="contained"
                color="error"
                sx={{ width: '100%', marginTop: '5px' }}
                onClick={disconnectGoogleAccount}
              >
                取消連結Google帳號
              </Button>
              : <Button
                variant="contained"
                color="info"
                sx={{ width: '100%', marginTop: '5px' }}
                onClick={connectGoogleAccount}
              >
                連結Google帳號
              </Button>
          }
          <Button
            variant="outlined"
            color="info"
            sx={{ width: '100%', marginTop: '5px' }}
            onClick={handleResetPasswordModalOpen}
          >
            更改密碼
          </Button>
        </InfoCard>

      </Grid>
      <Grid item xs={12} sm={12} md={8} lg={9}>
        <Card className=''>
          {
            <Typography variant="h6" component="div" sx={{ display: 'flex', alignItems: 'center', backgroundColor: '#e8e8e8', color: '#676767', padding: '3px' }}>
              職位
            </Typography>
          }
          <div className="">
            <div className="css-1fu0ejk">
              <AccountRoles roles={user.info.roles} />
            </div>
          </div>
        </Card>
      </Grid>
    </Grid>
  )

}