import React, { useEffect } from 'react';
import { Toolbar, TableContainer, Table, TableHead, TableBody, TableRow, TableCell, TablePagination, Tooltip, IconButton, SvgIcon, Chip, Button, TextField, Collapse, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import EditIcon from '@mui/icons-material/Edit';
import { toLocaleDatetime } from '../utils';
import CheckIcon from '@mui/icons-material/Check';
import DeleteIcon from '@mui/icons-material/Delete';
import ClearIcon from '@mui/icons-material/Clear';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';

// import { useTranslation } from 'react-i18next';


const useStyles = makeStyles(theme => ({
  container: {
    maxHeight: '100%',
  },
  header: {
    backgroundColor: theme.palette.common.white,
    color: '#84909f',
    '@media print': {
      padding: '8px !important',
      fontSize: '0.65rem',
      lineHeight: 1
    }
  },
  cell: {
    '@media print': {
      padding: '8px !important',
      fontSize: '0.65rem',
      lineHeight: 1
    }
  },
  toolbar: {
    alignItems: 'start',
  },
  filterContainer: {
    alignItems: 'center',
    display: 'flex',
    flexGrow: 1,
    flexWrap: 'wrap',
    padding: theme.spacing(2),
  },
  filterWrapper: {
    marginBottom: theme.spacing(2),
    marginRight: theme.spacing(2),
  },
  actionContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    padding: theme.spacing(2),
  },
  actionWrapper: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
    marginRight: theme.spacing(2),
  },
  actionButton: {
    borderRadius: '2rem',
    padding: `${theme.spacing(1.5)}px 2rem`,
  },
  chip: {
    margin: theme.spacing(0.25),
  },
  headingContainer: {
    width: '100%',
    padding: '10px 50px',
    backgroundColor: '#f0f4f7', //'#F8EFFF',
    borderWidth: '1px 0 2px 0',
    borderStyle: 'solid', 
    borderColor: '#c3cdd9', //'#DFD8FF'
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#4527c6' //'#6f52ed'
  }
}));

export function CustomTableActionButton({ children, ...props }) {
  const classes = useStyles();

  return <Button variant="contained" color="primary" className={classes.actionButton} {...props}>{children}</Button>;
}

function Row(props) {
  const { datum, columns, rowActions, rowClass, rowCollapse, rowStyle, tableRowAction, columnCount, collapseStyle } = props;

  const classes = useStyles();
  const [open, setOpen] = React.useState(false);

  return (
    <React.Fragment>
      <TableRow hover role={tableRowAction ? "checkbox" : ""} className={rowClass} style={{...(rowStyle ?? {}), ...(tableRowAction && { cursor: 'pointer' })}} onClick={() => { return tableRowAction ? tableRowAction(datum) : () => { } }}>
        {columns && columns.map((column, columnKey) => {
          let align;
          if (Array.isArray(column.field)) {
            var renderedData = {};
            for (var i = 0; i < column.field.length; i++) {
              const [datumKey, datumListKey] = column.field[i].split('.');
              renderedData[datumKey] = datumListKey ? { [datumListKey]: datum?.[datumKey]?.[datumListKey] } : datum?.[datumKey];
            }
            if (!column.render) {
              column.render = data => JSON.stringify(data);
            }
          } else {
            var [datumKey, datumListKey] = column.field.split('.');
            renderedData = datum[datumKey];
          }
          if (column.render) {
            renderedData = column.render(renderedData);
          } else {
            if (!column.type) column.type = 'string';
            switch (column.type) {
              case 'object':
                const defaultValue = column.defaultValue ? column.defaultValue : '-';
                renderedData = renderedData && datumListKey && renderedData[datumListKey] ? renderedData[datumListKey] : defaultValue;
                break;
              case 'integer':
                align = 'right';
                renderedData = new Intl.NumberFormat('zh-HK').format(renderedData);
                break;
              case 'float':
                align = 'right';
                renderedData = new Intl.NumberFormat('zh-HK', { minimumFractionDigits: column.minimumFractionDigits || 2, maximumFractionDigits: column.maximumFractionDigits || 2 }).format(renderedData);
                break;
              case 'currency':
                align = 'right';
                renderedData = new Intl.NumberFormat('zh-HK', { minimumFractionDigits: column.minimumFractionDigits || 2, maximumFractionDigits: column.maximumFractionDigits || 2, style: 'currency', currency: column.currency || 'HKD' }).format(renderedData);
                break;
              case 'datetime':
                renderedData = toLocaleDatetime(renderedData);
                break;
              case 'list':
                renderedData = renderedData.length > 0 ? renderedData.map((v, k) => <Chip key={k} label={v[datumListKey]} className={classes.chip} />) : column.defaultValue;
                break;
              case 'rowEdit':
                renderedData = <OrderTextfield renderedData={renderedData} column={column} row={datum} style={{ marginTop: 0 }} />;
                break;
              case 'img':
                renderedData =
                  renderedData ?
                    <a href={renderedData} target="_blank" rel="noopener noreferrer">
                      <img src={renderedData} style={{ width: '100px', maxHeight: '100px' }} alt="" />
                    </a>
                    :
                    <img src={column.defaultValue} style={{ width: '100px', maxHeight: '100px' }} alt="" />
                break;
              case 'custom':
                renderedData = column.display({ renderedData, className: column.class ? column.class(renderedData) : '', row: datum, props: props });
                break;
              default:
            }
          }
          if (column.align) align = column.align;

          return (
            <TableCell key={columnKey} align={align} onClick={column.onClick ? () => column.onClick(datum) : () => { }}
              style={{ cursor: `${tableRowAction || column.onClick ? 'pointer' : 'auto'}`, ...(typeof column?.style === 'function' && !Array.isArray(column.field) ? column?.style(datum[datumKey]) : column?.style) }}
              className={`${classes.cell} ${open && (columnKey === 0 ? collapseStyle?.collapsedLeft : {} && collapseStyle?.collapsed)}`}
            >{renderedData}</TableCell>
          );
        })}
        {rowActions && (
          <TableCell className={classes.cell}>{rowActions.map((rowAction, rowActionKey) => {
            if (rowAction.icon) {

            } else if (rowAction.type) {
              switch (rowAction.type) {
                case 'edit':
                  rowAction.tooltip = '修改';
                  rowAction.icon = <SvgIcon component={rowAction.iconComponent || EditIcon} viewBox="0 0 20.303 20.184" />;
                  break;
                case 'delete':
                  rowAction.tooltip = '刪除';
                  rowAction.icon = <SvgIcon component={rowAction.iconComponent || DeleteIcon} viewBox="0 0 20.303 20.184" />;
                  break;
                default:
                  rowAction.icon = <SvgIcon component={rowAction.iconComponent} viewBox="0 0 20.303 20.184" />;
                  break;
              }
            }
            return (
              <Tooltip key={rowActionKey} title={rowAction.tooltip || ''}>
                {
                  rowAction.type === 'custom' ?
                    rowAction.component(datum)
                    :
                    <IconButton color="primary" onClick={e => rowAction.onClick(e, datum)}>{rowAction.icon}</IconButton>
                }
              </Tooltip>
            );
          })}</TableCell>
        )}
        {rowCollapse &&
          <TableCell className={`${classes.cell} ${open && collapseStyle?.collapsedRight}`}>
            <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
              {open ? <KeyboardArrowUpIcon style={{ color: '#6f52ed' }} /> : <KeyboardArrowDownIcon style={{ color: '#6f52ed' }} />}
            </IconButton>
          </TableCell>
        }
      </TableRow>
      {rowCollapse &&
        <TableRow>
          <TableCell style={{ padding: 0, border: 0 }} colSpan={columnCount}>
            <Collapse in={open} timeout="auto" unmountOnExit>
              {rowCollapse(datum)}
            </Collapse>
          </TableCell>
        </TableRow>
      }
    </React.Fragment>
  )
}

export function CustomTable(props) {
  const { filters, filterWrapperStyle, actions, rowActions, columns, rowCollapse, loading, error, data, tagfilters, actionsHeaderStyle, rowSize, heading, tableStyle, collapseStyle, tableRowAction, ...otherProps } = props
  const classes = useStyles();
  // const { t } = useTranslation();
  const t =()=>{}
  const columnCount = Math.max(1, (rowActions ? 1 : 0) + (columns ? columns.length : 0) + (rowCollapse ? 1 : 0));

  return (
    <>
      {(filters || actions) && (
        <>
          <Toolbar className={classes.toolbar}>
            {filters && (
              <div className={classes.filterContainer}>
                {filters.map((filter, filterKey) => <div key={filterKey} className={classes.filterWrapper} style={{ ...filterWrapperStyle }}>{filter}</div>)}
              </div>
            )}
            {actions && (
              <div className={classes.actionContainer}>
                {actions.map((action, actionKey) => <div key={actionKey} className={classes.actionWrapper}>{action}</div>)}
              </div>
            )}
          </Toolbar>
          {tagfilters && (
            <Toolbar className={classes.toolbar}>
              <div className={classes.filterContainer}>
                {tagfilters.map((filter, filterKey) => <div key={filterKey} className={classes.filterWrapper}>{filter}</div>)}
              </div>
            </Toolbar>
          )}
        </>
      )}
      {heading && ( 
        <div className={classes.headingContainer}>
          <Typography className={classes.heading} noWrap>{heading}</Typography>
        </div>
      )}
      <TableContainer className={classes.container} style={{ ...tableStyle }}>
        <Table stickyHeader {...otherProps} size={rowSize === 'small' ? 'small' : 'medium'}>
          <TableHead>
            <TableRow>
              {columns && columns.map((column, columnKey) => {
                let align;
                if (!column.type) column.type = 'string';
                switch (column.type) {
                  case 'integer':
                  case 'float':
                  case 'currency':
                    align = 'right';
                    break;
                  default:
                }
                if (column.align) align = column.align;

                return (
                  <TableCell key={columnKey} align={align} className={classes.header} onClick={column.headerOnClick} style={{ cursor: `${column.headerOnClick ? 'pointer' : ''}`, ...(column.headerStyle ?? {}) }}>{column.title}</TableCell>
                );
              })}
              {rowActions && <TableCell className={classes.header} style={actionsHeaderStyle ?? {}}>{t('general.action')}</TableCell>}
              {rowCollapse && <TableCell className={classes.header}></TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={columnCount}>{t('general.loading')}…</TableCell>
              </TableRow>
            )}
            {error && (
              <TableRow>
                <TableCell colSpan={columnCount}>{t('general.loadingError')}</TableCell>
              </TableRow>
            )}
            {data && data.map((datum, datumKey) => (
              <Row key={datumKey} datum={datum} datumKey={datumKey} columnCount={columnCount} collapseStyle={collapseStyle} {...props} />
            ))}
            {!loading && !error && data && (data.length === 0) && (
              <TableRow>
              <TableCell colSpan={columnCount}>{t('general.noRecord')}</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      {
        props.pagination && (
          <TablePagination component="div" {...props.pagination} />
        )
      }
    </>
  );
}

export function OrderTextfield(props) {
  // const { renderedData, className, column, row } = props;
  const { renderedData, column, row } = props;
  const [click, setClick] = React.useState(false);
  const [value, setValue] = React.useState(null);
  useEffect(() => {
    setValue(renderedData);
  }, [renderedData]);

  const handleClickAway = () => {
    if (click && value) {
      console.log(2);
      column.rowOnClick(row, value);
      setValue(renderedData);
      setClick(false);
    } else {
      console.log(3);
      setClick(!click);
    }
  };
  const changeValue = e => {
    e.preventDefault();
    setValue(e.target.value);
  };
  const cancelClick = e => {
    setValue(renderedData);
    setClick(false);
  };
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
      {click ? <TextField value={value} type="number" onChange={changeValue} style={{ marginTop: 0 }} /> : value}
      {
        click &&
        <IconButton aria-label="delete" onClick={cancelClick}>
          <ClearIcon />
        </IconButton>
      }
      <IconButton aria-label="delete" onClick={handleClickAway}>
        {click ?
          <CheckIcon />
          :
          <EditIcon />
        }
      </IconButton>
    </div>
  );
}
