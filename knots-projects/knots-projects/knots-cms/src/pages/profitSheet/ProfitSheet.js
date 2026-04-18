import * as React from 'react';
import { projectDetailFragment, projectInvoiceFragment, projectOrderFragment } from "../../apollo/fragments";
import { PORJECT_ORDERS_QUERY, PROJECT_INVOICES_QUERY, projectsQuery } from "../../apollo/queries";
import { gql, useLazyQuery } from "@apollo/client";
import BackdropLoading from "../../components/BackdropLoading";
import { useParams } from "react-router-dom";
import { baseProjectFragment } from '../../apollo/baseFragment';
import { useSnackbar } from 'notistack';
import { toMoney } from '../../utils';
import './ProfitSheet.css';

const ProfitSheetHeader = ({ projectId, code, start, end }) => {
  return (
    <div className="profit-sheet-header">
      <h1>Profit Sheet</h1>
      <div className="project-info">
        <p><strong>專案:</strong> {projectId}</p>
        <p><strong>名稱:</strong> {code}</p>
        <p><strong>日期:</strong> {start} - {end}</p>
      </div>
    </div>
  );
};

export default function () {

  const { enqueueSnackbar } = useSnackbar();
  const { projectId } = useParams();

  const [projectUseQuery, projectQueryStatus] = useLazyQuery(gql`${projectsQuery} ${baseProjectFragment}`, {
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

  const [porjectOrdersQuery, porjectOrdersQueryStatus] = useLazyQuery(gql`${PORJECT_ORDERS_QUERY} ${projectOrderFragment}`,
    {
      fetchPolicy: 'network-only',
      variables: {
        projectId: parseInt(projectId),
        deleted: false
      }
    });
  const [projectInvoicesQuery, projectInvoicesQueryStatus] = useLazyQuery(gql`${PROJECT_INVOICES_QUERY} ${projectInvoiceFragment}`,
    {
      fetchPolicy: 'network-only',
      variables: {
        projectId: projectId,
        deleted: false
      }
    });

  const project = React.useMemo(() => {
    return projectQueryStatus.data?.projects?.edges[0]?.node;
  }, [projectQueryStatus.data]);

  const expenditureRef = React.useRef(0);
  const incomeRef = React.useRef(0);
  const profitRef = React.useRef(0);
  const unpaidAmountRef = React.useRef(0);
  const detailsRef = React.useRef([]);

  const orders = React.useMemo(() => {
    let orders = [];
    if (porjectOrdersQueryStatus.data?.projectOrders.edges?.length) {
      expenditureRef.current = 0;
      unpaidAmountRef.current = 0;
      orders = porjectOrdersQueryStatus.data.projectOrders.edges.map(({ node }) => {
        if (node.settlement) expenditureRef.current += node.amount;
        if (!node.settlement) unpaidAmountRef.current += node.amount;
        let contentTitle = node.claimForm ? "報銷-" : "訂單-";
        detailsRef.current.push({
          type: 'order',
          date: node.orderedDate,
          content: contentTitle + (node.supplier ?? node.desc),
          unpaidAmount: node.settlement ? 0 : node.amount,
          paidAmount: node.settlement ? node.amount : 0,
          unpaidIncome: 0,
          paidIncome: 0
        });

        return node;
      })
    }
    return orders
  }, [projectId, porjectOrdersQueryStatus]);

  const invoices = React.useMemo(() => {
    let invoices = [];
    if (projectInvoicesQueryStatus.data?.projectInvoices.edges?.length) {
      incomeRef.current = 0;
      invoices = projectInvoicesQueryStatus.data.projectInvoices.edges.map(({ node }) => {
        incomeRef.current += node.grandTotal;
        detailsRef.current.push({
          type: 'invoice',
          date: node.paid,
          content: "發票-" + node.invId,
          unpaidAmount: 0,
          paidAmount: 0,
          unpaidIncome: node.settlement ? 0 : node.grandTotal,
          paidIncome: node.settlement ? node.grandTotal : 0
        });
        return node;
      })
    }
    return invoices
  }, [projectId, projectInvoicesQueryStatus]);

  const loading = porjectOrdersQueryStatus.loading || projectInvoicesQueryStatus.loading;
  detailsRef.current = detailsRef.current.sort((a, b) => {
    return new Date(a.date) - new Date(b.date);
  })

  React.useEffect(() => {
    detailsRef.current = [];
    projectUseQuery();
    porjectOrdersQuery();
    projectInvoicesQuery();
  }, [projectId]);

  // 計算總和
  const totalUnpaidAmount = detailsRef.current.reduce((acc, curr) => acc + curr.unpaidAmount, 0);
  const totalPaidAmount = detailsRef.current.reduce((acc, curr) => acc + curr.paidAmount, 0);
  const totalUnpaidIncome = detailsRef.current.reduce((acc, curr) => acc + curr.unpaidIncome, 0);
  const totalPaidIncome = detailsRef.current.reduce((acc, curr) => acc + curr.paidIncome, 0);

  // 計算利潤
  const unpaidProfit = totalUnpaidIncome - totalUnpaidAmount;
  const paidProfit = totalPaidIncome - totalPaidAmount;
  const totalProfit = unpaidProfit + paidProfit;

  return (<>
    {loading && <BackdropLoading />}
    <div className="profit-sheet-container">
      <ProfitSheetHeader {...project} />
      <table className="profit-sheet-table">
        <thead>
          <tr>
            <th style={{ textAlign: 'left', width: 100 }}>日期</th>
            <th style={{ textAlign: 'left', width: 350 }}>內容</th>
            <th style={{ textAlign: 'right', width: 120 }}>未入帳支出</th>
            <th style={{ textAlign: 'right', width: 120 }}>已入帳支出</th>
            <th style={{ textAlign: 'right', width: 120 }}>未入帳收入</th>
            <th style={{ textAlign: 'right', width: 120 }}>已入帳收入</th>
          </tr>
        </thead>
        <tbody>
          {detailsRef.current.map((e, i) => (
            <tr key={"detailsRef_" + i}>
              <td>{e.date}</td>
              <td>{e.content}</td>
              <td style={{ textAlign: 'right' }}>{toMoney(e.unpaidAmount)}</td>
              <td style={{ textAlign: 'right' }}>{toMoney(e.paidAmount)}</td>
              <td style={{ textAlign: 'right' }}>{toMoney(e.unpaidIncome)}</td>
              <td style={{ textAlign: 'right' }}>{toMoney(e.paidIncome)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>          <tr>
          <td colSpan="2" style={{ textAlign: 'right' }}>總和:</td>
          <td style={{ textAlign: 'right' }}>{toMoney(totalUnpaidAmount)}</td>
          <td style={{ textAlign: 'right' }}>{toMoney(totalPaidAmount)}</td>
          <td style={{ textAlign: 'right' }}>{toMoney(totalUnpaidIncome)}</td>
          <td style={{ textAlign: 'right' }}>{toMoney(totalPaidIncome)}</td>
        </tr>
          <tr>
            <td colSpan="5" style={{ textAlign: 'right' }}>未入帳利潤:</td>
            <td colSpan="1" style={{ textAlign: 'right' }}>{toMoney(unpaidProfit)}</td>
          </tr>
          <tr>
            <td colSpan="5" style={{ textAlign: 'right' }}>已入帳利潤:</td>
            <td colSpan="1" style={{ textAlign: 'right' }}>{toMoney(paidProfit)}</td>
          </tr>
          <tr>
            <td colSpan="5" style={{ textAlign: 'right' }}>總利潤:</td>
            <td colSpan="1" style={{ textAlign: 'right' }}>{toMoney(totalProfit)}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  </>)
}