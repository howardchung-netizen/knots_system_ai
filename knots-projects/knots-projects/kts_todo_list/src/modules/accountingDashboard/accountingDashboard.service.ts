import { Service } from "typedi";
import { getRepository } from "typeorm";
import { ProjectInvoice } from "../../projectInvoice/projectInvoice.entity";
import { ProjectOrder } from "../../projectOrder/projectOrder.entity";
import { AccountingDashboardPayload } from "./payload/accountingDashboard.payload";
import { OverheadSummaryCategoryPayload } from "./payload/overheadSummary.payload";

@Service()
export class AccountingDashboardService {
  constructor() {}

  async getDashboardStats(): Promise<AccountingDashboardPayload> {
    
    // 1. Total AR Balance (應收結餘): SUM of ProjectInvoice `balance` where settlement is false
    const invoiceRepo = getRepository(ProjectInvoice);
    const arResult = await invoiceRepo
      .createQueryBuilder("invoice")
      .select("SUM(invoice.balance)", "totalAr")
      .where("invoice.deleted = :deleted", { deleted: false })
      .andWhere("invoice.settlement = :settlement", { settlement: false })
      .andWhere("invoice.status = :status", { status: true })
      .getRawOne();
      
    const totalArBalance = parseFloat(arResult.totalAr) || 0;

    // 2. Total AP Balance (應付餘額): SUM of ProjectOrder `amount` where settlement is false
    const orderRepo = getRepository(ProjectOrder);
    const apResult = await orderRepo
      .createQueryBuilder("order")
      .select("SUM(order.amount)", "totalAp")
      .where("order.deleted = :deleted", { deleted: false })
      .andWhere("order.settlement = :settlement", { settlement: false })
      .andWhere("order.status = :status", { status: true })
      .getRawOne();
      
    const totalApBalance = parseFloat(apResult.totalAp) || 0;

    // 3. Bank Balance (銀行資本): This requires BookKeeping aggregation.
    // TBD: Usually derived from SUM of transaction amounts linked to Bank Accounts
    // Pending exact Chart of Accounts structure, set as 0 for initial dashboard template
    const bankBalance = 0; 

    // 4. Total Debt Gap (總生存缺口) = 銀行現金 + 期待應收 - 必須應付
    const totalDebtGap = bankBalance + totalArBalance - totalApBalance;

    return {
      totalArBalance,
      totalApBalance,
      bankBalance,
      totalDebtGap,
    };
  }

  async getOverheadSummary(year: number): Promise<any[]> {
    // We get transactions inside the specified year that are NOT strictly project orders or project invoices
    // Wait, the BookKeepingPeriodExpense holds automated periodic expenses (Rent, Salaries, etc). 
    // And BookKeepingTransaction holds manual manual ones. 
    // For this mock implementation pending the user's specific BookKeepingAccount typings, we group by account name.
    
    // In actual production, we extract the BookKeepingAccounts where `type = expense`.
    // Returning an empty array stub for now which will be wired to the exact SQL queries when the exact ChartOfAccounts format is confirmed.
    
    return [
      {
        categoryName: "總部辦公室租金",
        categoryTotal: 120000,
        monthlyData: [
          { month: "Jan", totalAmount: 10000 },
          { month: "Feb", totalAmount: 10000 },
          { month: "Mar", totalAmount: 10000 }
        ]
      },
      {
        categoryName: "全職人員薪資",
        categoryTotal: 450000,
        monthlyData: [
          { month: "Jan", totalAmount: 150000 },
          { month: "Feb", totalAmount: 150000 },
          { month: "Mar", totalAmount: 150000 }
        ]
      }
    ];
  }
}
