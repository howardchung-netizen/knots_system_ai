import * as React from 'react';
import { Box, useTheme, Grid, Divider, Container, Typography, Paper, Button } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import BackdropLoading from '../components/BackdropLoading';
import { useSnackbar } from 'notistack';
import { UserContext } from '../contexts/UserContext';
import PropTypes from 'prop-types';
import { makeStyles } from '@mui/styles';
import { gql, useLazyQuery } from '@apollo/client';
import { BOOK_KEEPING_ACCOUNTS_QUERY, BOOK_KEEPING_PERIOD_EXPENSES_QUERY, BOOK_KEEPING_TRANSACTIONS_QUERY, PORJECT_ORDERS_QUERY, PROJECT_INVOICES_QUERY } from '../apollo/queries';
import { bookKeepingAccountFragment, bookKeepingPeriodExpenseFragment, bookKeepingTransactionFragment, projectInvoiceFragment, projectOrderFragment } from '../apollo/fragments';
import { toMoney } from '../utils';
import moment from 'moment';
import Input from '../components/Input';
import ReactToPrint from 'react-to-print';
import '../components/balanceSheet/BalanceSheet.css';
import { ComponentToPrint } from '../components/ComponentToPrint';

const REACT_APP_DEFAULT_COMPANY = process.env.REACT_APP_DEFAULT_COMPANY;

const fontFamily = 'sans-serif, Arial'

const useStyles = makeStyles(theme => ({
  tab: { 
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

const sortByTransationDate = (list) => {
  return list.sort((a, b) => {
    return new Date(a.transactionDate) - new Date(b.transactionDate);
  })
}

export default function () {

  const theme = useTheme();
  const classes = useStyles();
  const [user, userDispatch] = React.useContext(UserContext);
  const navigate = useNavigate();
  const {accountId} = useParams();
  const queryParam = new URLSearchParams(window.location.search);
  const [tab, setTab] = React.useState(parseInt(queryParam.get('tab'))??0);
  let defaultFanancialYearStart = moment().month() > 3 ? moment().format('YYYY') : moment().subtract(1, 'Y').format('YYYY');
  let defaultFanancialYearEnd = moment().month() > 3 ? moment().add(1, 'Y').format('YYYY') : moment().format('YYYY');
  const [formData, setFormData] = React.useState({
    dateStart: moment(`${defaultFanancialYearStart}-04-30`, 'YYYY-MM-DD').format('YYYY-MM-DD'),
    dateEnd: moment(`${defaultFanancialYearEnd}-03-31`, 'YYYY-MM-DD').format('YYYY-MM-DD'),
  });
  const [result, setResult] = React.useState({});
  const [inputError, setInputError] = React.useState({});
  const incomeItemsRef = React.useRef();
  const expenseItemsRef = React.useRef([]);
  const liabilitiesItemsRef = React.useRef([]);
  const equityItemsRef = React.useRef([]);
  const assetsItemsRef = React.useRef([]);
  const totalInvoiceAmount = React.useRef(0);
  const componentRef = React.useRef();
  const [assetsList, setAssetsList] = React.useState([]);
  const lastEquityRef = React.useRef(0);
  const [lastEquity, setLastEquity] = React.useState(0);
  const lastIncomeRef = React.useRef(0);
  const lastExpenseRef = React.useRef(0);
  const [liabilitiesList, setLiabilitiesList] = React.useState([]);
  const [equityList, setEquityList] = React.useState([]);
  const [incomeList, setIncomeList] = React.useState([]);
  const [invoiceList, setInvoiceList] = React.useState([]);
  const [expenseList, setExpenseList] = React.useState([]);

  const { enqueueSnackbar } = useSnackbar();

  const onFormDataChange= (key, value) => {
    let data = {};
    let _inputError = inputError;
    for (let i in key) {
      data[key[i]] = value[i] === '' ? null : value[i];
      _inputError[key[i]] = null;
      setInputError(_inputError);
    }
    setFormData({ ...formData, ...data });
  }
  
  const handleTabChange = (event, newValue) => {
    let url = `/cms/financial_statement?tab=${newValue}`
    setTab(newValue);
    navigate( url, { replace: true });
  };

  const handleTabChangeIndex = (index) => {
    let url = `/cms/financial_statement?tab=${index}`
    setTab(index);
    navigate( url, { replace: true });
  };

  const [projectInvoiceUseQuery, projectInvoiceStatus] = useLazyQuery(gql`${PROJECT_INVOICES_QUERY} ${projectInvoiceFragment}`, {fetchPolicy: 'network-only',});
  const [projectOrderUseQuery, projectOrderStatus] = useLazyQuery(gql`${PORJECT_ORDERS_QUERY} ${projectOrderFragment}`, {fetchPolicy: 'network-only',});
  const [transactionUseQuery, transactionQueryStatus] = useLazyQuery(gql`${BOOK_KEEPING_TRANSACTIONS_QUERY} ${bookKeepingTransactionFragment}`);
  const [transaction2UseQuery, transactionQuery2Status] = useLazyQuery(gql`${BOOK_KEEPING_TRANSACTIONS_QUERY} ${bookKeepingTransactionFragment}`);
	const [bookKeepingPeriodExpensesUseQuery, bookKeepingPeriodExpensesQueryStatus] = useLazyQuery(gql`${BOOK_KEEPING_PERIOD_EXPENSES_QUERY} ${bookKeepingPeriodExpenseFragment}`, {fetchPolicy: 'network-only',});
  const [dataUseQuery, dataQueryStatus] = useLazyQuery(gql`${BOOK_KEEPING_ACCOUNTS_QUERY} ${bookKeepingAccountFragment}`, {
		fetchPolicy: 'cache-and-network',
		variables: { 
      deleted: false,
		},
    onCompleted: (res) => {
      if (res.bookKeepingAccounts?.edges.length == 0 ) {
        enqueueSnackbar("讀取失敗...", {
          variant: 'error'
        })
      }
      else {

        let _assetsList = res.bookKeepingAccounts.edges.filter((i) => {
          return i.node.parentAccount?.name == '資產'
        }).map(e=> {
          return e.node
        });
        let _liabilitiesList = res.bookKeepingAccounts.edges.filter((i) => {
          return i.node.parentAccount?.name == '負債'
        }).map(e=> {
          return e.node
        });
        let _equityList = res.bookKeepingAccounts.edges.filter((i) => {
          return i.node.parentAccount?.name == '股東權益'
        }).map(e=> {
          return e.node
        });
        let _incomeList = res.bookKeepingAccounts.edges.filter((i) => {
          return i.node.parentAccount?.name == '收入'
        }).map(e=> {
          return e.node
        });
        let _expenseList = res.bookKeepingAccounts.edges.filter((i) => {
          return i.node.parentAccount?.name == '費用'
        }).map(e=> {
          return e.node
        }).sort((a, b) => {});

        setAssetsList(sortByTransationDate(_assetsList))
        setLiabilitiesList(sortByTransationDate(_liabilitiesList))
        setEquityList(sortByTransationDate(_equityList))
        setIncomeList(sortByTransationDate(_incomeList))
        setExpenseList(sortByTransationDate(_expenseList))

      }
    },
    onError: (error) => {
      enqueueSnackbar(error.message, {
        variant: 'error'
      })
    }
	});
  const [openedModal, setOpenedModal] = React.useState({});

  const onPrintClick = () => {

  }

  const TransactionRecordTable = ({ data = [], total = 0 }) => {
    return (
      <table className="transaction-table">
        
        <thead>
          <tr>
            <th style={{width: 200}}>科目</th>
            <th>描述</th>
            <th style={{width: 100}}>日期</th>
            <th style={{textAlign: 'right', width: 150}}>金額</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td>{item?.account?.name}</td>
              <td>{item?.desc}</td>
              <td>{item?.transactionDate}</td>
              <td style={{textAlign: 'right'}}>{toMoney(item?.amount)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan="3">總計</td>
            <td style={{textAlign: 'right'}}>{toMoney(total)}</td>
          </tr>
        </tfoot>
      </table>
    );
  };
  
  const RowItem = ({name, amount3}) => {
    return  <li style={{display: 'flex', justifyContent: 'space-between'}}><div>{name}</div> <div className="amount" style={{textAlign: 'right'}}>{amount3}</div></li>
  }

  const SubTotal = ({name, amount, amount2, amount3}) => {
    return <li className='sub-total'><div style={{width: '31%'}}>{name}</div> <div style={{width: '65%', display: 'flex'}}><div className="amount">{amount}</div><div className="amount">{amount2}</div><div className="amount">{amount3}</div></div></li>
  }

  const Total = ({name, amount, amount2, amount3}) => {
    return  <li className='total' style={{display: 'flex', justifyContent: 'space-between'}}><div>{name}</div> <div className="amount" style={{textAlign: 'right'}}>{amount3}</div></li>
  }

  const loadData = () => {
    transaction2UseQuery({
      fetchPolicy: 'no-cache',
      variables: {
        transactionDateEnd: moment(formData.dateStart, 'YYYY-MM-DD').subtract(1, 'day').format('YYYY-MM-DD'),
        deleted: false,
      },
      onCompleted: (res) => {
        lastEquityRef.current = 0;
        lastIncomeRef.current = 0;
        lastExpenseRef.current = 0;

        if (res.bookKeepingTransactions.edges.length) {
          res.bookKeepingTransactions.edges.forEach((i) => {
            if (i.node.transactionItems.length) {

              let item = i.node.transactionItems[0]
              let item2 = i.node.transactionItems[1]

              if (item.account?.accountType.name == '股東權益') {
                lastEquityRef.current += item.amount;
              }
              if (item2.account?.accountType.name == '股東權益') {
                lastEquityRef.current += item2.amount;
              }

              if (item.account?.accountType.name == '收入') {
                lastIncomeRef.current += item.amount;
              }
              if (item2.account?.accountType.name == '收入') {
                lastIncomeRef.current += item2.amount;
              }

              if (item.account?.accountType.name == '費用') {
                lastExpenseRef += item.amount;
              }
              if (item2.account?.accountType.name == '費用') {
                lastExpenseRef += item2.amount;
              }
            }
          })
        }

        lastEquityRef.current = lastEquityRef.current + lastIncomeRef.current - lastExpenseRef.current;
        setLastEquity(lastEquityRef.current);
      }
    });
    transactionUseQuery({
      fetchPolicy: 'no-cache',
      variables: {
        transactionDateStart: formData.dateStart,
        transactionDateEnd: formData.dateEnd,
        deleted: false,
      },
      onCompleted: (res) => {

        let transactionIncom = 0;
        let transactionExpense = 0;
        let transactionBalance = 0;
        let liabilitiesAmount = 0;
        let equityAmount = 0;
        let totalAssets = 0;

        equityItemsRef.current = [];
        incomeItemsRef.current = [];
        expenseItemsRef.current = [];
        liabilitiesItemsRef.current = [];
        assetsItemsRef.current = [];

        if (res.bookKeepingTransactions.edges.length) {
          res.bookKeepingTransactions.edges.forEach((i) => {
            if (i.node.transactionItems.length) {

              let item = i.node.transactionItems[0]
              let item2 = i.node.transactionItems[1]

              if (item.account?.accountType.name == '資產') {
                totalAssets += item.amount;
                assetsItemsRef.current.push({ ...item, transactionDate: i.node.transactionDate });
              }
              if (item2.account?.accountType.name == '資產') {
                totalAssets += item2.amount;
                assetsItemsRef.current.push({ ...item2, transactionDate: i.node.transactionDate });
              }
              if (item.account?.accountType.name == '收入') {
                transactionIncom += item.amount;
                incomeItemsRef.current.push({ ...item, transactionDate: i.node.transactionDate });
              }
              if (item2.account?.accountType.name == '收入') {
                transactionIncom += item2.amount;
                incomeItemsRef.current.push({ ...item2, transactionDate: i.node.transactionDate });
              }

              if (item.account?.accountType.name == '費用') {
                transactionExpense += item.amount;
                expenseItemsRef.current.push({ ...item, transactionDate: i.node.transactionDate });
              }
              if (item2.account?.accountType.name == '費用') {
                transactionExpense += item2.amount;
                expenseItemsRef.current.push({ ...item2, transactionDate: i.node.transactionDate });
              }

              if (item.account?.accountType.name == '負債') {
                liabilitiesAmount += item.amount;
                liabilitiesItemsRef.current.push({ ...item, transactionDate: i.node.transactionDate });
              }
              if (item2.account?.accountType.name == '負債') {
                liabilitiesAmount += item2.amount;
                liabilitiesItemsRef.current.push({ ...item2, transactionDate: i.node.transactionDate });
              }

              if (item.account?.accountType.name == '股東權益') {
                equityAmount += item.amount;
                equityItemsRef.current.push({ ...item, transactionDate: i.node.transactionDate });
              }
              if (item2.account?.accountType.name == '股東權益') {
                equityAmount += item2.amount;
                equityItemsRef.current.push({ ...item2, transactionDate: i.node.transactionDate });
              }


            }
          })
        }
        transactionBalance = transactionIncom - transactionExpense;
        equityAmount = equityAmount + transactionBalance;
        equityItemsRef.current.push({ account: { name: '損益' }, amount: transactionBalance })

        setResult({
          transactionIncom: transactionIncom,
          transactionExpense: transactionExpense,
          transactionBalance: transactionBalance,
          liabilitiesAmount: liabilitiesAmount,
          equityAmount: equityAmount,
          totalAssets: totalAssets
        })
      }
    });
    projectOrderUseQuery({
      variables: {
        deleted: false,
      },
      onCompleted: (res) => {
      }
    });
    projectInvoiceUseQuery({
      variables: {
        deleted: false,
        paidStart: moment(formData.dateStart).format('YYYY-MM-DD'),
        paidEnd: moment(formData.dateEnd).format('YYYY-MM-DD'),
        settlement: false
      },
      onCompleted: (res) => {
        totalInvoiceAmount.current = 0;
        if (res.projectInvoices?.edges.length) {
          setInvoiceList(res.projectInvoices.edges.map(e => {
            totalInvoiceAmount.current += e.node.grandTotal
            return e.node
          }))
        }
      }
    });
    bookKeepingPeriodExpensesUseQuery({
      variables: {
        deleted: false,
        // financialFromDate: formData.dateStart,
        // toDate: formData.dateEnd,
        // isFindFuture: true,
      },
      onCompleted: (res) => {

        if (res.bookKeepingPeriodExpenses?.edges.length) {
          let list = [];
          let toDay = moment().format('YYYY-MM-DD');
          let expenseList = res.bookKeepingPeriodExpenses.edges.map(e => e.node);

          for (let i in expenseList) {
            let item = expenseList[i];
            let period = item.period == 'monthly' ? 'M' : 'Y';
            let futurePeriod = moment(toDay).diff(item.toDate, period);
            if (futurePeriod < 0) {
              for (let j = futurePeriod; j < 0; j++) {
                let transactionDate = moment(item.toDate).add(j, period).format('YYYY-MM');
                let transactionDay = item.periodDay < 32 ? item.periodDay : moment(transactionDate).daysInMonth();
                transactionDate = transactionDate + '-' + transactionDay;
                list.push({ ...item, transactionDate })
              }
            }
          }
        }
      }
    });
    dataUseQuery();
  }

  React.useLayoutEffect(() => {
    loadData();
  }, [])

  return (
    <Container style={{ maxWidth: 1000, padding: 0 }}>
      <Grid container spacing={3} padding={3}>
        {
          transactionQueryStatus.loading && <BackdropLoading />
        }
        <Grid item xs={12} sm={12} md={4}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              搜尋
            </Typography>
            <Input
              label="開始日期:"
              variant="standard"
              type="date"
              value={formData.dateStart}
              onChange={(e) => {
                onFormDataChange(["dateStart"], [e.target.value])
              }}
            />
            <Input
              label="結束日期:"
              variant="standard"
              type="date"
              value={formData.dateEnd}
              onChange={(e) => {
                onFormDataChange(["dateEnd"], [e.target.value])
              }}
            />
            <Button variant='outlined' color="info" sx={{width: '100%', marginTop: 1, marginBottom: 1}} onClick={loadData}>搜尋</Button>
            <ReactToPrint
              trigger={() => <Button style={{ width: '100%' }} variant="contained">列印</Button>}
              content={() => componentRef.current}
            />
          </Paper>
        </Grid>
        <Grid item xs={12} sm={12} md={12}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
              資產
            </Typography>
            <Divider sx={{ borderWidth: 2, borderColor: '#3c4858' }} />
            {
              <TransactionRecordTable data={assetsItemsRef.current} total={result.totalAssets} />
            }
          </Paper>
        </Grid>
        <Grid item xs={12} sm={12} md={12}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
              股東權益
            </Typography>
            <Divider sx={{ borderWidth: 2, borderColor: '#3c4858' }} />
            {
              <TransactionRecordTable data={equityItemsRef.current} total={result.equityAmount} />
            }
          </Paper>
        </Grid>
        <Grid item xs={12} sm={12} md={12}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
              負債
            </Typography>
            <Divider sx={{ borderWidth: 2, borderColor: '#3c4858' }} />
            {
              <TransactionRecordTable data={liabilitiesItemsRef.current} total={result.liabilitiesAmount} />
            }
          </Paper>
        </Grid>
        <Grid item xs={12} sm={12} md={12}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
              費用
            </Typography>
            <Divider sx={{ borderWidth: 2, borderColor: '#3c4858' }} />
            {
              <TransactionRecordTable data={expenseItemsRef.current} total={result.transactionExpense} />
            }
          </Paper>
        </Grid>
        <Grid item xs={12} sm={12} md={12}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
              收入
            </Typography>
            <Divider sx={{ borderWidth: 2, borderColor: '#3c4858' }} />
            {
              <TransactionRecordTable data={incomeItemsRef.current} total={result.transactionIncom} />
            }
          </Paper>
        </Grid>
        <Grid item xs={12} sm={12} md={12}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
              損益
            </Typography>
            <Divider sx={{ borderWidth: 2, borderColor: '#3c4858' }} />
            {
              <TransactionRecordTable
                data={[
                  { transactionDate: '', amount: result.transactionExpense, desc: '總支出' },
                  { transactionDate: '', amount: result.transactionIncom, desc: '總收入' },
                ]} total={result.transactionIncom - result.transactionExpense} />
            }
          </Paper>
        </Grid>
        <Grid item xs={12} sm={12} md={12}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2 }}>
              未入帳發票
            </Typography>
            <Divider sx={{ borderWidth: 2, borderColor: '#3c4858' }} />
            {
              TransactionRecordTable(invoiceList, totalInvoiceAmount.current)
            }
          </Paper>
        </Grid>
      </Grid>
      <ComponentToPrint ref={componentRef}>
        <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                fontFamily: fontFamily
              }}
            >
        <div className="balance-sheet print-page a4-size">
          <h1 className="title">Balance Sheet</h1>
          <div className="date">Date: {formData.dateStart} ~ {formData.dateEnd}</div>
          <div className="content">
              <div className="column" style={{ width: '31%' }}>
                <ul>
                  <h2><RowItem name={"費用"} /></h2>
                </ul>
                <ul>
                  {expenseItemsRef.current.map((item, index) => {
                    return <RowItem key={index} name={item.account.name} amount3={toMoney(item.amount)} />
                  })}
                </ul>
              </div>
            <div className="column" style={{width: '31%'}}>
              <ul>
              <h2><RowItem name={"收入"}/></h2>
              </ul>
              <ul>
                {incomeItemsRef?.current?.map((item, index) => {
                  return <RowItem key={index} name={item.account.name+ `\n${item.desc}`} amount3={toMoney(item.amount)} />
                })}
              </ul>
            </div>
            <div className="column" style={{width: '31%'}}>
              <ul>
              <h2><RowItem name={"損益"}/></h2>
              </ul>
              <ul>
                  <RowItem name={"總支出"} amount3={toMoney(result.transactionExpense)} />
                  <RowItem name={"總收入"} amount3={toMoney(result.transactionIncom)} />
              </ul>
            </div>
          </div>
          <Divider />
          <div className="content">
            <div className="column" style={{width: '31%'}}>
              <ul>
              <Total name={"總數:"} amount3={toMoney(result.transactionExpense)} />
              </ul>
            </div>
            <div className="column" style={{width: '31%'}}>
              <ul>
              <Total amount3={toMoney(result.transactionIncom)} />
              </ul>
            </div>
            <div className="column" style={{width: '31%'}}>
              <ul>
              <Total amount3={toMoney(result.transactionBalance)}/>
              </ul>
            </div>
          </div>
          <div className="content">
            <div className="column" style={{width: '31%'}}>
              <ul>
              <h2><RowItem name={"資產"}/></h2>
              </ul>
              <ul>
                {assetsList.map((asset, index) => {
                  return <RowItem key={index} name={asset.name} amount3={toMoney(asset.balance)} />
                })}
              </ul>
            </div>
            <div className="column" style={{width: '31%'}}>
              <ul>
              <h2><RowItem name={"負債"}/></h2>
              </ul>
              <ul>
                {liabilitiesItemsRef?.current?.map((item, index) => {
                  return <RowItem key={index} name={item.account.name} amount3={toMoney(item.amount)} />
                })}
              </ul>
            </div>
            <div className="column" style={{width: '31%'}}>
              <ul>
              <h2><RowItem name={"本期權益"}/></h2>
              </ul>
              <ul>
                {equityItemsRef?.current?.map((item, index) => {
                  return <RowItem key={index} name={item.account.name} amount3={toMoney(item.amount)} />
                })}
              </ul>
            </div>
          </div>
          <Divider />
          <div className="content">
            <div className="column" style={{width: '31%'}}>
              <ul>
              <Total name={"總數:"} amount3={toMoney(result.totalAssets)} />
              </ul>
            </div>
            <div className="column" style={{width: '31%'}}>
              <ul>
              <Total amount3={toMoney(result.liabilitiesAmount)} />
              </ul>
            </div>
            <div className="column" style={{width: '31%'}}>
              <ul>
              <Total amount3={toMoney(result.equityAmount)}/>
              </ul>
            </div>
          </div>

          <div className="content">
              <div className="column" style={{ width: '31%' }}>
              </div>
            <div className="column" style={{width: '31%'}}>
            </div>
            <div className="column" style={{width: '31%'}}>
              <ul>
              <h2><RowItem name={"權益變動"}/></h2>
              </ul>
              <ul>
                  <RowItem name={"初期權益"} amount3={toMoney(lastEquityRef.current)} />
                  <RowItem name={"本期權益"} amount3={toMoney(result.equityAmount)} />
              </ul>
            </div>
          </div>
          <Divider />
          <div className="content">
            <div className="column" style={{width: '31%'}}>
            </div>
            <div className="column" style={{width: '31%'}}>
            </div>
            <div className="column" style={{width: '31%'}}>
            <ul>
              <Total amount3={toMoney(result.equityAmount + lastEquity)}/>
              </ul>
            </div>
          </div>
          <footer className="footer">© {REACT_APP_DEFAULT_COMPANY} LTD. All Rights Reserved.</footer>
        </div>
        </div>
        </ComponentToPrint>
    </Container>
  );

}
