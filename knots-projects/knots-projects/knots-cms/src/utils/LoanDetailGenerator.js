import moment from "moment";

export const CRMethodMonthlyFlatRate = (totalInterest, amount, term, monthlyRepayment)=>{

  let A = amount;
  let E = term;
  let interest = totalInterest / term;
  let principal = monthlyRepayment - interest;
  let total$ = A * (E + 1) / 2;

  return (totalInterest / (total$ / 12)) * 100
}

export const CRMethodInterestRate = (totalInterest, amount, term, monthlyRepayment)=>{

  let A = amount;
  let E = term;
  let interest = totalInterest / term;
  let principal = monthlyRepayment - interest;
  let total$ = A * (E + 1) / 2;

  return (totalInterest / (total$ / 12)) * 100
}

export function monthlyPayment(amount, term, interestRate) {
    let A = amount;
    let E = term;
    let total$ = A * (E + 1) / 2;
    let totalInterest = (interestRate / 100) * (total$ / 12);
    let monthlyRepayment = (totalInterest + A) / E;
    const monthlyFlatRate = roundNumber(((totalInterest / term) / total$), 3, 'down');
    return { 
      totalAmount: total$,
      totalInterest ,
      monthlyRepayment,
      monthlyFlatRate,
      monthlyInterest: totalInterest / term,
      }
}

export function toFixedNumber(num, decimalPlaces = 0) {
  const factor = Math.pow(10, decimalPlaces);
  return Math.round(num * factor) / factor;
}

export const roundNumber = (num, decimalNumber, upDown) => {
  const rate = Math.pow(10, decimalNumber);
  return upDown === 'up' ? Math.round(num * rate) / rate : Math.floor(num * rate) / rate;
}

export const loanCalulate = (
  requestAmount,
  serviceCharge,
  annualisedPercentageRate,
  totalTerms,
) => {
  const capital = requestAmount - serviceCharge;
  const totalAmount = capital * ((totalTerms + 1) / 2);
  const totalInterest = roundNumber((annualisedPercentageRate / 100) * (totalAmount / 12), 0, 'down');
  const monthlyRepayment = roundNumber((totalInterest + capital) / totalTerms, 0, 'down');
  const monthlyFlatRate = roundNumber(((totalInterest / totalTerms) / capital), 4, 'down');
  const monthlyInterest = totalInterest / totalTerms;
  const monthlyCapital = monthlyRepayment - monthlyInterest;
  // console.log({
  //   totalAmount: totalAmount,
  //   totalInterest: totalInterest,
  //   monthlyRepayment: monthlyRepayment,
  //   monthlyFlatRate: monthlyFlatRate,
  //   monthlyInterest: monthlyInterest,
  //   monthlyCapital: monthlyCapital,
  // })
  return {
    totalAmount: totalAmount,
    totalInterest: totalInterest,
    monthlyRepayment: monthlyRepayment,
    monthlyFlatRate: monthlyFlatRate,
    monthlyInterest: monthlyInterest,
    monthlyCapital: monthlyCapital,
  }
}

export const interestFirstCalulate = (
  requestAmount,
  serviceCharge,
  annualisedPercentageRate,
  totalTerms,
) => {
  const capital = requestAmount - serviceCharge;
  const firstMonthlyRepayment = loanCalulate(requestAmount, serviceCharge, annualisedPercentageRate, totalTerms).monthlyRepayment;
  const apr = calAPR(capital, firstMonthlyRepayment, totalTerms);
  const monthlyInterest = roundNumber(capital * apr, 0, 'up');;
  const totalInterest = monthlyInterest * totalTerms;
  const monthlyFlatRate = roundNumber(((totalInterest / totalTerms) / capital), 4, 'down');
  const totalAmount = capital + monthlyInterest;
  const monthlyRepayment = roundNumber(monthlyInterest, 0, 'down');
  const monthlyCapital = monthlyRepayment - monthlyInterest;
  // console.log({
  //   totalAmount: totalAmount,
  //   totalInterest: totalInterest,
  //   monthlyRepayment: monthlyRepayment,
  //   monthlyFlatRate: monthlyFlatRate,
  //   monthlyInterest: monthlyInterest,
  //   monthlyCapital: monthlyCapital,
  // })
  return {
    totalAmount: totalAmount,
    totalInterest: totalInterest,
    monthlyRepayment: monthlyRepayment,
    monthlyFlatRate: monthlyFlatRate,
    monthlyInterest: monthlyInterest,
    monthlyCapital: monthlyCapital,
  }
}

const calAPR = (balance, mthInstalment, mth) => {
  let apr = 0.0000001;
  let difference = 1;
  let amountToAdd = 1;

  while (difference !== 0) {
    difference = ((apr * balance) / (1 - Math.pow(1 + apr, -mth))) - mthInstalment;
    if (difference <= 0.0000001 && difference >= -0.0000001) {
      break;
    }
    if (difference > 0) {
      amountToAdd = amountToAdd / 2;
      apr = apr - amountToAdd;
    }
    else {
      amountToAdd = amountToAdd * 2;
      apr = apr + amountToAdd;
    }
  }
  return apr;
}

export const Rule78 = (amount, term, interestRate, startDate)=>{
    let P = amount; //principle / initial amount borrowed
    let N = term; //number of payments 
    let M = Math.round(monthlyPayment(amount, term, interestRate).monthlyRepayment); // monthly mortgage payment
    let accumulationInterest = 0;
    let principalBalance = amount;
    let Rule78Length = [ ...Array(N).keys()].map( i => i+1).reduce((a, b)=> a+ b, 0);
    let Rule78Interest = (M * N - P) / Rule78Length;
    let Rule78Term = N;
    let detail = [];
    for(let t=1; t <= N; t++) {
      let i = Rule78Interest * Rule78Term;
      let p = M - i; 
      principalBalance = principalBalance - (p); 
      accumulationInterest = accumulationInterest + i;
      detail.push(
        {
          "id":"term"+t,
          "term": t,
          "dueDate": moment(startDate, 'YYYY-MM-DD').add(t, 'M').format('YYYY-MM-DD'),
          "monthlyRepayment": M,
          "basePrincipal":p,
          "baseInterest": Rule78Interest * Rule78Term,
          "principal": p,
          "interest": Rule78Interest * Rule78Term,
          "accumulationInterest": accumulationInterest,
          "principalBalance": principalBalance,
          "extraInterest": 0,
          "extraCharge": 0,
          "remarks": null,
          "actualPaid": 0,
          "isPaid": true,
          "paidDate": null,
          "isLate": false,
          "lateDays": null,
          "checkByUser": null,
          "paymentReceipt": null
        }
      )
      Rule78Term--
    }
    return detail
}

export const ReduceingBalance = (amount, term, interestRate, startDate, startTerm = 1) => {
  console.log("ReduceingBalance")
  // let { monthlyRepayment, totalInterest } = loanCalulate(amount, 0, interestRate, term);
  // let I = calAPR(amount, monthlyRepayment, term); //monthly interest rate
  // let N = term; //number of payments 
  // let M = monthlyRepayment // monthly mortgage payment
  // let accumulationInterest = 0;
  // let principalBalance = amount;
  // let loanDetails = [];

  // for (let t = 1; t <= N; t++) {
  //   let monthlyInterest = principalBalance * I;
  //   accumulationInterest = accumulationInterest + monthlyInterest;
  //   if(t === N) {
  //     monthlyInterest += (totalInterest-accumulationInterest);
  //     accumulationInterest = totalInterest;
  //   }
  //   let p = M - monthlyInterest;
  //   principalBalance = principalBalance - p;

  //   if(t === N) {
  //     p = p + principalBalance
  //     principalBalance = 0;
  //   }

  //   loanDetails.push(
  //     {
  //       "term": t,
  //       "dueDate": moment(startDate, 'YYYY-MM-DD').add(t, 'M').format('YYYY-MM-DD'),
  //       "monthlyRepayment": M,
  //       "basePrincipal":p,
  //       "baseInterest": monthlyInterest,
  //       "principal":p,
  //       "interest": monthlyInterest,
  //       "accumulationInterest": accumulationInterest,
  //       "principalBalance": principalBalance,
  //       "paidDate": null,
  //       "isPaid": false,
  //     }
  //   )
  // }

  let { monthlyRepayment } = loanCalulate(amount, 0, interestRate, term);
  let totalRepayment = 0;
  let totalInterest = 0;
  let stillOwed = amount;
  const apr = calAPR(amount, monthlyRepayment, term);
  let loanDetails = [];

  for (let i = startTerm; i <= term; i++) {
    const loanDetail = {};
    loanDetail.term = i;
    loanDetail.dueDate = moment(startDate, 'YYYY-MM-DD').add(i, 'M').format('YYYY-MM-DD');
    loanDetail.monthlyRepayment = monthlyRepayment;
    loanDetail.interest = roundNumber(stillOwed * apr, 0, 'up');
    loanDetail.principal = loanDetail.monthlyRepayment - loanDetail.interest;
    loanDetail.accumulationInterest = totalInterest + loanDetail.interest;
    loanDetail.principalBalance = (i === term) ? 0 : stillOwed - loanDetail.principal;
    loanDetail.extraInterest = 0;
    loanDetail.extraCharge = 0;
    loanDetail.remarks = undefined;
    loanDetail.baseInterest = roundNumber(stillOwed * apr, 0, 'up');
    loanDetail.basePrincipal = loanDetail.monthlyRepayment - loanDetail.interest;
    stillOwed = stillOwed - loanDetail.principal;
    totalRepayment = totalRepayment + monthlyRepayment;
    totalInterest = totalInterest + loanDetail.interest;
    loanDetails.push(loanDetail)
  }

  return loanDetails
}

export const InterestFirst = (amount, term, interestRate, startDate, startTerm = 1) => {

  let { monthlyRepayment } = loanCalulate(amount, 0, interestRate, term);
  let totalRepayment = 0;
  let totalInterest = 0;
  let stillOwed = amount;
  const apr = calAPR(amount, monthlyRepayment, term);
  let loanDetails = [];

  for (let i = parseInt(startTerm); i <= term; i++) {
    const loanDetail = {};
    loanDetail.term = i;
    loanDetail.dueDate = moment(startDate, 'YYYY-MM-DD').add(i, 'M').format('YYYY-MM-DD');
    loanDetail.interest = roundNumber(stillOwed * apr, 0, 'up');
    loanDetail.monthlyRepayment = loanDetail.interest;
    loanDetail.principal = 0;
    loanDetail.accumulationInterest = totalInterest + loanDetail.interest;
    loanDetail.principalBalance = (i === term) ? 0 : stillOwed - loanDetail.principal;
    loanDetail.extraInterest = 0;
    loanDetail.extraCharge = 0;
    loanDetail.remarks = undefined;
    loanDetail.baseInterest = roundNumber(stillOwed * apr, 0, 'up');
    loanDetail.basePrincipal = 0;
    totalRepayment = totalRepayment + monthlyRepayment;
    totalInterest = totalInterest + loanDetail.interest;
    if(term == i) {
      loanDetail.principal = stillOwed;
      loanDetail.monthlyRepayment = stillOwed + loanDetail.interest;
    }
    loanDetails.push(loanDetail)
  }
  console.log(loanDetails)
  return loanDetails
}

export const CRMethod = (amount, term, interestRate, startDate) => {

  let {
    monthlyRepayment,
    monthlyInterest
  } = monthlyPayment(amount, term, interestRate)

  let accumulationInterest = 0;
  let principalBalance = amount;
  let detail = [];
  let principal = monthlyRepayment - monthlyInterest;
  for (let t = 1; t <= term; t++) {

    principalBalance = principalBalance - principal;
    accumulationInterest = accumulationInterest + monthlyInterest;
    detail.push(
      {
        "term": t,
        "dueDate": moment(startDate, 'YYYY-MM-DD').add(t, 'M').format('YYYY-MM-DD'),
        "monthlyRepayment": monthlyRepayment,
        "principal": Math.round(principal),
        "interest": monthlyInterest,
        "accumulationInterest": Math.round(accumulationInterest),
        "principalBalance": Math.round(principalBalance)
      }
    )
  }
  return detail
}

export const getInterestRate = (monthlyRepayment, term, balance) =>{
  let total$ = balance*(term+1)/2;
  let totalInterest =  monthlyRepayment* term - balance;
  let interestRate = totalInterest / (total$ / 12) * 100
  return { interestRate , totalInterest, total$}
}

export const calculateInterest = (amount, days, interestRate) => {
  const dailyInterestRate = interestRate / 360;
  const interest = amount * dailyInterestRate * days;
  return Math.floor(interest);
}

export const calculateEarlyRepayment = (missedRepayments, interestRate, earlyRepaymentDate, repaymentCyc = 'month') => {

  let earlyRepaymentAmount = 0;
  let totalInterest = 0;
  let expireInterest = 0;
  let totalPrincipal = 0;
  // Calculate the interest and remaining principal for each missed repayment
  let missedRepaymentsDetail = missedRepayments.map((e, i) => {

      e.daysSinceMissed = Math.max(0, (new Date(earlyRepaymentDate) - new Date(e.startDate)) / (1000 * 60 * 60 * 24));
      if (i == missedRepayments.length -1) {
        e.missedAmount = e.missedAmount - e.actualPaid;

        if(repaymentCyc == 'month') {
          let repaymentCycDaysCount = moment(e.dueDate).diff(moment(e.dueDate).subtract(1, 'M'), 'days')
          let interesPerDay = e.baseInterest / repaymentCycDaysCount;
          let expireDays = moment(e.dueDate).diff(moment(earlyRepaymentDate), 'days')
          e.expireInterest = e.baseInterest - (expireDays * interesPerDay);
        }
        
        totalInterest += e.interest;
        totalPrincipal = totalPrincipal + e.remainingPrincipal;
        e.missedAmountTotal = e.remainingPrincipal + e.expireInterest + e.interest;
      }
      else {
        e.expireInterest = calculateInterest(e.missedAmount, e.daysSinceMissed, interestRate);
        e.missedAmountTotal = e.missedAmount + e.expireInterest;
        totalInterest += e.interest;
        totalPrincipal += e.principal;
      }
      expireInterest += e.expireInterest;
      earlyRepaymentAmount += e.missedAmountTotal;

      return e
  });

  return {earlyRepaymentAmount, missedRepaymentsDetail, totalInterest, expireInterest, totalPrincipal};
}

export const getStartDateByTerm = (term, loanDetail, loanStartDate)=> {
  let startDate = loanStartDate;
  if (!startDate) loanStartDate = moment(loanDetail[0].dueDate, 'YYYY-MM-DD').subtract(1, 'M');
  if (term > 1) startDate = loanDetail.find(e=> e.term == term -1)?.dueDate;
  return startDate
}

export const getEarlyRepaymentInfoFromLoanDetail = (loanDetail, interestRate, loanOriginationDate, earlyRepaymentDate = moment(new Date()).format('YYYY-MM-DD')) => {
  
  let unPaidData = JSON.parse(JSON.stringify(loanDetail.filter(e => e.isPaid == false).sort(function (a, b) {
    return a.term - b.term;
  })))

  let firstUnPaidTerm = unPaidData[0];
  let startDate = getStartDateByTerm(firstUnPaidTerm.term, loanDetail, loanOriginationDate);
  let principalRemaining = firstUnPaidTerm.principal + firstUnPaidTerm.principalBalance;
  let missedRepayments = unPaidData.filter((e, i) => {
    if(e.term == 1 || i == 0) return true
    else {
      let start = e.dueDate;
      let earlyRepaymentDateAddOneMonth = moment(earlyRepaymentDate, 'YYYY-MM-DD').add(1,'M')
      return moment(start, 'YYYY-MM-DD').isSameOrBefore(earlyRepaymentDateAddOneMonth, 'days');
    }
  })

  missedRepayments = missedRepayments.map((e, i) => {
    let comfirmPayList = e.paymentRecords?.filter(x=> !x.onlyPaidOverDueInterest)??[]
    comfirmPayList = comfirmPayList.filter(x=> moment(x.submitedDate, 'YYYY-MM-DD').isSameOrAfter(e.dueDate, 'days'));
    if (comfirmPayList.length > 0) {
      e.startDate = comfirmPayList[comfirmPayList.length -1].submitedDate;
    }
    else if(missedRepayments.length - 1 == i) {
      e.startDate = getStartDateByTerm(e.term, loanDetail, loanOriginationDate);
      e.interest = 0 - (e.baseInterest - e.interest);
    }
    else if(comfirmPayList.length == 0) e.startDate = e.dueDate;
    e.remainingPrincipal = e.principal + e.principalBalance;
    e.missedAmount = e.interest + e.principal;
    return e
  });

  let { earlyRepaymentAmount, missedRepaymentsDetail, totalInterest, expireInterest, totalPrincipal } = calculateEarlyRepayment(missedRepayments, interestRate / 100, earlyRepaymentDate)

  return {
    outstandingBalance: principalRemaining,
    startDate: startDate,
    earlyRepaymentDate: earlyRepaymentDate,
    missedRepaymentsDetail: missedRepaymentsDetail,
    earlyRepaymentAmount: earlyRepaymentAmount,
    totalInterest, 
    expireInterest,
    totalPrincipal
  }
}

export const calculateRepayment = (missedRepayments, interestRate, earlyRepaymentDate) => {

  let earlyRepaymentAmount = 0;
  let totalInterest = 0;
  let expireInterest = 0;
  let totalPrincipal = 0;
  // Calculate the interest and remaining principal for each missed repayment
  let missedRepaymentsDetail = missedRepayments.map((e, i) => {
    
      e.daysSinceMissed = Math.max(0, (new Date(earlyRepaymentDate) - new Date(e.startDate)) / (1000 * 60 * 60 * 24));
      e.expireInterest = calculateInterest(e.missedAmount, e.daysSinceMissed, interestRate);
      e.missedAmountTotal = e.missedAmount + e.expireInterest;
      totalInterest += e.interest;
      totalPrincipal += e.principal;

      expireInterest += e.expireInterest;
      earlyRepaymentAmount += e.missedAmountTotal;

      return e
  });
  return {earlyRepaymentAmount, missedRepaymentsDetail, totalInterest, expireInterest, totalPrincipal};
}

export const getRepaymentInfoFromLoanDetail = (loanDetail, interestRate, loanOriginationDate, earlyRepaymentDate = moment(new Date()).format('YYYY-MM-DD')) => {
  
  let unPaidData = JSON.parse(JSON.stringify(loanDetail.filter(e => e.isPaid == false).sort(function (a, b) {
    return a.term - b.term;
  })))

  let firstUnPaidTerm = unPaidData[0];
  let startDate = getStartDateByTerm(firstUnPaidTerm.term, loanDetail, loanOriginationDate);
  let principalRemaining = firstUnPaidTerm.principal + firstUnPaidTerm.principalBalance;
  let missedRepayments = unPaidData.filter((e, i) => {
    if(e.term == 1 || i == 0) return true
    else {
      let start = e.dueDate;
      let earlyRepaymentDateAddOneMonth = moment(earlyRepaymentDate, 'YYYY-MM-DD').add(1,'M')
      return moment(start, 'YYYY-MM-DD').isSameOrBefore(earlyRepaymentDateAddOneMonth, 'days');
    }
  })

  missedRepayments = missedRepayments.map((e, i) => {
    let comfirmPayList = e.paymentRecords?.filter(x=> !x.onlyPaidOverDueInterest)??[]
    comfirmPayList = comfirmPayList.filter(x=> moment(x.submitedDate, 'YYYY-MM-DD').isSameOrAfter(e.dueDate, 'days'));
    if (comfirmPayList.length > 0) {
      e.startDate = comfirmPayList[comfirmPayList.length -1].submitedDate;
    }
    else if(comfirmPayList.length == 0) e.startDate = e.dueDate;
    
    e.missedAmount = e.interest + e.principal;
    e.remainingPrincipal = e.principal + e.principalBalance;

    return e
  });

  let { earlyRepaymentAmount, missedRepaymentsDetail, totalInterest, expireInterest, totalPrincipal } = calculateRepayment(missedRepayments, interestRate / 100, earlyRepaymentDate)

  return {
    outstandingBalance: principalRemaining,
    startDate: startDate,
    earlyRepaymentDate: earlyRepaymentDate,
    missedRepaymentsDetail: missedRepaymentsDetail,
    earlyRepaymentAmount: earlyRepaymentAmount,
    totalInterest, 
    expireInterest,
    totalPrincipal
  }
}

export function calculateRemainingBalance(principal, interest, overdueInterest, paidAmount) {
  
  if (typeof paidAmount === 'undefined' || paidAmount === null || isNaN(paidAmount)) {
    paidAmount = 0;
  }

  let totalDebtBalance = principal + interest + overdueInterest;
  let paidPrincipal = 0;
  let paidInterest = 0;
  let paidOverdueInterest = 0;
  let paidAmountSummary = paidAmount;
  
  if (paidAmount >= overdueInterest)  paidOverdueInterest = overdueInterest;
  else paidOverdueInterest = paidAmount;
  paidAmount -= paidOverdueInterest;
  totalDebtBalance -=  paidOverdueInterest;

  if (paidAmount >= interest) paidInterest = interest;
  else paidInterest = paidAmount;
  paidAmount -= paidInterest;
  totalDebtBalance -=  paidInterest;
  
  if (paidAmount >= principal) paidPrincipal = principal;
  else paidPrincipal = paidAmount; 
  paidAmount -= paidPrincipal;
  totalDebtBalance -=  paidPrincipal;

  return {
    principal: principal - paidPrincipal,
    interest: interest - paidInterest,
    overdueInterest: overdueInterest - paidOverdueInterest,
    totalDebtBalance: totalDebtBalance,
    paidPrincipal: paidPrincipal,
    paidInterest: paidInterest,
    paidOverdueInterest: paidOverdueInterest,
    paidExtraCharge: Math.max(paidAmountSummary - paidPrincipal - paidOverdueInterest - paidInterest, 0),
    paidAmountSummary: paidAmountSummary,
  }; 
}
