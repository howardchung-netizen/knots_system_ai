

import { gql } from '@apollo/client';
import { baseBookKeepingTransactionFragment, baseClient, baseClientContactFragment, baseOperationLog, baseProjectOrderFragment, baseProjectStatusFragment, baseProjectTypeFragment, baseUser, basehashtagFragment } from './baseFragment';

// export const fragment = gql``;

export const permission = gql`
fragment permission on Permission{
  name
  resource
  actions
}
`;

export const appSetting = gql`
fragment appSetting on AppSetting{
  id
  key
  public
  description
  value
}
`;

export const pageInfo = gql`
  fragment pageInfo on PageInfo{
    startCursor
    endCursor
    hasNextPage
    hasPreviousPage
    __typename
  }
`;

export const member = gql`
  fragment member on Member{
    startCursor
    endCursor
    hasNextPage
    hasPreviousPage
    __typename
  }
`;

export const operationLog = gql`
fragment operationLog on OperationLog{
  ...baseOperationLog
  user {
    ...user
  }
}
${baseOperationLog}
${baseUser}
`;

export const userFragment = gql`
fragment user on User {
  id
  createdAt
  updatedAt
  username
  color
  nameCht
  nameEn
  nickName
  tel1
  tel2
  whatsApp
  whatsapp2
  wechat
  dailyRemindTime
  email
  status
  googleID
  deleted
  deviceId
  isAllProject
  ##calendar: GanttCalendar!
  explicitRoles {
    name
    permissions {
      name
      resource
      actions
    }
  }
  roles {
    name
    permissions {
      name
      resource
      actions
    }
  }
  pettyCash 
  lastChequeNoForPettyCash
  lastChequeBook {
    id
    chequeNo
    confirmTransfer
    isCredit
    date
    receiver
    amount
    allocate
    projectId
    desc
    remark
    createAt
    createFrom
    editAt
    editFrom
    cancel
    forPettyCash
    company {
      id
    }
    categoryAccount {
      id
    }
    transaction {
      transactionDate
      financialYearStart
      financialYearEnd
    }
  }
}
`;

export const userError = gql`
  fragment userError on UserError {
    message
    field
  }
`;

export const dashboradProjectFragment = gql`
fragment project on Project {
  id
  uuid
  projectId
  year
  case
  valid
  spotlight
  progress
  code
  codeCht
  address
  start
  end
  remark
  pin
  editFrom
  assigness
  status {
    ...projectStatus
  }
  projectType {
    ...projectType
  }
  hashtags {
   ...hashtag
  }
  assigness
  client {
   ...client
  }
  contact {
    ...clientContact
  }
  manager {
    ...user
  }
  assignee {
    ...user
  }
}
${baseProjectStatusFragment}
${baseProjectTypeFragment}
${basehashtagFragment}
${baseUser}
${baseClient}
${baseClientContactFragment}  
`

export const dashboradQuotationFragment = gql`
  fragment quotation on Quotation {
    id
    code
    quoteId
    title
    status
    progress {
      id
      code
      nameCht
    }
    cmsRemark
    remark
    sendFrom
    sendTo
    attn
    email
    address
    date
    companyInfo
    currencyId
    currency
    budget
    budgetMax
    form
    markup
    totalAmount
    discountRatio
    ratioDiscount
    discount
    grandTotal
    term
    inUsed
    workOrderNo
  }
`

export const dashboradProjectOrderFragment = gql`
  fragment projectOrder on ProjectOrder {
    id
    project {
      id
      projectId
      code
    }
    year
    case
    supplierId
    supplier
    amount
    tel
    desc
    descEn
    descCht
    ordered
    orderedDate
    delivery
    deliveryDate
    payment
    cheque
    remark
    cash
  }
`

export const contactsRowFragment = gql`
fragment contact on Contact {
  id
  createdAt
  updatedAt
  contactName
  dailyRemindTime
  tel
}
`

export const projectListFragment = gql`
  fragment project on Project {
    id
    realId
    projectId
    year
    case
    valid
    spotlight
    progress
    code
    codeCht
    address
    start
    end
    remark
    pin
    editFrom
    status {
      ...projectStatus
    }
    projectType {
      ...projectType
    }
    hashtags {
     ...hashtag
    }
    manager {
      ...user
    }
    assigness
    client {
     ...client
    }
    contact {
      ...clientContact
    }
    manager {
      ...user
    }
    assignee {
      ...user
    }
  }
  ${baseProjectStatusFragment}
  ${baseProjectTypeFragment}
  ${basehashtagFragment}
  ${baseUser}
  ${baseClient}
  ${baseClientContactFragment}
`

export const projectDetailFragment = gql`
  fragment project on Project {
    id
    realId
    uuid
    projectId
    year
    case
    valid
    spotlight
    progress
    code
    codeCht
    address
    start
    end
    remark
    pin
    editFrom
    assigness
    status {
      ...projectStatus
    }
    projectType {
      ...projectType
    }
    hashtags {
     ...hashtag
    }
    assigness
    client {
     ...client
    }
    contact {
      ...clientContact
    }
    manager {
      ...user
    }
    assignee {
      ...user
    }
  }
${baseProjectStatusFragment}
${baseProjectTypeFragment}
${basehashtagFragment}
${baseUser}
${baseClient}
${baseClientContactFragment}  
`

export const quotationListFragment = gql`
  fragment quotation on Quotation {
    id
    code
    quoteId
    title
    status
    progress {
      id
      code
      nameCht
    }
    cmsRemark
    remark
    sendFrom
    sendTo
    attn
    email
    address
    date
    companyInfo
    currencyId
    currency
    budget
    budgetMax
    form
    markup
    totalAmount
    discountRatio
    ratioDiscount
    discount
    grandTotal
    term
    inUsed
    workOrderNo
    project {
      projectId
      realId
    }
    client {
      id
    }
    mainContact { 
      id
    }
    client {
      id
    }
    mainContact { 
      id
    }
  }
`

export const quotationFragment = gql`
  fragment quotation on Quotation {
    editAt
    id
    code
    quoteId
    title
    status
    progress {
      id
      code
      nameCht
    }
    cmsRemark
    remark
    sendFrom
    sendTo
    attn
    email
    address
    date
    companyInfo
    currencyId
    currency
    budget
    budgetMax
    form
    markup
    totalAmount
    discountRatio
    ratioDiscount
    discount
    grandTotal
    term
    inUsed
    workOrderNo
    project {
      projectId
      realId
    }
    client { 
      id
      companyCht
      companyEn
      address
      email
      telCode
      tel
      faxCode
      fax
      whatsappCode
      whatsapp
      wechatCode
      wechat
    }
    mainContact {
      id
      uuid
      appellation
      nameCht
      nameEn
      email
      telCode
      tel
      whatsappCode
      whatsapp
      wechatCode
      wechat
    }
    quotationFiles {  
      id
      fileUrl
      fileMimeType
      createdAt
    }
  }
`

export const clientFragment = gql`
fragment client on Client {
  id
  prefix
  companyCht
  companyEn
  address
  email
  telCode
  tel
  faxCode
  fax
  whatsappCode
  whatsapp
  wechatCode
  wechat
  mainContact {
    ...clientContact
  }
  contacts { 
    ...clientContact
  }
}
${baseClientContactFragment}
`;

export const clientProjectListFragment = gql`
  fragment project on Project {
    id
    uuid
    projectId
    year
    case
    valid
    spotlight
    progress
    code
    codeCht
    address
    start
    end
    remark
    pin
    editFrom
    status {
      ...projectStatus
    }
    projectType {
      ...projectType
    }
  }
  ${baseProjectStatusFragment}
  ${baseProjectTypeFragment}
`

export const projectTypeFragment = gql`
fragment projectType on ProjectType {
  id
  nameCht
  nameEn
  code
  descCht
  descEn
  sort
  show
  deleted
}
`;

export const hashtagFragment = gql`
fragment hashtag on ProjectHashtag {
  id
  type
  nameEn
  nameCht
  preset
  show
  sort
  deleted
}
`;

export const quotationTemplateFragment = gql`
fragment quotationTemplate on QuotationTemplate {
  id
  uuid
  code
  name
  form
  inUsed
  remark
  show
  delete
  createAt
  editAt
}
`;

export const measureTypeFragment = gql`
fragment measureType on MeasureType {
  id
  nameCht
  nameEn
  sort
  show
  deleted
  createAt
  editAt
}
`;

export const measurementFragment = gql`
fragment measurement on Measurement {
  id
  realId
  type {
    id
    nameCht
    nameEn
    sort
    show
    deleted
    createAt
    editAt
  }
  nameCht
  nameEn
  descCht
  descEn
  sort
  show
  deleted
  createAt
  editAt
}
`;

export const childProjectItemFragment = gql`
fragment projectItemChild on ProjectItem {
  id
  realId
  nameEn
  nameCht
  descEn
  descCht
  remark
  remarkEn
  remarkCht
  unit
  unitId
  unitEn
  unitCht
  price
  activePrice
  upperName
  upperNameEn
  upperNameCht
  lowerName
  upper
  upperId
  lower
  lowerIds
  level
  sort
  hash
  show
  delete
  createAt
  editAt
  projectItemcol
  prices
  keyword
}
`;

export const projectItemFragment = gql`
fragment projectItem on ProjectItem {
  id
  realId
  nameEn
  nameCht
  descEn
  descCht
  remark
  remarkEn
  remarkCht
  unit
  unitId
  unitEn
  unitCht
  price
  activePrice
  upperName
  upperNameEn
  upperNameCht
  lowerName
  upper
  upperId
  lower
  lowerIds
  level
  sort
  hash
  show
  delete
  createAt
  editAt
  projectItemcol
  prices
  child {
   ...projectItemChild
   child {
    ...projectItemChild
    child {
     ...projectItemChild
     child {
      ...projectItemChild
      child {
        ...projectItemChild
       }
     }
    }
   }
  }
  keyword
}
${childProjectItemFragment}
`;

export const termsFragment = gql`
fragment terms on Terms {
  id
  realId
  nameCht
  nameEn
  descCht
  descEn
  sort
  preset
  show
  deleted
  createAt
  editAt
}
`;

export const projectInvoiceFragment = gql`
fragment projectInvoice on ProjectInvoice {
  editAt
  id
  date
  financialYear
  yearCase
  invId
  status
  sent
  worksOrder
  quotationNo
  remark
  projectId
  project
  invoice
  balance
  paid
  remarks
  submitForm
  signedForm
  clientInfo
  companyInfo
  createAt
  createFrom
  editAt
  editFrom
  totalAmount
  discountRatio
  ratioDiscount
  discount
  grandTotal
  financialYearStart
  financialYearEnd
  settlement
  term
  categoryAccount {
    id
    name
  }
  bankAccount {
    id
    name
  }
  transaction {
    id
    transactionDate
  }
  client { 
    id
    companyCht
    companyEn
    address
    email
    telCode
    tel
    faxCode
    fax
    whatsappCode
    whatsapp
    wechatCode
    wechat
  }
  mainContact {
    id
    uuid
    appellation
    nameCht
    nameEn
    email
    telCode
    tel
    whatsappCode
    whatsapp
    wechatCode
    wechat
  }
}
`;

export const clockInFragment = gql`
fragment clockIn on ClockIn {
  createdAt
  id
  qrCodeCreatedAt
  clockedInAt
  nonce
  isDuplicated
  tel
  salary
  remark
  contact {
    name
    nameEng
    tel
    address
    remark
    clockInContactFiles {
      id
      clockInContactFileUrl
      createdAt
      fileMimeType
    }
  }
  location {
    id
    address
    lat
    lon
    Project {
      code
    }
    user {
      nameCht
      tel1
      tel2
    }
  }
}
`;

export const chequeBookFragmentOnUser = gql`
fragment chequeBook on ChequeBook {
  id
  chequeNo
  confirmTransfer
  isCredit
  date
  receiver
  amount
  allocate
  ##allocates: [ChequeBookAllocate!]!
  projectId
  desc
  remark
  createAt
  createFrom
  editAt
  editFrom
  cancel
  forPettyCash
  forPettyCashStaff {
    username
    nameCht
    nameEn
    id
    status
    pettyCash
  }
  ##categoryAccount: BookKeepingAccount
  chargeAccount {
    id
    name
    accountType {
      id
      name
    }
  }
  ##company: BookKeepingCompany
  transaction {
    id
    transactionDate
    financialYearStart
    financialYearEnd
  }
}  
`

export const bookKeepingAccountFragment = gql`
fragment bookKeepingAccount on BookKeepingAccount {
  id
  createdAt
  updatedAt
  company {
    id
    companyName
  }
  accountType {
    id
    name
    increaseDebit
  }
  parentAccount {
    id
    name
    accountType {
      id
      name
    }
  }
  name
  balance
  isPlaceholder
  isClaim
  isBank
  order
  deleted
}  
`

export const bookKeepingAccountTypeFragment = gql`
fragment bookKeepingAccountType on BookKeepingAccountType {
  id
  createdAt
  updatedAt
  name
  order
  increaseDebit
  deleted
}  
`

export const bookKeepingCompanyFragment = gql`
fragment bookKeepingCompany on BookKeepingCompany {
  id
  createdAt
  updatedAt
  companyName
  deleted
} 
`

export const claimFormFragment = gql`
fragment claimForm on ClaimForm {
  id
  createdAt
  updatedAt
  staff {
    id
    username
    nameCht
    nameEn
    tel2
    color
    pettyCash
  }
  vendor
  purchasedDate
  amount
  chequeNo
  categoryAccount {
    ...bookKeepingAccount
  }
  bankAccount {
    ...bookKeepingAccount
  }
  files {
    id
    fileUrl
    fileMimeType
  }
  project { 
    id
    code
    projectId
  }
  projectOrder { 
    id
    realId
  }
  settlement
  deleted
}
${bookKeepingAccountFragment}
`;

export const bookKeepingTransactionFragment = gql`
fragment bookKeepingTransaction on BookKeepingTransaction {
  id
  createdAt
  updatedAt
  company {
    id
    companyName
  }
  transactionDate
  financialYearStart
  financialYearEnd
  transactionItems {
    id
    createdAt
    updatedAt
    desc
    amount
    isDebit
    isOpeningBalance
    account {
      id
      name
      accountType { 
       id
       name
      } 
    } 
  }
  deleted
  chequeBook {
    id
    chequeNo
  }
  invoice {
    id
    invId
  }
  order {
    ...projectOrder
    bankAccount { 
      id
      name
    }
    categoryAccount {
      id
      name
    }
  }
  claimForm { 
    id
  }  
}
${baseProjectOrderFragment} 
`;

export const userErrorFragment = gql`
fragment userErrors on UserError{
 message
 field
}
`

export const taskEditUserFragment = gql`
fragment user on User{
 id
 username
 nameCht
 nameEn
 email
 createdAt
}
`

export const taskListFragment = gql`
fragment task on Task {
  id
  name
  status
  priority
  dueDate
  description
  spotlight
  createdAt
  createdBy {
    username
    nameCht
  }
  assignedProjects {
    id
  }
}
`

export const myTaskListFragment = gql`
fragment task on Task{
  id
  name
  status
  priority
  dueDate
  description
  spotlight
  createdAt
  createdBy {
    username
    nameCht
  }
  assignedStaff{
    staff{
      id
      username
      nameEn
      nameCht
      tel1
    }
  }
  assignedContact{
    contact{
      id
      contactName
      tel
    }
  }
}
`

export const taskFragment = gql`
fragment task on Task{
  id
  createdBy {
    username
    nameCht
  }
  priority
  createdAt
  updatedAt
  dueDate
  isDailyReminder
  name
  description
  status,
  doneAt,
  isDeleted
  spotlight
  assignedProjects{
    id
    project {
      id
      code
    }
  }
  assignedStaff{
    staff{
      id
      username
      nameEn
      nameCht
      tel1
    }
    isPic
  }
  assignedContact{
    contact{
      id
      contactName
      tel
    }
    isPic
  }
  subTasks {
    id
    name
    status
    spotlight
    dueDate
    priority
    createdBy {
      username
    }
  }
}
`
//  taskLog{
//   user {
//     username
//     nameCht
//   }
//   contact{
//     contactName
//   }
//   action
//   changes
//   createdAt
// }

export const taskUpdateFragment = gql`
fragment taskUpdate on Task{
  id
  assignedStaff{
    staff{
      id
      username
      nameEn
      nameCht
      tel1
    }
  }
  assignedContact{
    contact{
      id
      contactName
    }
  }
}
`

export const taskCreateFragment = gql`
fragment task on Task{
  id
  name
  status
  spotlight
  dueDate
  createdBy {
    username
  }
}
`
export const updateSubTasksCacheFragment = gql`
fragment task on Task{
  subTasks {
    id
    name
    status
    spotlight
    dueDate
    createdBy {
      username
    }
  }
}
`

export const bookKeepingPeriodExpenseFragment = gql`
fragment bookKeepingPeriodExpense on BookKeepingPeriodExpense {
  id
  createdAt
  updatedAt
  company {
    id
    companyName
  }
  fromDate
  toDate
  period
  periodDay
  amount
  categoryAccount {
    id
    name
  }
  personInCharge {
    id
    username
    nameCht
    nameEn
  }
  chargeAccount {
    id
    name
  }
  desc
  remark
  deleted
}
`

export const tenderFormFragment = gql`
fragment tenderForm on TenderForm {
  id
  createdAt
  updatedAt
  receivedDate
  client
  tenderNo
  siteVisitTime
  deadlineTime
  submitMethod
  details
  personInCharge {
    id
    username
    nameCht
    nameEn
  }
  isDeleted
}
`

export const projectOrderFragment = gql`
fragment projectOrder on ProjectOrder {
  id
  realId
  project {
    id
    projectId
    code
  }
  year
  case
  status
  supplierId
  supplier
  amount
  tel
  desc
  descEn
  descCht
  ordered
  orderedDate
  delivery
  deliveryDate
  payment
  cheque
  remark
  cash
  deleted
  createAt
  settlement
  claimForm {
    ...claimForm
  }
  categoryAccount {
    ...bookKeepingAccount
  }
  bankAccount {
    ...bookKeepingAccount
  }
  transaction {
    ...bookKeepingTransaction
  }
  files {
    id
    fileUrl
    fileMimeType
  }
}
${bookKeepingAccountFragment}
${baseBookKeepingTransactionFragment}
${claimFormFragment}
`;