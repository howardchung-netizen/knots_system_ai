import regex from "./regex";
import langeuage from '../localization/language';
import { toMoney } from "../utils";

export const checkMemberInput = (member) => {
    let inputError = {};
    for (let i of ['nameEng', 'hkid', 'gender', 'dateOfBirth', 'tel']) {
      if (member[i] == null || member[i] == "" || member[i] == '') inputError[i] = langeuage.inputError.required;
    }
    if(!regex.IsHKmobile(member.tel)) inputError.tel = '請輸入正確手提電話號碼';
    if(!regex.IsHKID(member.hkid)) inputError.hkid = '請輸入正確身分證格式';
    // if(member.revolvingMaximumTerm < 3 ) inputError.revolvingMaximumTerm = '最少3期';
    // if(member.fpsEmail && !regex.IsEmail(member.fpsEmail)) inputError.fpsEmail = '請輸入正確Email格式';
    // if(member.fpsTel && !regex.IsHKtel(member.fpsTel)) inputError.fpsTel = '請輸入正確電話格式';
    return inputError
}

export const checkMemberTelInput = (member) => {
  let inputError = {};
  for (let i of ['tel']) {
    if (member[i] == null || member[i] == "" || member[i] == '') inputError[i] = langeuage.inputError.required;
  }
  // if(!regex.IsHKmobile(member.tel)) inputError.tel = '請輸入正確手提電話號碼';
  // if(member.fpsTel && !regex.IsHKtel(member.fpsTel)) inputError.fpsTel = '請輸入正確電話格式';

  return inputError
}

export const checkMemberAddresInput = (member) => {
  let inputError = {};
  // for (let i of ['address', 'propertyType', 'propertyNature', 'livingWith', 'maritalStatus', 'livingYears']) {
  //   if (member[i] == null || member[i] == "" || member[i] == '') inputError[i] = langeuage.inputError.required;
  // }

  return inputError
}

export const checkMemberCompanyInput = (member) => {
  let inputError = {};
  // for (let i of ['companyName', 'companyAddress', 'companyTel', 'employmentType', 'yearOfService', 'income', 'incomeMethod']) {
  //   if (member[i] == null || member[i] == "" || member[i] == '') inputError[i] = langeuage.inputError.required;
  // }
  
  return inputError
}

export const checkLoanInput = (loan) => {
  let inputError = {};
  for (let i of ['type', 'requestType', 'totalTerms', 'requestAmount', 'bestTimeContact', 'startDate', 'interestRate', 'interestType', 'serviceCharge']) {
    if (loan[i] == null || loan[i] == "" || loan[i] == '') inputError[i] = langeuage.inputError.required;
  }
  return inputError
}

export const checkLoanApplyInput = (loan) => {
  let inputError = {};
  for (let i of ['type', 'requestType', 'requestTotalTerms', 'requestAmount']) {
    if (loan[i] == null || loan[i] == "" || loan[i] == '' || loan[i] === undefined) inputError[i] = langeuage.inputError.required;
  }
  if(loan.requestTotalTerms && loan.requestTotalTerms > 72) inputError.requestTotalTerms = '最多72期';

  return inputError
}

export const checkLoanApproveInput = (loan) => {
  let inputError = {};
  for (let i of ['totalTerms', 'serviceCharge', 'approvedAmount', 'interestRate', 'monthlyFlatRate', 'startDate', 'interestType', 'loanDetails']) { 
    if ((loan[i] == null || loan[i] == "" || loan[i] == '') && loan[i] !== 0 ) inputError[i] = langeuage.inputError.required;
  }
  if(loan.totalTerms && loan.totalTerms > 72) inputError.totalTerms = '最多72期';
  if(!loan.loanDetails || loan.loanDetails == null || loan.loanDetails == [] || loan.loanDetails.length == 0) {
    inputError.loanDetails = '請先計算還款表再提交!';
    alert('請先計算還款表再提交!')
  }
  if(loan.interestRate && loan.interestRate > 48) inputError.interestRate = langeuage.inputError.interestRateMax
  return inputError
}

export const checkIncreaseLimitApplyInput = (data) => {
  let inputError = {};
  for (let i of ['approvedAmount', 'isProcessing']) {
    if (data[i] == null || data[i] == "" || data[i] == '' || data[i] === undefined) inputError[i] = langeuage.inputError.required;
  }
  if(data.interestRate > 48) inputError.interestRate = "年利率上限為48%"
  if(!data.approvedAmount || data.approvedAmount <= 0 ) inputError.approvedAmount = "請輸入批核金額"
  
  return inputError
}

export const checkUserResetPasswordInput = (data) => {
  let inputError = {};
  for (let i of ['currentPassword', 'newPassword', 'confirmPassword']) {
    if (data[i] == null || data[i] == "" || data[i] == '' || data[i] === undefined) inputError[i] = langeuage.inputError.required;
  }
  if(data.newPassword != data.confirmPassword) {
    inputError.newPassword = "密碼不相同";
    inputError.confirmPassword = "密碼不相同";
  }

  return inputError
}

export const checkConfirmRepaymentInput = (data, overdueInterest) => {
  let inputError = {};
  for (let i of ['newActualPaid', 'paymentMethod']) { 
    if (data[i] == null || data[i] == "" || data[i] == '' || data[i] === undefined) inputError[i] = langeuage.inputError.required;
    if(i == 'newActualPaid' && data[i] > data.principal + data.interest + overdueInterest) inputError[i] = '還款上限為'+toMoney(data.principal + data.interest + overdueInterest);
  }
  
  return inputError
}

export const checkConfirmPatialPrincipalInput = (data, overdueInterest) => {
  let inputError = {};
  for (let i of ['currentActualPaid', 'paymentMethod']) { 
    if (data[i] == null || data[i] == "" || data[i] == '' || data[i] === undefined) inputError[i] = langeuage.inputError.required;
  }
  
  return inputError
}

export const checkCreateRepaymentInput = (data) => {
  let inputError = {};
  for (let i of ['loanDetailId', 'paymentMethod', 'paidAmount']) { 
    if (data[i] == null || data[i] == "" || data[i] == '' || data[i] === undefined) inputError[i] = langeuage.inputError.required;
  }
  if((!data.file || data.file.length == 0) && !data.fileUrl) inputError.file = langeuage.inputError.required
  return inputError
}

export const checkAppsettingsInput = (data) => {
  let inputError = {};
  for (let i of ['key', 'value', 'public', 'description']) {
    if (data[i] === null || data[i] === "" || data[i] === '' || data[i] === undefined) inputError[i] = langeuage.inputError.required;
  }
  
  return inputError
}

export const checkCompnyInfoInput = (data) => {
  let inputError = {};
  for (let i of ['name', 'nameEng', 'address', 'addressEng', 'license', 'aboutUs']) {
    if (data[i] === null || data[i] === "" || data[i] === '' || data[i] === undefined) inputError[i] = langeuage.inputError.required;
  }
  
  return inputError
}

export const checkPromotionsEditInput = (data) => {
  let inputError = {};

  // for (let i of ['file']) {
  //   if (data[i] === null || data[i] === "" || data[i] === '' || data[i] === undefined) inputError[i] = langeuage.inputError.required;
  // }
  if((!data.file || data.file.length == 0) && !data.fileUrl) inputError.file = langeuage.inputError.required
  
  return inputError
}

export const checkFAQEditInput = (data) => {
  let inputError = {};

  for (let i of ['title', 'content', 'order']) {
    if (data[i] === null || data[i] === "" || data[i] === '' || data[i] === undefined) inputError[i] = langeuage.inputError.required;
  }

  return inputError
}

export const checkOccupationEditInput = (data) => {
  let inputError = {};
  for (let i of ['name', 'occupationCategoryId']) {
    if (data[i] === null || data[i] === "" || data[i] === '' || data[i] === undefined) inputError[i] = langeuage.inputError.required;
  }
  return inputError
}

export const checkPermissionEditInput = (data) => {
  let inputError = {};
  for (let i of ['name', 'resource']) {
    if (data[i] === null || data[i] === "" || data[i] === '' || data[i] === undefined) inputError[i] = langeuage.inputError.required;
  }
  if(!data.actions?.length) inputError.actions = langeuage.inputError.required;
  return inputError
}

export const checkRolesEditInput = (data) => {
  let inputError = {};
  for (let i of ['name']) {
    if (data[i] === null || data[i] === "" || data[i] === '' || data[i] === undefined) inputError[i] = langeuage.inputError.required;
  }
  if(!data.permissions?.length) inputError.permissions = langeuage.inputError.required;
  // if(!data.roles?.length) inputError.roles = langeuage.inputError.required;
  return inputError
}

export const checkUserCreateInput = (data) => {
  let inputError = {};
  for (let i of ['name', 'username', 'password']) {
    if (data[i] === null || data[i] === "" || data[i] === '' || data[i] === undefined) inputError[i] = langeuage.inputError.required;
  }
  if(!data.roles?.length) inputError.roles = langeuage.inputError.required;
  return inputError
}

export const checkUserEditInput = (data) => {
  let inputError = {};
  for (let i of ['name', 'username']) {
    if (data[i] === null || data[i] === "" || data[i] === '' || data[i] === undefined) inputError[i] = langeuage.inputError.required;
  }
  if(!data.roles?.length) inputError.roles = langeuage.inputError.required;
  return inputError
}

export const checkEarlyRepaymentApprovedInput = (loan) => {
  let inputError = {};
  for (let i of ['date', 'paymentMethod', 'principal']) {
    if (loan[i] == null || loan[i] == "" || loan[i] == '' || loan[i] === undefined) inputError[i] = langeuage.inputError.required;
  }
  return inputError
}

export const checkEarlyRepaymentSettledInput = (loan) => {
  let inputError = {};
  for (let i of ['date', 'paymentMethod']) {
    if (loan[i] == null || loan[i] == "" || loan[i] == '' || loan[i] === undefined) inputError[i] = langeuage.inputError.required;
  }
  console.log(loan)
  if(isNaN(loan.serviceCharge)) inputError.serviceCharge = langeuage.inputError.required;
  return inputError
}
