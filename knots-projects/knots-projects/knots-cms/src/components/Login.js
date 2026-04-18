import React, { useContext, useLayoutEffect, useRef, useState } from 'react';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { makeStyles } from '@mui/styles';
import Container from '@mui/material/Container';
import language from '../localization/language';
import { useMutation } from '@apollo/client';
import { internalLogin, login } from '../apollo/mutations';
import { Card } from '@mui/material';
import { Cookies } from 'react-cookie';
import PageLoadingProgress from './PageLoadingProgress';
import { UserContext } from '../contexts/UserContext';
import { useLocation, useNavigate } from 'react-router-dom';
import ReCAPTCHA from "react-google-recaptcha";
import { useGoogleLogin } from '@react-oauth/google';
import GoogleIconSvg from '../assets/GoogleIconSvg';
import { gapi } from 'gapi-script';

const REACT_APP_RECAPTCHA_KEY = process.env.REACT_APP_RECAPTCHA_KEY;
const REACT_APP_HOST_TYPE = process.env.REACT_APP_HOST_TYPE;
const REACT_APP_RECAPTCHA_DISABLE = process.env.REACT_APP_RECAPTCHA_DISABLE; 
const REACT_APP_WEBSITE_TITLE = process.env.REACT_APP_WEBSITE_TITLE;
const REACT_APP_GOOLE_CLINET_ID = process.env.REACT_APP_GOOLE_CLINET_ID;
const REACT_APP_KQS_HTTPS_ENDPOINT = process.env.REACT_APP_KQS_HTTPS_ENDPOINT;

gapi.load('auth2', () => {
  gapi.auth2.init({
    client_id: REACT_APP_GOOLE_CLINET_ID,
    // ux_mode: 'redirect',
    // redirect_uri: REACT_APP_KQS_HTTPS_ENDPOINT+'/login',
  });
});

const cookies = new Cookies();

const useStyles = makeStyles({
  paper: {
    marginTop: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  card: {
    marginTop: 150,
    padding: 20,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: 1,
  },
  submit: {
    marginTop: 150 ,
  },
  forGotPass: {
    textDecoration: 'none'
  }
});

export default function SignIn() {

  const classes = useStyles();
  const location = useLocation();
  const navigate = useNavigate();

  const googleLogin = async () => {
    try {
      const auth2 = gapi.auth2.getAuthInstance();
      const googleUser = await auth2.signIn({prompt: 'select_account'});
      const idToken = googleUser.getAuthResponse().id_token;
      loignMutate({
        variables: {
          data:
          {
            googleIdToken: idToken
          }
        },
        onCompleted: (res) => {
          if (res.login) {
            userDispactch({ type: "LOGIN", payload: { token: res.login.token, id: res.login.user.id } })
          }
        },
        onError: (error) => {
          userDispactch({ type: "LOGOUT" })
          alert(error.message)
        }
      })
    } catch (error) {
      console.error('Google登录失败:', error);
    }
  };
  const [user, userDispactch] = useContext(UserContext);

  const { errorMessage } = location.state || { errorMessage: undefined };
  
  const authToken = cookies.get('authToken');
  const reCaptchaRef = useRef();
  const [auth, setAuth] = useState({
    username: undefined,
    password: undefined,
    token: undefined
  });

  const [loignMutate, {loading}] = useMutation(login)

  
  const _login = (auth, token)=>{
    loignMutate({
      variables: {
        data: 
        {  ...auth,
           token: token
        }
      },
      onCompleted: (res)=>{
        if(res.login) {
         userDispactch({type: "LOGIN", payload: { token: res.login.token, id: res.login.user.id }})
        }
      },
      onError: (error)=>{
        userDispactch({type: "LOGOUT"})
        alert(error.message)
      }
    })
  }

  const onChange = (key, value)=>{
    let v = {};
    v[key] = value;
    setAuth({...auth, ...v})
  }

  const onLoginPress = async () => {
    try {
      if (REACT_APP_RECAPTCHA_DISABLE === 'true') _login(auth, authToken);
      else {
        const token = await reCaptchaRef.current.executeAsync();
        _login(auth, token);
      }
    }
    catch (error) {
      console.log(error.message)
    }
  }

  useLayoutEffect(() => {
    if (authToken) {
      userDispactch({ type: "LOGIN", payload: { token: authToken, id: cookies.get('userId') } });
      navigate("/cms/dashboard", { replace: true, state: {} })
    }
  })

  return (
    <div style={{ width: "100%", height: "100%" }}>
      {
        loading ? <PageLoadingProgress /> : null
      }
      <Container maxWidth="sm">
        <Card className={classes.card}>
          <Container component="main" maxWidth="xs">
          <ReCAPTCHA
              ref={(r) => reCaptchaRef.current = r}
              sitekey={REACT_APP_RECAPTCHA_KEY}
              size="invisible"
              badge="bottomright"
            />
            <CssBaseline />
            <div className={classes.paper}>
              <Typography component="h1" variant="h4">
                {REACT_APP_WEBSITE_TITLE}
              </Typography>
              {errorMessage && <div className={classes.error}>error</div>}
              <form className={classes.form} noValidate>
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label={language.username}
                  name="usename"
                  autoFocus
                  value={auth?.username}
                  onChange={(e) => onChange("username", e.target.value)}
                />
                <TextField
                  variant="outlined"
                  margin="normal"
                  required
                  fullWidth
                  label={language.password}
                  name="password"
                  type="password"
                  id="password"
                  autoComplete="current-password"
                  value={auth?.password}
                  onChange={(e) => onChange("password", e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      onLoginPress()
                    }
                  }}
                />
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  className={classes.submit}
                  style={{ marginTop: 20, height: 48, fontSize: 18 }}
                  onClick={onLoginPress}
                  disabled={auth?.username && auth?.password ? false : true}
                >
                  {language.login}
                </Button>
              </form>
              <div style={{ marginTop: 15, fontSize: 18, marginBottom: 15 }}>
                OR
              </div>
              <Button
                sx={{height: 48, width: 396, fontSize: 18}}
                variant="contained"
                startIcon={<GoogleIconSvg />} // 在這裡添加 Google 圖標
                onClick={googleLogin}
              >
                Login with Google
              </Button>
              {/* <Button
                  fullWidth
                  style={{ marginTop: 20 }}
                  onClick={()=>setConnectGoogleVerifyModal(true)}
                >
                  {'連結手機Google驗證'}
                </Button> */}
              {/* <Link href="#" variant="body2" style={{ textDecoration: 'none', marginTop: 20 }}>
                忘記密碼
              </Link> */}
            </div>
            <ReCAPTCHA
              ref={(r) => reCaptchaRef.current = r}
              sitekey={REACT_APP_RECAPTCHA_KEY}
              size="invisible"
              badge="bottomright"
            />
          </Container>
        </Card>
      </Container>
    </div>
  );

}