import React, { useContext, useState } from 'react';
import { makeStyles, useTheme } from '@mui/styles';
import { AppBar, Toolbar, Tooltip, IconButton, SvgIcon, Typography, Button, FormControlLabel, Switch } from '@mui/material';
import CloseIcon from '../../icons/btnClose';
// import { SnackbarContext } from '../../components/SnackbarProvider';
// import PageLoadingProgress from '../../components/PageLoadingProgress';
import CustomTextField from '../../components/CustomTextField';

const useStyles = makeStyles(theme => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        flex: 1,
    },
    appBarCloseButton: {
        marginRight: theme.spacing(2),
    },
    appBarHeading: {
        flexGrow: 1,
    },
    container: {
        flexGrow: 1,
        position: 'relative',
        padding: theme.spacing(2),
    },
    formControl: {
        margin: theme.spacing(1),
        minWidth: 120,
        width: '100%'
    },
    formLabel: {
        color: '#757575',
        fontWeight: 'bold',
        transform: 'translate(0, 1.5px) scale(0.75)',
        transformOrigin: 'top left'
    }
}));

export default function AppSettingsDetails(props) {
    const { target, loading, setInDetail, submitAction } = props;
    const theme = useTheme();
    const isCreate = !target;
    const goBack = () => setInDetail(false);
    const classes = useStyles();
    // const Snackbar = useContext(SnackbarContext);

    //form data
    const [key, setKey] = useState('');
    const [isPublic, setIsPublic] = useState(false);
    const [description, setDescription] = useState('');
    const [value, setValue] = useState('');
    //formdata

    const initForm = () => {
        setKey('');
        setIsPublic(false);
        setDescription('');
        setValue('');
    }

    const submitForm = e => {
        let errors = [];
        if (!key) {
            errors.push('請輸入 Key');
        }

        if (!description) {
            errors.push('請輸入描述');
        }

        if (!value) {
            errors.push('請輸入數值');
        }

        if (errors.length > 0) {
            // Snackbar.open({ alertProps: { severity: 'error' }, title: '新增失敗', message: errors });
            return false;
        }

        submitAction({
            variables: {
                data: {
                    ...(isCreate ? {} : { id: target.id }),
                    key,
                    public: isPublic,
                    description,
                    value
                }
            }
        });
    }

    React.useEffect(() => {
        if (!!target) {
            setKey(target.key);
            setIsPublic(target.public);
            setDescription(target.description);
            setValue(target.value);
        } else {
            initForm();
        }
    }, [target]);

    return (
        <div className={classes.root} style={{ backgroundColor: '#F0F4F7' }}>
            <AppBar>
                <Toolbar>
                    <Tooltip title="取消">
                        <IconButton className={classes.appBarCloseButton} onClick={e => goBack()}>
                            <SvgIcon component={CloseIcon} viewBox="0 0 27.973 27.973" aria-label="close" />
                        </IconButton>
                    </Tooltip>
                    <Typography className={classes.appBarHeading} variant="h2" noWrap>{isCreate ? '新增App 設定' : '修改App 設定'}</Typography>
                    <Button variant="contained" color="primary" disabled={loading} onClick={e => submitForm(e)}>{isCreate ? '新增並儲存' : '儲存'}</Button>
                </Toolbar>
            </AppBar>
            <div>
                <div className={classes.container} style={{ display: 'flex', justifyContent: 'center', backgroundColor: '#F0F4F7' }}>
                    {/* {loading && <PageLoadingProgress />} */}
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ backgroundColor: '#fff', width: '500px', display: 'flex', flexWrap: 'wrap', margin: '10px 0', padding: '10px', borderRadius: 10 }}>
                            <CustomTextField label={'Key'} value={key} onChange={(e) => { setKey(e.target.value); }} style={{ width: '100%' }} />
                            <div style={{ width: '100%' }}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={isPublic}
                                            onChange={(e) => { setIsPublic(e.target.checked); }}
                                            color="primary"
                                        />
                                    }
                                    label="Public"
                                    labelPlacement="start"
                                    style={{ margin: theme.spacing(1, 0), alignItems: 'flex-start', flexDirection: 'column-reverse' }}
                                    classes={{ label: classes.formLabel }}
                                />
                            </div>
                            <CustomTextField label={'Description'} value={description} onChange={(e) => { setDescription(e.target.value); }} style={{ width: '100%' }} />
                            <CustomTextField label={'Value'} value={value} onChange={(e) => { setValue(e.target.value); }} style={{ width: '100%' }} multiline />
                        </div>
                    </div>
                </div>

            </div>
        </div >
    );
}
