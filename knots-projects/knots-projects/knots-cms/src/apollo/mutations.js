import gql from 'graphql-tag';
import { appSetting, bookKeepingAccountFragment, bookKeepingAccountTypeFragment, chequeBookFragmentOnUser, claimFormFragment, clientFragment, hashtagFragment, measurementFragment, permission, projectDetailFragment, projectInvoiceFragment, projectItemFragment, projectOrderFragment, projectTypeFragment, quotationFragment, quotationTemplateFragment, termsFragment, userError, userFragment, bookKeepingTransactionFragment, bookKeepingPeriodExpenseFragment, tenderFormFragment } from './fragments';
import { baseClientContactFragment, role } from './baseFragment';
import { has } from 'underscore';

export const GENERATE_SHARE = gql`
mutation ganttShareGenerate($data:GanttShareGenerateInput!){
  ganttShareGenerate(data:$data){
    userErrors{
      message
      field
    }
    ganttShare{
      expiredTime
      code
      remark
    }
  }
}
`;
export const DISABLE_SHARE = gql`
mutation ganttShareDisable($data:GanttShareDisableInput!){
  ganttShareDisable(data:$data){
    userErrors{
      message
      field
    }
  }
}
`;
export const UPDATE_CALENDAR = gql`
mutation ganttUpdateCalendar($data:GanttUpdateCalendarInput!){
  ganttUpdateCalendar(data:$data){
    userErrors{
      message
      field
    }
  }
}
`;
export const UPDATE_COLUMN_CONFIG = gql`
mutation ganttColumnConfigSave($data: GanttColumnConfigSaveInput!) {
  ganttColumnConfigSave(data: $data) {
    userErrors {
      message
      field
    }
    ganttColumnConfig {
      config
    }
  }
}
`;

export const login = gql`
mutation login($data:LoginInput!){
  login(data:$data){
    token
    user {
      ...user
    }
  }
}
${userFragment}
`

export const internalLogin = gql`
mutation internalLogin($data:LoginInput!){
  login(data:$data){
    token
  }
}
`

export const ROLE_CREATE = gql`
mutation roleCreate($data: RoleInput!){
  roleCreate (data: $data) {
    userErrors{
      ...userError
    }
    role{
      ...role
    }
  }
}
${role}
${userError}
`;

export const ROLE_UPDATE = gql`
mutation roleUpdate($data: RoleInput!){
  roleUpdate (data: $data) {
    userErrors{
      ...userError
    }
    role{
      ...role
    }
  }
}
${role}
${userError}
`;

export const ROLE_DELETE = gql`
mutation roleDelete($data: RoleDeleteInput!){
  roleDelete (data: $data) {
    userErrors{
      ...userError
    }
    deletedRoleName
  }
}
${userError}
`;

export const PERMISSION_CREATE = gql`
mutation permissionCreate($data: PermissionInput!){
  permissionCreate (data: $data) {
    userErrors{
      ...userError
    }
    permission{
      ...permission
    }
  }
}
${permission}
${userError}
`;

export const PERMISSION_UPDATE = gql`
mutation permissionUpdate($data: PermissionInput!){
  permissionUpdate (data: $data) {
    userErrors{
      ...userError
    }
    permission{
      ...permission
    }
  }
}
${permission}
${userError}
`;

export const PERMISSION_DELETE = gql`
mutation permissionDelete($data: PermissionDeleteInput!){
  permissionDelete (data: $data) {
    userErrors{
      ...userError
    }
    deletedPermissionName
  }
}
${userError}
`;

export const APP_SETTING_CREATE = gql`
mutation appSettingCreate($data: AppSettingInput!){
  appSettingCreate (data: $data) {
    userErrors{
      ...userError
    }
    appSetting{
      ...appSetting
    }
  }
}
${appSetting}
${userError}
`;

export const APP_SETTING_UPDATE = gql`
mutation appSettingUpdate($data: AppSettingInput!){
  appSettingUpdate (data: $data) {
    userErrors{
      ...userError
    }
    appSetting{
      ...appSetting
    }
  }
}
${appSetting}
${userError}
`;

export const APP_SETTING_DELETE = gql`
mutation appSettingDelete($data: AppSettingDeleteInput!){
  appSettingDelete (data: $data) {
    userErrors{
      ...userError
    }
    promotion {
      id
    }
  }
}
${userError}
`;

export const updatePassword = gql`
mutation updatePassword($data:UpdatePasswordInput!){
  updatePassword(data:$data) {
    userErrors{
      message
      field
    }
    result
  }
}
`

export const userResetPassword = gql`
mutation userResetPassword($data:ResetPasswordInput!){
  userResetPassword(data:$data)
}
`

export const CLIENT_CREATE = gql`
mutation clientCreate($data: ClientCreateInput!){
  clientCreate (data: $data) {
    userErrors{
      ...userError
    }
    client{
      ...client
    }
  }
}
${userError}
${clientFragment}
`

export const CLIENT_UPDATE = gql`
mutation clientUpdate($data: ClientUpdateInput!){
  clientUpdate (data: $data) {
    userErrors{
      ...userError
    }
    client{
      ...client
    }
  }
}
${userError}
${clientFragment}
`

export const CLIENT_DELETE = gql`
mutation clientDelete($data: ClientDeleteInput!){
  clientDelete (data: $data) {
    userErrors{
      ...userError
    }
    client{
      ...client
    }
  }
}
${userError}
${clientFragment}
`

export const CLIENT_CONTACT_CREATE = gql`
mutation clientContactsCreate($data: ClientContactsCreateInput!){
  clientContactsCreate (data: $data) {
    userErrors{
      ...userError
    }
    clientContacts{
      ...clientContact
    }
  }
}
${userError}
${baseClientContactFragment}
`

export const CLIENT_CONTACT_UPDATE = gql`
mutation clientContactUpdate($data: ClientContactsUpdateInput!){
  clientContactsUpdate (data: $data) {
    userErrors{
      ...userError
    }
    clientContacts{
      ...clientContact
    }
  }
}
${userError}
${baseClientContactFragment}
`

export const CLIENT_CONTACT_DELETE = gql`
mutation clientContactsDelete($data: ClientContactsDeleteInput!){
  clientContactsDelete (data: $data) {
    userErrors{
      ...userError
    }
    clientContacts{
      ...clientContact
    }
  }
}
${userError}
${baseClientContactFragment}
`

export const PROJECT_CREATE = gql`
mutation projectCreate($data: ProjectCreateInput!){
  projectCreate (data: $data) {
    userErrors{
      ...userError
    }
    project{
      ...project
    }
  }
}
${userError}
${projectDetailFragment}
`

export const PROJECT_UPDATE= gql`
mutation projectUpdate($data: ProjectUpdateInput!){
  projectUpdate (data: $data) {
    userErrors{
      ...userError
    }
    project{
      ...project
    }
  }
}
${userError}
${projectDetailFragment}
`

export const PROJECT_ORDER_CREATE = gql`
mutation projectOrderCreate($data: ProjectOrderCreateInput!){
  projectOrderCreate (data: $data) {
    userErrors{
      ...userError
    }
    projectOrder{
      ...projectOrder
    }
  }
}
${userError}
${projectOrderFragment}
`

export const PROJECT_ORDER_UPDATE= gql`
mutation projectOrderUpdate($data: ProjectOrderUpdateInput!){
  projectOrderUpdate (data: $data) {
    userErrors{
      ...userError
    }
    projectOrder{
      ...projectOrder
    }
  }
}
${userError}
${projectOrderFragment}
`

export const PROJECT_TYPE_CREATE = gql`
mutation projectTypeCreate($data: ProjectTypeCreateInput!){
  projectTypeCreate (data: $data) {
    userErrors{
      ...userError
    }
    projectType{
      ...projectType
    }
  }
}
${userError}
${projectTypeFragment}
`

export const PROJECT_TYPE_UPDATE= gql`
mutation projectTypeUpdate($data: ProjectTypeUpdateInput!){
  projectTypeUpdate (data: $data) {
    userErrors{
      ...userError
    }
    projectType{
      ...projectType
    }
  }
}
${userError}
${projectTypeFragment}
`

export const PROJECT_TYPE_SORT = gql`
mutation projectTypeSort($data: ProjectTypeSortInput!){
  projectTypeSort (data: $data) {
    userErrors{
      ...userError
    }
    result
  }
}
${userError}
`

export const PROJECT_HASHTAG_CREATE = gql`
mutation projectHashtagCreate($data: ProjectHashtagCreateInput!){
  projectHashtagCreate (data: $data) {
    userErrors{
      ...userError
    }
    projectHashtag{
      ...hashtag
    }
  }
}
${userError}
${hashtagFragment}
`

export const PROJECT_HASHTAG_UPDATE= gql`
mutation projectHashtagUpdate($data: ProjectHashtagUpdateInput!){
  projectHashtagUpdate (data: $data) {
    userErrors{
      ...userError
    }
    projectHashtag{
      ...hashtag
    }
  }
}
${userError}
${hashtagFragment}
`

export const PROJECT_HASHTAG_SORT= gql`
mutation projectHashtagSort($data: ProjectHashtagSortInput!){
  projectHashtagSort (data: $data) {
    userErrors{
      ...userError
    }
    result
  }
}
${userError}
`

export const QUOTATION_CREATE = gql`
mutation quotationCreate($data: QuotationCreateInput!){
  quotationCreate (data: $data) {
    userErrors{
      ...userError
    }
    quotation{
      ...quotation
    }
  }
}
${userError}
${quotationFragment}
`

export const QUOTATION_CLIENT_UPDATE = gql`
mutation quotationClientUpdate($data: QuotationUpdateInput!){
  quotationClientUpdate (data: $data) {
    userErrors{
      ...userError
    }
    quotation{
      ...quotation
    }
  }
}
${userError}
${quotationFragment}
`
export const QUOTATION_UPDATE = gql`
mutation quotationUpdate($data: QuotationUpdateInput!){
  quotationUpdate (data: $data) {
    userErrors{
      ...userError
    }
    quotation{
      ...quotation
    }
  }
}
${userError}
${quotationFragment}
`

export const QUOTATION_IMPORT_ITEM = gql`
mutation quotationImportItem($data: QuotationImportItemInput!){
  quotationImportItem (data: $data) {
    userErrors{
      ...userError
    }
    quotation{
      ...quotation
    }
  }
}
${userError}
${quotationFragment}
`

export const QUOTATION_UPDATE_ITEM = gql`
mutation quotationUpdateItem($data: QuotationUpdateItemInput!){
  quotationUpdateItem (data: $data) {
    userErrors{
      ...userError
    }
    quotation{
      ...quotation
    }
  }
}
${userError}
${quotationFragment}
`

export const QUOTATION_IMPORT_TERM = gql`
mutation quotationImportTerm($data: QuotationImportTermInput!){
  quotationImportTerm (data: $data) {
    userErrors{
      ...userError
    }
    quotation{
      ...quotation
    }
  }
}
${userError}
${quotationFragment}
`

export const QUOTATION_UPDATE_TERM = gql`
mutation quotationUpdateTerm($data: QuotationUpdateTermInput!){
  quotationUpdateTerm (data: $data) {
    userErrors{
      ...userError
    }
    quotation{
      ...quotation
    }
  }
}
${userError}
${quotationFragment}
`

export const QUOTATION_MARKUP_UPDATE = gql`
mutation quotationMarkupUpdate($data: QuotationMarkupUpdateInput!){
  quotationMarkupUpdate (data: $data) {
    userErrors{
      ...userError
    }
    quotation{
      ...quotation
    }
  }
}
${userError}
${quotationFragment}
`
export const QUOTATION_TEMPLATE_CREATE = gql`
mutation quotationTemplateCreate($data: QuotationTemplateCreateInput!){
  quotationTemplateCreate (data: $data) {
    userErrors{
      ...userError
    }
    quotationTemplate{
      ...quotationTemplate
    }
  }
}
${userError}
${quotationTemplateFragment}
`

export const QUOTATION_TEMPLATE_UPDATE= gql`
mutation quotationTemplateUpdate($data: QuotationTemplateUpdateInput!){
  quotationTemplateUpdate (data: $data) {
    userErrors{
      ...userError
    }
    quotationTemplate{
      ...quotationTemplate
    }
  }
}
${userError}
${quotationTemplateFragment}
`

export const QUOTATION_TEMPLATE_IMPORT_ITEM = gql`
mutation quotationTemplateImportItem($data: QuotationTemplateImportItemInput!){
  quotationTemplateImportItem (data: $data) {
    userErrors{
      ...userError
    }
    quotationTemplate{
      ...quotationTemplate
    }
  }
}
${userError}
${quotationTemplateFragment}
`

export const QUOTATION_TEMPLATE_UPDATE_ITEM = gql`
mutation quotationTemplateUpdateItem($data: QuotationTemplateUpdateItemInput!){
  quotationTemplateUpdateItem (data: $data) {
    userErrors{
      ...userError
    }
    quotationTemplate{
      ...quotationTemplate
    }
  }
}
${userError}
${quotationTemplateFragment}
`

export const MEASUREMENT_CREATE = gql`
mutation measurementCreate($data: MeasurementCreateInput!){
  measurementCreate (data: $data) {
    userErrors{
      ...userError
    }
    measurement{
      ...measurement
    }
  }
}
${userError}
${measurementFragment}
`

export const MEASUREMENT_UPDATE= gql`
mutation measurementUpdate($data: MeasurementUpdateInput!){
  measurementUpdate (data: $data) {
    userErrors{
      ...userError
    }
    measurement{
      ...measurement
    }
  }
}
${userError}
${measurementFragment}
`

export const MEASUREMENT_SORT= gql`
mutation measurementSort($data: MeasurementSortInput!){
  measurementSort (data: $data) {
    userErrors{
      ...userError
    }
    result
  }
}
${userError}
`

export const PROJECT_ITEM_CREATE = gql`
mutation projectItemCreate($data: ProjectItemCreateInput!){
  projectItemCreate (data: $data) {
    userErrors{
      ...userError
    }
    projectItem{
      ...projectItem
    }
  }
}
${userError}
${projectItemFragment}
`

export const PROJECT_ITEM_UPDATE= gql`
mutation projectItemUpdate($data: ProjectItemUpdateInput!){
  projectItemUpdate (data: $data) {
    userErrors{
      ...userError
    }
    projectItem{
      ...projectItem
    }
  }
}
${userError}
${projectItemFragment}
`

export const PROJECT_ITEM_SORT= gql`
mutation projectItemSort($data: ProjectItemSortInput!){
  projectItemSort (data: $data) {
    userErrors{
      ...userError
    }
    result
  }
}
${userError}
`

export const TERMS_CREATE = gql`
mutation termsCreate($data: TermsCreateInput!){
  termsCreate (data: $data) {
    userErrors{
      ...userError
    }
    terms{
      ...terms
    }
  }
}
${userError}
${termsFragment}
`

export const TERMS_UPDATE= gql`
mutation termsUpdate($data: TermsUpdateInput!){
  termsUpdate (data: $data) {
    userErrors{
      ...userError
    }
    terms{
      ...terms
    }
  }
}
${userError}
${termsFragment}
`

export const PROJECT_INVOICES_CREATE = gql`
mutation projectInvoiceCreate($data: ProjectInvoiceCreateInput!){
  projectInvoiceCreate (data: $data) {
    userErrors{
      ...userError
    }
    projectInvoice{
      ...projectInvoice
    }
  }
}
${userError}
${projectInvoiceFragment}
`

export const PROJECT_INVOICES_UPDATE= gql`
mutation invoiceUpdate($data: ProjectInvoiceUpdateInput!){
  invoiceUpdate (data: $data) {
    userErrors{
      ...userError
    }
    projectInvoice{
      ...projectInvoice
    }
  }
}
${userError}
${projectInvoiceFragment}
`

export const CREATE_CLOCKIN_LOCATION = gql`
mutation createClockInLocation($data:ClockInLocationCreate!)  {
  createClockInLocation (data:$data) {
      userErrors{
        message
      }
      clockInLocation {
        id
        nonce
      }
  }
}
`

export const CREATE_CLOCKIN = gql`
mutation createClockIn ($data:ClockInCreateInput!){
  createClockIn (data:$data) {
   userErrors {
   message
   }
   result
  }
 }
`

export const UPDATE_CLOCKIN = gql`
mutation updateClockIn ($data:ClockInUpdateInput!){
  updateClockIn (data:$data) {
   userErrors {
     message
   }
   clockIn {
     id
     remark
   }
  }
}
`

export const USER_CREATE = gql`
mutation userCreate ($data:UserCreateInput!){
  userCreate (data:$data) {
    userErrors{
      ...userError
    }
   user {
     ...user
   }
  }
}
${userError}
${userFragment}
`


export const USER_UPDATE = gql`
mutation userUpdate ($data:UserUpdateInput!){
  userUpdate (data:$data) {
    userErrors{
      ...userError
    }
   user {
     ...user
   }
  }
}
${userError}
${userFragment}
`

export const CHEQUE_BOOK_CREATE = gql`
mutation chequeBookCreate ($data:ChequeBookCreateInput!){
  chequeBookCreate (data:$data) {
    userErrors{
      ...userError
    }
    chequeBook {
     ...chequeBook
   }
  }
}
${userError}
${chequeBookFragmentOnUser}
`

export const CHEQUE_BOOK_UPDATE = gql`
mutation chequeBookUpdate ($data:ChequeBookUpdateInput!){
  chequeBookUpdate (data:$data) {
    userErrors{
      ...userError
    }
    chequeBook {
     ...chequeBook
    }
  }
}
${userError}
${chequeBookFragmentOnUser}
`

export const CHEQUE_BOOK_DELETE = gql`
mutation chequeBookDelete ($data:ChequeBookDeleteInput!){
  chequeBookDelete (data:$data) {
    userErrors{
      ...userError
    }
    result
  }
}
${userError}
`

export const CHEQUE_BOOK_CONFIRM_TRANSFER = gql`
mutation chequeBookConfirmTransfer ($data:ChequeBookConfirmTransferInput!){
  chequeBookConfirmTransfer (data:$data) {
    userErrors{
      ...userError
    }
    chequeBook {
     ...chequeBook
   }
  }
}
${userError}
${chequeBookFragmentOnUser}
`

export const CLAIM_FORM_CREATE = gql`
mutation claimFormCreate ($data:ClaimFormCreateInput!){
  claimFormCreate (data:$data) {
    userErrors{
      ...userError
    }
    claimForm {
     ...claimForm
   }
  }
}
${userError}
${claimFormFragment}
`

export const CLAIM_FORM_UPDATE = gql`
mutation claimFormUpdate ($data:ClaimFormUpdateInput!){
  claimFormUpdate (data:$data) {
    userErrors{
      ...userError
    }
    claimForm {
     ...claimForm
   }
  }
}
${userError}
${claimFormFragment}
`

export const CLAIM_FORM_DELETE = gql`
mutation claimFormDelete ($data:ClaimFormDeleteInput!){
  claimFormDelete (data:$data) {
    userErrors{
      ...userError
    }
    result
  }
}
${userError}
`

export const CLAIM_FORM_SETTLED = gql`
mutation claimFormSettled ($data:ClaimFormSettledInput!){
  claimFormSettled (data:$data) {
    userErrors{
      ...userError
    }
    claimForm {
     ...claimForm
   }
  }
}
${userError}
${claimFormFragment}
`

export const CLAIM_FORM_CONFIRM_TRANSFER = gql`
mutation claimFormConfirmTransfer ($data:ClaimFormConfirmTransferInput!){
  claimFormConfirmTransfer (data:$data) {
    userErrors{
      ...userError
    }
    claimForm {
     ...claimForm
   }
  }
}
${userError}
${claimFormFragment}
`

export const PROJECT_INVOICE_CREATE = gql`
mutation projectInvoiceCreate($data: ProjectInvoiceCreateInput!){
  projectInvoiceCreate (data: $data) {
    userErrors{
      ...userError
    }
    projectInvoice{
      ...projectInvoice
    }
  }
}
${userError}
${projectInvoiceFragment}
`

export const PROJECT_INVOICE_UPDATE = gql`
mutation projectInvoiceUpdate($data: ProjectInvoiceUpdateInput!){
  projectInvoiceUpdate (data: $data) {
    userErrors{
      ...userError
    }
    projectInvoice{
      ...projectInvoice
    }
  }
}
${userError}
${projectInvoiceFragment}
`

export const PROJECT_INVOICE_DELETE = gql`
mutation projectInvoiceDelete($data: ProjectInvoiceDeleteInput!){
  projectInvoiceDelete (data: $data) {
    userErrors{
      ...userError
    }
    projectInvoice{
      ...projectInvoice
    }
  }
}
${userError}
${projectInvoiceFragment}
`

export const PROJECT_INVOICE_CONFIRM_TRANSFER =  gql`
mutation projectInvoiceConfirmTransfer($data: ProjectInvoiceConfirmTransferInput!){
  projectInvoiceConfirmTransfer (data: $data) {
    userErrors{
      ...userError
    }
    projectInvoice{
      ...projectInvoice
    }
    result
  }
}
${userError}
${projectInvoiceFragment}
`

export const PDFUploadQL = gql`
mutation pdfUploadCreate($data:PdfUploadCreateInput!){
  pdfUploadCreate(data:$data){
    userErrors{
      message
      field
    }
    pdfUpload{
      id
    }
  }
}
`;

export const PDFCompare = gql`
mutation pdfCompare($data:PdfCompareCreateInput!){
  pdfCompare(data:$data){
    userErrors{
      message
      field
    }
    pdfCompare{
      id
      fileUrl
      sourcePageVersion{
        id
        fileUrl
      }
      targetPageVersion{
        id
        fileUrl
      }
    }
  }
}
`;

export const PDFCompareUpload = gql`
mutation pdfCompareUpload($data:PdfCompareUploadInput!){
  pdfCompareUpload(data:$data){
    userErrors{
      message
      field
    }
    sourceBase64
    targetBase64
    compareBase64
  }
}
`;

export const PDFShareCode = gql`
mutation pdfShareCode($data:PdfShareCodeInput!){
  pdfShareCode(data:$data){
    userErrors{
      message
      field
    }
    pdfShareCode
  }
}
`;

export const PDFShareCodeDelete = gql`
mutation pdfShareCodeDelete($data:PdfShareCodeInput!){
  pdfShareCodeDelete(data:$data){
    userErrors{
      message
      field
    }
  }
}
`;

export const PDFCreate = gql`
mutation pdfCreate($data:PdfCreateInput!){
  pdfCreate(data:$data){
    userErrors{
      message
    }
    pdf{
      id
    }
  }
}
`;

export const PDFUpdate = gql`
mutation pdfUpdate($data:PdfUpdateInput!){
  pdfUpdate(data:$data){
    userErrors{
      message
    }
    pdf{
      id
    }
  }
}
`;

export const PDFDelete = gql`
mutation pdfDelete($data:PdfDeleteInput!){
  pdfDelete(data:$data){
    userErrors{
      message
    }
    deletedPdfId
  }
}
`;

export const PDFShareGenerate = gql`
mutation pdfShareGenerate($data:PdfShareGenerateInput!){
  pdfShareGenerate(data:$data){
    userErrors{
      message
    }
    pdfShare{
      id
    }
  }
}
`;

export const PDFShareDisable = gql`
mutation pdfShareDisable($data:PdfShareDisableInput!){
  pdfShareDisable(data:$data){
    userErrors{
      message
    }
    deletedPdfShareId
  }
}
`;

export const PDFVersionSave = gql`
mutation pdfVersionSave($data:PdfVersionSaveInput!){
  pdfVersionSave(data:$data){
    userErrors{
      message
    }
    pdfVersion{
      id
      fileUrl
    }
  }
}
`;

export const PDFUploadDelete = gql`
mutation pdfUploadDelete($data:PdfUploadDeleteInput!){
  pdfUploadDelete(data:$data){
    userErrors{
      message
    }
    deletedPdfUploadId
  }
}
`;

export const PDFSourceCreate = gql`
mutation pdfSourceCreate($data:PdfSourceCreateInput!){
  pdfSourceCreate(data:$data){
    userErrors{
    	message
      field
    }
    pdfSource{
      id
    }
  }
}
`;

export const PDFSourceSave = gql`
mutation pdfSourceSave($data:PdfSourceSaveInput!){
  pdfSourceSave(data:$data){
    userErrors{
    	message
      field
    }
    pdfSource{
      id
    }
  }
}
`;

export const BOOK_KEEPING_ACCOUNT_TYPES_CREATE = gql`
mutation bookKeepingAccountTypeCreate($data: BookKeepingAccountTypeCreateInput!){
  bookKeepingAccountTypeCreate (data: $data) {
    userErrors{
      ...userError
    }
    bookKeepingAccountType{
      ...bookKeepingAccountType
    }
  }
}
${userError}
${bookKeepingAccountTypeFragment}
`;

export const BOOK_KEEPING_ACCOUNT_TYPES_UPDATE = gql`
mutation bookKeepingAccountTypeUpdate($data: BookKeepingAccountTypeUpdateInput!){
  bookKeepingAccountTypeUpdate (data: $data) {
    userErrors{
      ...userError
    }
    bookKeepingAccountType{
      ...bookKeepingAccountType
    }
  }
}
${userError}
${bookKeepingAccountTypeFragment}
`;

export const BOOK_KEEPING_ACCOUNT_TYPES_DELETE = gql`
mutation bookKeepingAccountTypeDelete($data: BookKeepingAccountTypeDeleteInput!){
  bookKeepingAccountTypeDelete (data: $data) {
    userErrors{
      ...userError
    }
    result
  }
}
${userError}
`;

export const BOOK_KEEPING_ACCOUNT_CREATE = gql`
mutation bookKeepingAccountCreate($data: BookKeepingAccountCreateInput!){
  bookKeepingAccountCreate (data: $data) {
    userErrors{
      ...userError
    }
    bookKeepingAccount{
      ...bookKeepingAccount
    }
  }
}
${userError}
${bookKeepingAccountFragment}
`;

export const BOOK_KEEPING_ACCOUNT_UPDATE = gql`
mutation bookKeepingAccountUpdate($data: BookKeepingAccountUpdateInput!){
  bookKeepingAccountUpdate (data: $data) {
    userErrors{
      ...userError
    }
    bookKeepingAccount{
      ...bookKeepingAccount
    }
  }
}
${userError}
${bookKeepingAccountFragment}
`;

export const BOOK_KEEPING_ACCOUNT_DELETE = gql`
mutation bookKeepingAccountDelete($data: BookKeepingAccountDeleteInput!){
  bookKeepingAccountDelete (data: $data) {
    userErrors{
      ...userError
    }
    result
  }
}
${userError}
`;

export const BOOK_KEEPING_TRANSACTIONS_CREATE = gql`
mutation bookKeepingTransactionCreate($data: BookKeepingTransactionCreateInput!){
  bookKeepingTransactionCreate (data: $data) {
    userErrors{
      ...userError
    }
    bookKeepingTransaction{
      ...bookKeepingTransaction
    }
  }
}
${userError}
${bookKeepingTransactionFragment}
`;

export const BOOK_KEEPING_TRANSACTIONS_UPDATE = gql`
mutation bookKeepingTransactionUpdate($data: BookKeepingTransactionUpdateInput!){
  bookKeepingTransactionUpdate (data: $data) {
    userErrors{
      ...userError
    }
    bookKeepingTransaction{
      ...bookKeepingTransaction
    }
  }
}
${userError}
${bookKeepingTransactionFragment}
`;

export const BOOK_KEEPING_TRANSACTIONS_DELETE = gql`
mutation bookKeepingTransactionDelete($data: BookKeepingTransactionDeleteInput!){
  bookKeepingTransactionDelete (data: $data) {
    userErrors{
      ...userError
    }
    result
  }
}
${userError}
`;

export const CONNECT_GOOGLE = gql`
mutation connectGoogle($data: UserConnectGoogleInput!){
  connectGoogle (data: $data) {
    userErrors{
      ...userError
    }
    user {
      ...user
    }
  }
}
${userError}
${userFragment}
`;

export const DISCONNECT_GOOGLE = gql`
mutation disconnectGoogle($data: UserDisconnectGoogleInput!){
  disconnectGoogle (data: $data) {
    userErrors{
      ...userError
    }
    user {
      ...user
    }
  }
}
${userError}
${userFragment}
`;

export const UPDATE_CLOCK_IN_CONTACT = gql`
mutation updateClockInContact ($data:ClockInContactInput!){
  updateClockInContact (data:$data) {
   userErrors {
   message
   }
   clockInContact {
     id
     tel
     name
     nameEng
     address
     remark
   }
  }
 }
 `

 export const DELETE_CLOCK_IN = gql`mutation deleteClockIn ($data:ClockInDeleteInput!){
  deleteClockIn (data:$data) {
   userErrors {
   message
   }
   result
  }
 }
 `

 export const taskCreateMutation = gql`
mutation taskCreate($data: TaskInput!){
  taskCreate(data: $data){
    task{
      ...task
    }
    userErrors{
      ...userErrors
    }
  }
}
`

export const taskUpdateMutation = gql`
mutation task($data: TaskInput!){
  taskUpdate(data: $data){
    task{
      ...task
    }
    userErrors{
      ...userErrors
    }
  }
}
`
export const taskSetStatusMutation = gql`
mutation taskSetStatus($data: TaskStatusChangeInput!){
  taskSetStatus(data: $data){
    task{
      id
      status
    }
    userErrors{
      ...userErrors
    }
  }
}
`;  

export const taskDeleteMutation = gql`
mutation taskDelete($data: TaskDeleteInput!){
  taskDelete(data: $data){
    userErrors{
      ...userErrors
    }
  }
}
`;  

export const taskAssignMutation = gql`
mutation taskAssign($data: TaskAssignInput!){
  taskAssign(data: $data){
    task{
      ...taskUpdate
    }
    userErrors{
      ...userErrors
    }
  }
}
`;

export const taskUnAssignMutation = gql`
mutation taskUnassign($data: TaskAssignInput!){
  taskUnassign(data: $data){
    task{
      ...taskUpdate
    }
    userErrors{
      ...userErrors
    }
  }
}
`  

export const projectUpdateMutation = gql`
mutation projectUpdate($data: ProjectUpdateInput!){
  projectUpdate(data: $data){
    project{
      id
      code
      albumShareToken
    }
  }
}
` 

export const taskAssignProjectMutation = gql`
mutation taskAssignProject($data: TaskAssignProjectInput!){
  taskAssignProject (data:$data){
     task{
      ...task
    }
    userErrors{
      ...userErrors
    }
  }
} 
`

export const taskUnassignProjectMutation = gql`
mutation taskUnassignProject($data: TaskAssignProjectInput!){
  taskUnassignProject (data:$data){
     task{
      ...task
    }
    userErrors{
      ...userErrors
    }
  }
}
`

export const BOOK_KEEPING_PERIOD_EXPENSE_CREATE = gql`
mutation bookKeepingPeriodExpenseCreate($data: BookKeepingPeriodExpenseCreateInput!){
  bookKeepingPeriodExpenseCreate (data: $data) {
    userErrors{
      ...userError
    }
    bookKeepingPeriodExpense{
      ...bookKeepingPeriodExpense
    }
  }
}
${userError}
${bookKeepingPeriodExpenseFragment}
`;

export const BOOK_KEEPING_PERIOD_EXPENSE_UPDATE = gql`
mutation bookKeepingPeriodExpenseUpdate($data: BookKeepingPeriodExpenseUpdateInput!){
  bookKeepingPeriodExpenseUpdate (data: $data) {
    userErrors{
      ...userError
    }
    bookKeepingPeriodExpense{
      ...bookKeepingPeriodExpense
    }
  }
}
${userError}
${bookKeepingPeriodExpenseFragment}
`;

export const BOOK_KEEPING_PERIOD_EXPENSE_DELETE = gql`
mutation bookKeepingPeriodExpenseDelete($data: BookKeepingPeriodExpenseDeleteInput!){
  bookKeepingPeriodExpenseDelete (data: $data) {
    userErrors{
      ...userError
    }
    result
  }
}
${userError}
`;

export const TENDER_FORM_CREATE = gql`
mutation tenderFormCreate($data: TenderFormCreateInput!){
  tenderFormCreate (data: $data) {
    userErrors{
      ...userError
    }
    tenderForm{
      ...tenderForm
    }
  }
}
${userError}
${tenderFormFragment}
`;

export const TENDER_FORM_UPDATE = gql`
mutation tenderFormUpdate($data: TenderFormUpdateInput!){
  tenderFormUpdate (data: $data) {
    userErrors{
      ...userError
    }
    tenderForm{
      ...tenderForm
    }
  }
}
${userError}
${tenderFormFragment}
`;

export const TENDER_FORM_IMPORT = gql`
mutation tenderFormImport($data: TenderFormImportInput!){
  tenderFormImport (data: $data) {
    userErrors{
      ...userError
    }
    result
  }
}
${userError}
`;

export const TENDER_FORM_DELETE = gql`
mutation tenderFormDelete($data: TenderFormDeleteInput!){
  tenderFormDelete (data: $data) {
    userErrors{
      ...userError
    }
    result
  }
}
${userError}
`;

export const PROJECT_ORDER_CONFIRM_TRANSFER = gql`
mutation projectOrderConfirmTransfer ($data:ProjectOrderConfirmTransferInput!){
  projectOrderConfirmTransfer (data:$data) {
    userErrors{
      ...userError
    }
    projectOrder {
     ...projectOrder
   }
  }
}
${userError}
${projectOrderFragment}
`

export const PROJECT_ORDER_DELETE = gql`
mutation projectOrderDelete ($data:ProjectOrderDeleteInput!){
  projectOrderDelete (data:$data) {
    userErrors{
      ...userError
    }
    result
  }
}
${userError}
`

export const QUOTATION_UPLOAD_FILE = gql`
mutation quotationUploadFile($data:QuotationUploadFileInput!){
  quotationUploadFile(data:$data){
    userErrors{
      message
    }
    quotation{
      id
      quotationFiles{
        id
      }
    }
  }
}
`;

export const QUOTATION_FILE_DELETE = gql`
mutation quotationFileDelete($data:QuotationFileDeleteInput!){
  quotationFileDelete(data:$data){
    userErrors{
      message
    }
    quotationFile {
      id
    }
  }
}
`;

export const QUOTATION_DUPLICATION = gql`
mutation quotationDuplicate($data: QuotationDuplicateInput!){
  quotationDuplicate(data: $data){
    userErrors{
      message
    }
    quotation{
      id
    }
  }
}
`;