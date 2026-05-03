import gql from 'graphql-tag';
import { appSetting, bookKeepingAccountFragment, bookKeepingAccountTypeFragment, bookKeepingCompanyFragment, measurementFragment, pageInfo, permission, userError } from './fragments';
import { baseClient, baseClientContactFragment, baseProjectSpotlightFragment, baseProjectStatusFragment, baseProjectTypeFragment, baseQuotationStatusFragment, basehashtagFragment, role } from './baseFragment';

export const OPTIONS_QUERY = gql`
query options {
  projectStatuss (show: true){
    edges {
      node {
        ...projectStatus
      }
    }
  }

  quotationStatuses (show: true) {
    edges {
      node {
        ...quotationStatus
      }
    }
  }

  projectSpotlight (
    show: true
    deleted: false
  ) {
    edges {
      node {
        ...projectSpotlight
      }
    }
  }

  projectTypes (
    show: true
    deleted: false
  ) {
    edges {
      node {
        ...projectType
      }
    }
  }

  clients (deleted: false) {
    edges {
      node {
        ...client
        contacts { 
          ...clientContact
        }
      }
    }
  }

  clientContacts {
    edges {
      node {
        ...clientContact
      }
    }
  }

  projectHashtag (
    deleted: false
    show: true){
    edges {
      node {
        ...hashtag
      }
    }
  }

  measurements (
    show: true){
    edges {
      node {
        ...measurement
      }
    }
  }

  bookKeepingCompanies {
    edges {
      node {
        ...bookKeepingCompany
      }
    }
  }

  bookKeepingAccounts (
    deleted: false
  ) {
    edges {
        node {
          ...bookKeepingAccount
        }
      }
  }

  bookKeepingAccountTypes {
    edges {
        node {
          ...bookKeepingAccountType
        }
      }
  }

}
${baseProjectStatusFragment}
${baseQuotationStatusFragment}
${baseProjectSpotlightFragment}
${baseProjectTypeFragment}
${baseClient}
${baseClientContactFragment}
${basehashtagFragment}
${measurementFragment}
${bookKeepingCompanyFragment}
${bookKeepingAccountFragment}
${bookKeepingAccountTypeFragment}
`

export const GET_SHARE_LINK = gql`
query ganttShares($projectId:String!) {
  ganttShares(projectId:$projectId){
    edges{
      node{
        expiredTime
        code
        remark
      }
    }
  }
}
`;

export const GET_CALENDARS = gql`
query ganttCalendars {
  ganttCalendars {
    edges{
      node{
        id
        name
      }
    }
  }
}
`;

export const GET_COLMUN_CONFIG = gql`
query ganttColumn{
  ganttColumnConfig{
    ganttColumnConfig{
      config
    }
  }
}
`;

export const GET_APP_SETTINGS = gql`
query appSettings($query: String, $skip: Int, $first: Int) {
  appSettings(query: $query, skip: $skip, first: $first) {
    edges {
      node {
        ...appSetting
      }
      cursor
    }
    pageInfo {
      ...pageInfo
    }
    totalCount
  }
}
${appSetting}
${pageInfo}
`;

export const GET_PERMISSION = gql`
query permissions{
  permissions{
    ...permission
  }
}
${permission}
`;

export const GET_ROLES = gql`
query roles {
  roles{
    ...role
    explicitPermissions{
      name
      resource
      actions
    }
  }
}
${role}
`;

export const GET_RESOURCE = gql`
query resources {
  resources 
}
`;

export const usersQuery = gql`
query users (
  $skip: Int
  $before: String
  $after: String
  $first: Int
  $last: Int
  $id: ID
  $username: String
  $name: String
  $date: String
  $sortBy: String
  $keyword: String
) {
  users (
    skip: $skip
    before: $before
    after: $after
    first: $first
    last: $last
    id: $id
    username: $username
    name: $name
    date: $date
    sortBy: $sortBy
    keyword: $keyword
  ) {
    edges {
      node {
       ...user
      }
    }
    pageInfo {
      ...pageInfo
    }
    totalCount
  }
}
${pageInfo}
`

export const projectStatussQuery = gql`
query projectStatuss (
    $skip: Int
    $before: String
    $after: String
    $first: Int
    $last: Int
    $id: String
    $code: String
    $nameCht: String
    $nameEn: String
    $show: Boolean
) {
  projectStatuss (
    skip: $skip
    before: $before
    after: $after
    first: $first
    last: $last
    id: $id
    code: $code
    nameCht: $nameCht
    nameEn: $nameEn
    show: $show
  ) {
    edges {
      node {
        ...projectStatus
        style
        sort
        show
        createAt
        editAt
      }
    }
    pageInfo {
      ...pageInfo
    }
    totalCount
  }
}
${baseProjectStatusFragment}
${pageInfo}
`

export const quotationStatusesQuery = gql`
query quotationStatuses (
    $skip: Int
    $before: String
    $after: String
    $first: Int
    $last: Int
    $id: String
    $code: String
    $nameCht: String
    $nameEn: String
    $show: Boolean
) {
  quotationStatuses (
    skip: $skip
    before: $before
    after: $after
    first: $first
    last: $last
    id: $id
    code: $code
    nameCht: $nameCht
    nameEn: $nameEn
    show: $show
  ) {
    edges {
      node {
        ...quotationStatus
      }
    }
    pageInfo {
      ...pageInfo
    }
    totalCount
  }
}
${baseQuotationStatusFragment}
${pageInfo}
`

export const projectsQuery = gql`
query projects (
    $skip: Int
    $before: String
    $after: String
    $first: Int
    $last: Int
    $id: String
    $projectId: Int
    $clientId: ID
    $status: ID
    $statusArray: [ID!]
    $startDate: LocalDate
    $endDate: LocalDate
    $keyword: String
    $sort: String
    $order: String
) {
  projects (
    skip: $skip
    before: $before
    after: $after
    first: $first
    last: $last
    id: $id
    projectId: $projectId
    clientId: $clientId
    status: $status
    statusArray: $statusArray
    startDate: $startDate
    endDate: $endDate
    keyword: $keyword
    sort: $sort
    order: $order
  ) {
    edges {
      node {
        ...project
      }
    }
    pageInfo {
      ...pageInfo
    }
    totalCount
  }
}
${pageInfo}
`

export const quotationsQuery = gql`
query quotations (
    $skip: Int
    $before: String
    $after: String
    $first: Int
    $last: Int
    $id: String
    $code: String
    $projectId: String
    $clientId: ID
    $status: Boolean
    $currency: String
    $totalAmountFrom: Float
    $totalAmountTo: Float
    $dateFrom: Date
    $dateTo: Date
    $createDateFrom: Date
    $createDateTo: Date
    $editDateFrom: Date
    $editDateTo: Date
    $deleted: Boolean
    $progressArray: [ID!]
    $clientIds: [ID!]
    $keyword: String
) {
  quotations (
    skip: $skip
    before: $before
    after: $after
    first: $first
    last: $last
    id: $id
    code: $code
    projectId: $projectId
    clientId: $clientId
    status: $status
    currency: $currency
    totalAmountFrom: $totalAmountFrom
    totalAmountTo: $totalAmountTo
    dateFrom: $dateFrom
    dateTo: $dateTo
    createDateFrom: $createDateFrom
    createDateTo: $createDateTo
    editDateFrom: $editDateFrom
    editDateTo: $editDateTo
    deleted: $deleted
    progressArray: $progressArray
    clientIds: $clientIds
    keyword: $keyword
  ) {
    edges {
      node {
        ...quotation
      }
    }
    pageInfo {
      ...pageInfo
    }
    totalCount
  }
}
${pageInfo}
`

export const projectOrdersQuery = gql`
query projectOrders (
   $skip: Int
   $before: String
   $after: String
   $first: Int
   $last: Int
   $id: String
   $projectId: Int
   $supplier: String
   $desc: String
   $cheque: String
   $amountFrom: Float
   $amountTo: Float
   $orderDateFrom: Date
   $orderDateTo: Date
   $deliveryDateFrom: Date
   $deliveryDateTo: Date
   $payment: Boolean
   $delivery: Boolean
   $keyword: String
) {
  projectOrders (
    skip: $skip
    before: $before
    after: $after
    first: $first
    last: $last
    id: $id
    projectId: $projectId
    supplier: $supplier
    desc: $desc
    cheque: $cheque
    amountFrom: $amountFrom
    amountTo: $amountTo
    orderDateFrom: $orderDateFrom
    orderDateTo: $orderDateTo
    deliveryDateFrom: $deliveryDateFrom
    deliveryDateTo: $deliveryDateTo
    payment: $payment
    delivery: $delivery
    keyword: $keyword
  ) {
    edges {
      node {
        ...projectOrder
      }
    }
    pageInfo {
      ...pageInfo
    }
    totalCount
  }
}
${pageInfo}
`

export const contactsQuery = gql`
query contacts (
    $skip: Int
    $before: String
    $after: String
    $first: Int
    $last: Int
    $id: ID
    $contactName: String
    $tel: String
    $sortBy: String
) {
  contacts (
    skip: $skip
    before: $before
    after: $after
    first: $first
    last: $last
    id: $id
    contactName: $contactName
    tel: $tel
    sortBy: $sortBy
  ) {
    edges {
      node {
        ...contact
      }
    }
    pageInfo {
      ...pageInfo
    }
    totalCount
  }
}
${pageInfo}
`

export const PROJECT_SPOTLIGHT = gql`
query projectSpotlight (
  $skip: Int
  $before: String
  $after: String
  $first: Int
  $last: Int
  $id: String
  $nameCht: String
  $nameEn: String
  $hex: String
  $preset: Boolean
  $show: Boolean
  $deleted: Boolean
) {
  projectSpotlight (
    skip: $skip
    before: $before
    after: $after
    first: $first
    last: $last
    id: $id
    nameCht: $nameCht
    nameEn: $nameEn
    hex: $hex
    preset: $preset
    show: $show
    deleted: $deleted
  ) {
    edges {
      node {
        ...baseProjectSpotlight
      }
    }
    pageInfo {
      ...pageInfo
    }
    totalCount
  }
}
${baseProjectSpotlightFragment}
${pageInfo}
`

export const CLIENTS_QUERY = gql`
query clients (
  $skip: Int
  $before: String
  $after: String
  $first: Int
  $last: Int
  $companyEn: String
  $companyCht: String
  $email: String
  $tel: String
  $whatsapp: String
  $wechat: String
  $id: String
  $deleted: Boolean
) {
  clients (
    skip: $skip
    before: $before
    after: $after
    first: $first
    last: $last
    companyEn: $companyEn
    companyCht: $companyCht
    email: $email
    tel: $tel
    whatsapp: $whatsapp
    wechat: $wechat
    id: $id
    deleted: $deleted
  ) {
    edges {
      node {
        ...client
      }
    }
    pageInfo {
      ...pageInfo
    }
    totalCount
  }
}
${pageInfo}
`

export const CLIENT_CONTACTS_QUERY = gql`
query clientContacts (
  $skip: Int
  $before: String
  $after: String
  $first: Int
  $last: Int
  $uuid: String
  $nameEn: String
  $nameCht: String
  $email: String
  $tel: String
  $whatsapp: String
  $wechat: String
  $deleted: Boolean
) {
  clientContacts (
    skip: $skip
    before: $before
    after: $after
    first: $first
    last: $last
    uuid: $uuid
    nameEn: $nameEn
    nameCht: $nameCht
    email: $email
    tel: $tel
    whatsapp: $whatsapp
    wechat: $wechat
    deleted: $deleted
  ) {
    edges {
      node {
        ...clientContact
      }
    }
    pageInfo {
      ...pageInfo
    }
    totalCount
  }
}
${pageInfo}
`

export const PORJECT_TYPES_QUERY = gql`
query projectTypes (
  $skip: Int
  $before: String
  $after: String
  $first: Int
  $last: Int
  $id: String
  $code: String
  $nameCht: String
  $nameEn: String
  $show: Boolean
  $deleted: Boolean
) {
  projectTypes (
    skip: $skip
    before: $before
    after: $after
    first: $first
    last: $last
    id: $id
    code: $code
    nameCht: $nameCht
    nameEn: $nameEn
    show: $show
    deleted: $deleted
  ) {
    edges {
      node {
        ...projectType
      }
    }
    pageInfo {
      ...pageInfo
    }
    totalCount
  }
}
${pageInfo}
`

export const PORJECT_ORDERS_QUERY = gql`
query projectOrders (
  $skip: Int
  $before: String
  $after: String
  $first: Int
  $last: Int
  $id: String
  $projectId: Int
  $supplier: String
  $desc: String
  $cheque: String
  $amountFrom: Float
  $amountTo: Float
  $orderDateFrom: Date
  $orderDateTo: Date
  $deliveryDateFrom: Date
  $deliveryDateTo: Date
  $payment: Boolean
  $delivery: Boolean
  $deleted: Boolean
  $keyword: String
  $sort: String
  $order: String
) {
  projectOrders (
    skip: $skip
    before: $before
    after: $after
    first: $first
    last: $last
    id: $id
    projectId: $projectId
    supplier: $supplier
    desc: $desc
    cheque: $cheque
    amountFrom: $amountFrom
    amountTo: $amountTo
    orderDateFrom: $orderDateFrom
    orderDateTo: $orderDateTo
    deliveryDateFrom: $deliveryDateFrom
    deliveryDateTo: $deliveryDateTo
    payment: $payment
    delivery: $delivery
    deleted: $deleted
    keyword: $keyword
    sort: $sort
    order: $order
  ) {
    edges {
      node {
        ...projectOrder
      }
    }
    pageInfo {
      ...pageInfo
    }
    totalCount
  }
}
${pageInfo}
`

export const PORJECT_HASHTAGS_QUERY = gql`
query projectHashtag (
  $skip: Int
  $before: String
  $after: String
  $first: Int
  $last: Int
  $id: String
  $nameCht: String
  $nameEn: String
  $preset: Boolean
  $show: Boolean
  $deleted: Boolean
) {
  projectHashtag (
    skip: $skip
    before: $before
    after: $after
    first: $first
    last: $last
    id: $id
    nameCht: $nameCht
    nameEn: $nameEn
    preset: $preset
    show: $show
    deleted: $deleted
  ) {
    edges {
      node {
        ...hashtag
      }
    }
    pageInfo {
      ...pageInfo
    }
    totalCount
  }
}
${pageInfo}
`

export const QUOTATION_TEMPLATES_QUERY = gql`
query quotationTemplates (
  $skip: Int
  $before: String
  $after: String
  $first: Int
  $last: Int
  $id: String
  $code: String
  $name: String
  $show: Boolean
  $delete: Boolean
  $keyword: String
) {
  quotationTemplates (
    skip: $skip
    before: $before
    after: $after
    first: $first
    last: $last
    id: $id
    code: $code
    name: $name
    show: $show
    delete: $delete
    keyword: $keyword
  ) {
    edges {
      node {
        ...quotationTemplate
      }
    }
    pageInfo {
      ...pageInfo
    }
    totalCount
  }
}
${pageInfo}
`

export const MEASURE_TYPES_QUERY = gql`
query measureTypes (
  $skip: Int
  $before: String
  $after: String
  $first: Int
  $last: Int
  $id: String
  $nameCht: String
  $nameEn: String
  $show: Boolean
  $deleted: Boolean
) {
  measureTypes (
    skip: $skip
    before: $before
    after: $after
    first: $first
    last: $last
    id: $id
    nameCht: $nameCht
    nameEn: $nameEn
    show: $show
    deleted: $deleted
  ) {
    edges {
      node {
        ...measureType
      }
    }
    pageInfo {
      ...pageInfo
    }
    totalCount
  }
}
${pageInfo}
`

export const MEASUREMENT_QUERY = gql`
query measurements (
  $skip: Int
  $before: String
  $after: String
  $first: Int
  $last: Int
  $id: String
  $typeId: String
  $nameCht: String
  $nameEn: String
  $descCht: String
  $descEn: String
  $show: Boolean
  $deleted: Boolean
) {
  measurements (
    skip: $skip
    before: $before
    after: $after
    first: $first
    last: $last
    id: $id
    typeId: $typeId
    nameCht: $nameCht
    nameEn: $nameEn
    descCht: $descCht
    descEn: $descEn
    show: $show
    deleted: $deleted
  ) {
    edges {
      node {
        ...measurement
      }
    }
    pageInfo {
      ...pageInfo
    }
    totalCount
  }
}
${pageInfo}
`

export const PROJECT_ITEMS_QUERY = gql`
query projectItems (
  $skip: Int
  $before: String
  $after: String
  $first: Int
  $last: Int
  $id: String
  $nameEn: String
  $nameCht: String
  $upper: Int
  $show: Boolean
  $delete: Boolean
) {
  projectItems (
    skip: $skip
    before: $before
    after: $after
    first: $first
    last: $last
    id: $id
    nameEn: $nameEn
    nameCht: $nameCht
    upper: $upper
    show: $show
    delete: $delete
  ) {
    edges {
      node {
        ...projectItem
      }
    }
    pageInfo {
      ...pageInfo
    }
    totalCount
  }
}
${pageInfo}
`

export const TERMSES_QUERY = gql`
query termses (
  $skip: Int
  $before: String
  $after: String
  $first: Int
  $last: Int
  $id: String
  $nameCht: String
  $nameEn: String
  $descCht: String
  $descEn: String
  $show: Boolean
  $deleted: Boolean
) {
  termses (
    skip: $skip
    before: $before
    after: $after
    first: $first
    last: $last
    id: $id
    nameCht: $nameCht
    nameEn: $nameEn
    descCht: $descCht
    descEn: $descEn
    show: $show
    deleted: $deleted
  ) {
    edges {
      node {
        ...terms
      }
    }
    pageInfo {
      ...pageInfo
    }
    totalCount
  }
}
${pageInfo}
`

export const PROJECT_INVOICES_QUERY = gql`
query projectInvoices (
  $skip: Int
  $before: String
  $after: String
  $first: Int
  $last: Int
  $id: String
  $invId: String
  $projectId: String
  $project: String
  $worksOrder: String
  $dateFrom: Date
  $dateTo: Date
  $yearFrom: Int
  $yearTo: Int
  $accYearFrom: Int
  $accYearTo: Int
  $status: Boolean
  $deleted: Boolean
  $paidStart: String
  $paidEnd: String
  $settlement: Boolean
) {
  projectInvoices (
    skip: $skip
    before: $before
    after: $after
    first: $first
    last: $last
    id: $id
    invId: $invId
    projectId: $projectId
    project: $project
    worksOrder: $worksOrder
    dateFrom: $dateFrom
    dateTo: $dateTo
    yearFrom: $yearFrom
    yearTo: $yearTo
    accYearFrom: $accYearFrom
    accYearTo: $accYearTo
    status: $status
    deleted: $deleted
    paidStart: $paidStart
    paidEnd: $paidEnd
    settlement: $settlement
  ) {
    edges {
      node {
        ...projectInvoice
      }
    }
    pageInfo {
      ...pageInfo
    }
    totalCount
  }
}
${pageInfo}
`

export const CLOCK_INS_QUERY = gql`
query clockIns (
  $id: String
  $projectId: String
  $tel: String
  $isEffective: Boolean
  $isDuplicated: Boolean
  $startDate: Date
  $endDate: Date
  $first: Int
  $skip: Int
  $order: String
  $sort: String
) {
  clockIns (
    id: $id
    projectId :$projectId
    tel:$tel,
    isEffective:$isEffective,
    isDuplicated:$isDuplicated,
    startDate:$startDate,
    endDate:$endDate,
    first:$first,
    skip:$skip,
    order:$order,
    sort:$sort
  ) {
    edges {
        node {
          ...clockIn
        }
      }
      pageInfo {
        ...pageInfo
      }
      totalCount
  }
}
${pageInfo}
`

export const BOOK_KEEPING_ACCOUNT_QUERY = gql`
query bookKeepingAccounts (
  $skip: Int
  $before: String
  $after: String
  $first: Int
  $last: Int
  $id: ID
  $companyId: ID
  $accountTypeId: ID
  $parentAccountId: ID
  $name: String
  $currencyId: ID
  $isPlaceholder: Boolean
  $isClaim: Boolean
  $deleted: Boolean
) {
  bookKeepingAccounts (
    skip: $skip
    before: $before
    after: $after
    first: $first
    last: $last
    id: $id
    companyId: $companyId
    accountTypeId: $accountTypeId
    parentAccountId: $parentAccountId
    name: $name
    currencyId: $currencyId
    isPlaceholder: $isPlaceholder
    isClaim: $isClaim
    deleted: $deleted
  ) {
    edges {
        node {
          ...bookKeepingAccount
        }
      }
    pageInfo {
      ...pageInfo
    }
    totalCount
  }
}
${pageInfo}
`

export const CLOCK_IN_LOCATION_QUERY = gql `query clockInLocations($id:String, $projectId:String, $staffId:String, $nonce:String) {
  clockInLocations (id:$id, projectId:$projectId, staffId:$staffId, nonce:$nonce){
    edges{
      node{
        createdAt
        id
        user {
         id
        }
        Project {
         id
         code
        }
        lon
        lat
        address
      }
    }
  }
}
`

export const CLAIM_FORM_QUERY = gql`
query claimForms (
  $skip: Int
  $before: String
  $after: String
  $first: Int
  $last: Int
  $id: ID
  $staffId: ID
  $vendor: String
  $purchasedDate: LocalDate
  $chequeNo: String
  $categoryAccountId: ID
  $bankAccountId: ID
  $settlement: Boolean
  $deleted: Boolean
) {
  claimForms (
    skip: $skip
    before: $before
    after: $after
    first: $first
    last: $last
    id: $id
    staffId: $staffId
    vendor: $vendor
    purchasedDate: $purchasedDate
    chequeNo: $chequeNo
    categoryAccountId: $categoryAccountId
    bankAccountId: $bankAccountId
    settlement: $settlement
    deleted: $deleted
  ) {
    edges {
        node {
          ...claimForm
        }
      }
    pageInfo {
      ...pageInfo
    }
    totalCount
  }
}
${pageInfo}
`

export const CHEQUE_BOOKS_QUERY = gql`
query chequeBooks (
  $skip: Int
  $before: String
  $after: String
  $first: Int
  $last: Int
  $id: String
  $chequeNo: String
  $receiver: String
  $projectId: String
  $isCredit: Boolean
  $confirmTransfer: Boolean
  $amountFrom: Float
  $amountTo: Float
  $dateFrom: Date
  $dateTo: Date
  $yearFrom: Float
  $yearTo: Float
  $accYearFrom: Int
  $accYearTo: Int
  $cancel: Boolean
  $deleted: Boolean
  $staffId: String
) {
  chequeBooks (
    skip: $skip
    before: $before
    after: $after
    first: $first
    last: $last
    id: $id
    chequeNo: $chequeNo
    receiver: $receiver
    projectId: $projectId
    isCredit: $isCredit
    confirmTransfer: $confirmTransfer
    amountFrom: $amountFrom
    amountTo: $amountTo
    dateFrom: $dateFrom
    dateTo: $dateTo
    yearFrom: $yearFrom
    yearTo: $yearTo
    accYearFrom: $accYearFrom
    accYearTo: $accYearTo
    cancel: $cancel
    deleted: $deleted
    staffId: $staffId
  ) {
    edges {
        node {
          ...chequeBook
        }
      }
    pageInfo {
      ...pageInfo
    }
    totalCount
  }
}
${pageInfo}
`

export const GET_PDFS = gql`
query pdfs($projectId:Int,$name:String,$first:Int,$skip:Int,$sortField:PdfSortField,$sortOrder:SortOrder) {
  pdfs(projectId:$projectId,name:$name,first:$first,skip:$skip,sortField:$sortField,sortOrder:$sortOrder) {
    edges{
      node{
        id
        name
        project{
          code
        }
        remarks
        pdfSources{
          fileUrl
          pdfSourceHistories{
            id
            fileUrl
            compareUrl
            pages
            createdAt
            version
          }
        }
      }
    }
    pageInfo{
      startCursor
      endCursor
      hasNextPage
    }
    totalCount
  }
}
`;

export const GET_PDF_UPLOADS = gql`
query pdfs($id:ID,$projectId:Int,$name:String,$first:Int,$skip:Int,$sortField:PdfSortField,$sortOrder:SortOrder) {
  pdfs(id:$id,projectId:$projectId,name:$name,first:$first,skip:$skip,sortField:$sortField,sortOrder:$sortOrder) {
    edges{
      node{
        id
        name
        project{
          code
        }
        pdfUploads {
          id
          fileUrl
          createdAt
        }
        pdfSources {
          id
          fileUrl
          pdfSourcePages{
            id
            page
            version
            historyVersions{
              id
              fileUrl
              imageUrl
              version
            }
            pdfSourcePageHistories{
              fileUrl
              compareUrl
              createdAt
              lastVersion
            }
          }
        }
      }
    }
    pageInfo{
      startCursor
      endCursor
      hasNextPage
    }
    totalCount
  }
}
`;

export const GET_PDF_SHARES = gql`
query pdfShares($projectId:Int!,$pdfId:ID,$first:Int,$skip:Int,$sortOrder:SortOrder) {
  pdfShares(projectId:$projectId,pdfId:$pdfId,first:$first,skip:$skip,sortOrder:$sortOrder) {
    edges{
      node{
        id
        expiredTime
        code
        remark
      }
    }
    pageInfo{
      startCursor
      endCursor
      hasNextPage
    }
    totalCount
  }
}
`;

export const GET_PDF_SHARES_CHECK_CODE = gql`
query checkPdfShareCode($code:String,$pdfId:String) {
  checkPdfShareCode(code:$code,pdfId:$pdfId) {
    userErrors{
      message
      field
    }
    result
    project
    name
  }
}
`;

export const BOOK_KEEPING_ACCOUNT_TYPES_QUERY = gql`
query bookKeepingAccountTypes (
  $skip: Int
  $before: String
  $after: String
  $first: Int
  $last: Int
  $id: String
  $name: String
  $increaseDebit: Boolean
  $deleted: Boolean
) {
  bookKeepingAccountTypes (
    skip: $skip
    before: $before
    after: $after
    first: $first
    last: $last
    id: $id
    name: $name
    increaseDebit: $increaseDebit
    deleted: $deleted
  ) {
    edges {
      node {
        ...bookKeepingAccountType
      }
    }
    pageInfo {
      ...pageInfo
    }
    totalCount
  }
}
${pageInfo}
`;

export const BOOK_KEEPING_ACCOUNTS_QUERY = gql`
query bookKeepingAccounts (
  $skip: Int
  $before: String
  $after: String
  $first: Int
  $last: Int
  $id: ID
  $companyId: ID
  $accountTypeId: ID
  $parentAccountId: ID
  $name: String
  $currencyId: ID
  $isPlaceholder: Boolean
  $isClaim: Boolean
  $isBank: Boolean
  $deleted: Boolean
) {
  bookKeepingAccounts (
    skip: $skip
    before: $before
    after: $after
    first: $first
    last: $last
    id: $id
    companyId: $companyId
    accountTypeId: $accountTypeId
    parentAccountId: $parentAccountId
    name: $name
    currencyId: $currencyId
    isPlaceholder: $isPlaceholder
    isClaim: $isClaim
    isBank: $isBank
    deleted: $deleted
  ) {
    edges {
      node {
        ...bookKeepingAccount
      }
    }
    pageInfo {
      ...pageInfo
    }
    totalCount
  }
}
${pageInfo}
`;

export const BOOK_KEEPING_TRANSACTIONS_QUERY = gql`
query bookKeepingTransactions (
  $skip: Int
  $before: String
  $after: String
  $first: Int
  $last: Int
  $deleted: Boolean
  $id: ID
  $companyId: ID
  $transactionDateStart: LocalDate
  $transactionDateEnd: LocalDate
  $accountId: ID
  $isDebit: Boolean
  $isOpeningBalance: Boolean
  $sortOrder: SortOrder
) {
  bookKeepingTransactions (
    skip: $skip
    before: $before
    after: $after
    first: $first
    last: $last
    deleted: $deleted
    id: $id
    companyId: $companyId
    transactionDateStart: $transactionDateStart
    transactionDateEnd: $transactionDateEnd
    accountId: $accountId
    isDebit: $isDebit
    isOpeningBalance: $isOpeningBalance
    sortOrder: $sortOrder
  ) {
    edges {
      node {
        ...bookKeepingTransaction
      }
    }
    pageInfo {
      ...pageInfo
    }
    totalCount
  }
}
${pageInfo}
`;

export const projects_task_user_contact_Query = gql`
query projects_task_user_contact_Query ($projectId:String, $taskId:ID, $first:Int){
  projects {
    edges{
      node{
        code
        id
        albumShareToken
      }
    }
  }

  tasks (projectId:$projectId, id:$taskId first:$first){
  	edges{
      node{
        ...task
      }
      __typename
    }
    pageInfo
    {
      hasNextPage
    }
    totalCount
  }

  users {
    edges{
      node{
        ...user
      }
    }
  }

  contacts{
    edges{
      node{
        id
        contactName
        tel
      }
      __typename
    }
    pageInfo
    {
      hasNextPage
    }
    totalCount
  }
}
`;

export const taskQuery = gql`
query tasks ($projectId:String, $id:ID, $userId:String, $first:Int, $skip:Int, $after:String, $before:String, $realProjectId:Int) {
  tasks (projectId:$projectId, id:$id, userId:$userId, first:$first, skip:$skip, after:$after, before:$before, realProjectId:$realProjectId ){
  	edges{
      node{
        ...task
      }
      __typename
    }
    pageInfo
    {
      hasNextPage
    }
    totalCount
  }
}
`;

export const projectQuery = gql`
query project{
  projects{
    edges{
      node{
        code
        id
        albumShareToken
      }
    }
  }
}
`;

export const BOOK_KEEPING_PERIOD_EXPENSES_QUERY = gql`
query bookKeepingPeriodExpenses (
  $skip: Int
  $before: String
  $after: String
  $first: Int
  $last: Int
  $id: ID
  $fromDate: LocalDate
  $toDate: LocalDate
  $period: BookKeepingPeriodExpenseType
  $periodDay: Int
  $amount: Float
  $categoryAccountId: ID
  $personInChargeId: ID
  $chargeAccountId: ID
  $desc: String
  $remark: String
  $deleted: Boolean
  ##$isFindFuture: Boolean
  ##$financialFromDate: LocalDate
) {
  bookKeepingPeriodExpenses (
    skip: $skip
    before: $before
    after: $after
    first: $first
    last: $last
    id: $id
    fromDate: $fromDate
    toDate: $toDate
    period: $period
    periodDay: $periodDay
    amount: $amount
    categoryAccountId: $categoryAccountId
    personInChargeId: $personInChargeId
    chargeAccountId: $chargeAccountId
    desc: $desc
    remark: $remark
    deleted: $deleted
    ##isFindFuture: $isFindFuture
    ##financialFromDate: $financialFromDate
  ) {
    edges {
        node {
          ...bookKeepingPeriodExpense
        }
    }
    pageInfo {
      ...pageInfo
    }
    totalCount
  }
}
${pageInfo}
`

export const TENDER_FORMS_QUERY = gql`
query tenderForms (
  $skip: Int
  $before: String
  $after: String
  $first: Int
  $last: Int
  $id: ID
  $receivedDateStart: Date
  $receivedDateEnd: Date
  $tenderNo: String
  $siteVisitDateStart: Date
  $siteVisitDateEnd: Date
  $deadlineDateStart: Date
  $deadlineDateEnd: Date
  $submitMethod: String
  $personInChargeId: ID
) {
  tenderForms (
    skip: $skip
    before: $before
    after: $after
    first: $first
    last: $last
    id: $id
    receivedDateStart: $receivedDateStart
    receivedDateEnd: $receivedDateEnd
    tenderNo: $tenderNo
    siteVisitDateStart: $siteVisitDateStart
    siteVisitDateEnd: $siteVisitDateEnd
    deadlineDateStart: $deadlineDateStart
    deadlineDateEnd: $deadlineDateEnd
    submitMethod: $submitMethod
    personInChargeId: $personInChargeId
  ) {
    edges {
        node {
          ...tenderForm
        }
    }
    pageInfo {
      ...pageInfo
    }
    totalCount
  }
}
${pageInfo}
`

export const GET_GANTT_TEMPLATES = gql`
query ganttTemplates($skip: Int, $first: Int) {
  ganttTemplates(skip: $skip, first: $first) {
    edges {
      node {
        id
        name
        type
        nodes
        edges
      }
    }
    totalCount
  }
}
`