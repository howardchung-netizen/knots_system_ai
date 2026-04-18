import React, { useState } from 'react';
import { makeStyles, useTheme } from '@mui/styles';
import { useQuery, useMutation } from '@apollo/client';
import { GET_APP_SETTINGS } from '../../apollo/queries';
import { APP_SETTING_CREATE, APP_SETTING_UPDATE, APP_SETTING_DELETE } from '../../apollo/mutations';
import { CustomTable, CustomTableActionButton } from '../../components/CustomTable';
import AddIcon from '@mui/icons-material/Add';
import { TextField } from '@mui/material';
import { useSnackbar } from 'notistack';
import AppsettingsEditModal from '../../components/AppsettingsEditModal';

const useStyles = makeStyles(theme => ({
    searchView: {
        backgroundColor: "#FFF",
        // marginTop: '20px',
        display: 'flex',
        padding: '20px 30px'
    },
    flatListHeader: {
        height: '45px',
        flexDirection: "row",
        alignItems: "center",
        paddingLeft: '25px',
        display: 'flex',
        position: 'relative'
    },
    headerText: {
        color: '#84909F',
        fontSize: '0.8rem',
        fontWeight: '400'
    },
    itemText: {
        color: '#353439',
        fontSize: '0.8rem',
        paddingVertical: '20px',
        fontWeight: '400',
    },
    diaLogConfirm: {
        marginLeft: theme.spacing(1),
        width: '200px',
        color: '#fff',
        backgroundColor: '#6F52ED'
    },
    sectionDateText: {
        color: '#353439',
        fontSize: '8px',
        fontWeight: '400',
        marginTop: '10px',
    },
    bookDialogContainer: {
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#fff',
        width: '600px',
        alignItems: 'center'
        // height: '100px'
    },
    memberInfo: {
        fontSize: '8px',
        fontWeight: '300',
        color: '#353439'
    },
    memberName: {
        fontSize: '12px',
        fontWeight: '500',
        color: '#383838'
    },
    focus: {
        backgroundColor: '#DFD8FF',
    },
    filterSelect: {
        width: '10%',
        height: '50px',
        padding: '0 5px'
    },
    filterButton: {
        border: '1px solid #C3CDD9',
        borderRadius: '8px',
        fontWeight: 'normal',
    },
    button: {
        height: '100%',
        width: '100%',
        fontSize: '0.8rem',
        fontWeight: 'bold',
        padding: '8px 18px',
        // borderRadius: '20px',
        marginRight: theme.spacing(1),
        // marginBottom:12,
    },
    startIcon: {
        // width: '30px',
        alignItems: 'center',
        display: 'flex'
    },
    flat2Img: {
        width: '30px',
        height: '30px',
        margin: theme.spacing(0.5),
        resizeMode: 'contain',
    },
    searchBarView: {
        backgroundColor: '#F0F4F7',
        borderRadius: '10px',
        alignItems: 'center',
        display: 'inline-flex',
        height: '50px',
        width: '80%',
    },
    valueWrapper: {
        margin: 0,
        display: '-webkit-box',
        '-webkit-line-clamp': 3,
        '-webkit-box-orient': 'vertical',
        'overflow': 'hidden'
    }
}));

export default function AppSettingsTable(props) {

    const classes = useStyles();
    const [filterName, setFilterName] = React.useState('');
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [page, setPage] = useState(0);
    const [target, setTarget] = useState(null);
    const [inDetail, setInDetail] = useState(false);
    const { enqueueSnackbar } = useSnackbar();

    const { data, error, loading, refetch } = useQuery(GET_APP_SETTINGS, {
        fetchPolicy: 'network-only',
        notifyOnNetworkStatusChange: true,
        variables: {
            first: rowsPerPage,
            skip: 0,
        }
    });

    const [create, { loading: createLoading }] = useMutation(APP_SETTING_CREATE, {
        onCompleted: (data) => {
            const userErrors = data?.appSettingCreate?.userErrors;
            if (userErrors.length) {
                userErrors.map(e => {
                    enqueueSnackbar(e.message, {
                        variant: 'error'
                    })
                })
            }
            else {
                enqueueSnackbar("新增成功", {
                    variant: 'success'
                })
                refetch();
                setInDetail(false);
            }
        }
    });

    const [update, { loading: updateLoading }] = useMutation(APP_SETTING_UPDATE, {
        onCompleted: (data) => {
            const userErrors = data?.appSettingUpdate?.userErrors;
            if (userErrors.length) {
                userErrors.map(e => {
                    enqueueSnackbar(e.message, {
                        variant: 'error'
                    })
                })
            }
            else {
                enqueueSnackbar("更改成功", {
                    variant: 'success'
                })
                refetch();
                setInDetail(false);
            }
        }
    });

    const [del, { loading: deleteLoading }] = useMutation(APP_SETTING_DELETE, {
        onCompleted: (data) => {
            const userErrors = data?.appSettingDelete?.userErrors;
            if (userErrors.length) {
                userErrors.map(e => {
                    enqueueSnackbar(e.message, {
                        variant: 'error'
                    })
                })
            }
            else {
                enqueueSnackbar("刪除成功", {
                    variant: 'success'
                })
                refetch();
            }
        }
    });

    const columns = [
        { title: 'Description', field: 'description', headerStyle: { width: '40%' } },
        { title: 'Key', field: 'key', headerStyle: { width: '20%' } },
        { title: 'Value', field: 'value', headerStyle: { width: '20%' }, type: 'custom', display: data => <p className={classes.valueWrapper}>{data.renderedData}</p> },
        { title: 'Public', field: 'public', align: 'center', render: (data) => <p>{data ? 'O' : 'X'}</p>},
    ];

    const actions = [
        {
            type: 'edit',
            onClick: (e, data) => { setTarget(data); setInDetail(true); },
        },
        {
            type: 'delete',
            onClick: (e, myTarget) => {
                if (!deleteLoading && window.confirm(`是否刪除這項App setting (${myTarget.key})?`)) {
                    del({
                        variables: {
                            data: {
                                id: myTarget?.id
                            }
                        },
                    });
                }
            },
        },
    ];

    return (<>
        <div style={{ display: 'flex', overflow: 'auto', flexDirection: 'column', position: 'relative', height: '100%' }}>
            <AppsettingsEditModal
            open={inDetail}
            data={target}
            onConfirmClick={!!target ? update : create}
            onCloseClick={()=>setInDetail(false)}
            />
            <CustomTable
                filters={[
                    <TextField id="filterName" label="搜尋" value={filterName} onChange={e => setFilterName(e.target.value)} />
                ]}
                actions={[
                    <CustomTableActionButton startIcon={<AddIcon />} onClick={() => { setTarget(null); setInDetail(true); }}>新增</CustomTableActionButton>
                ]}
                rowActions={actions}
                columns={columns}
                loading={loading}
                error={error}
                data={data?.appSettings?.edges?.reduce((r, a) => {
                    const withSearchBy = filterName && filterName.toString().trim().length !== 0;
                    const isMatchSearch = !withSearchBy
                                            || a.node.key.toUpperCase().includes(filterName.toString().trim().toUpperCase())
                                            || a.node.description.toUpperCase().includes(filterName.toString().trim().toUpperCase())
                                            || a.node.value.toUpperCase().includes(filterName.toString().trim().toUpperCase());
                    if (isMatchSearch) {
                        r.push(a.node);
                    }
                    return r;
                }, []) || []}
                tableStyle={{ overflow: 'auto', flex: 1 }}
                pagination={{
                    rowsPerPageOptions: [5, 10, 25],
                    count: data?.appSettings?.totalCount || 0,
                    rowsPerPage: rowsPerPage,
                    page: page,
                    onPageChange: (event, newPage) => {
                        setPage(newPage);
                        refetch({ first: rowsPerPage, skip: rowsPerPage * newPage });
                    },
                    onRowsPerPageChange: event => {
                        let newRowsPerPage = +event.target.value;
                        setRowsPerPage(newRowsPerPage);
                        setPage(0);
                        refetch({ first: newRowsPerPage, skip: 0 });
                    },
                }}
            />
        </div>
    </>)
}
