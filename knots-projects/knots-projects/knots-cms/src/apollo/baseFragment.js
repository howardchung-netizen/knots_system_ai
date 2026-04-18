import { gql } from '@apollo/client';

export const role = gql`
fragment role on Role{
    name
    permissions {
      name
      resource
      actions
    }
    roles{
      name
    }
}
`;

export const baseUser = gql`
fragment user on User{
  id
  username
  nameCht
  nameEn
  nickName
  tel1
  tel2
  whatsApp
  whatsapp2
  wechat
  wechat2
  email
  deleted
  color
  roles{
    name
  }
}
`;

export const baseClient = gql`
fragment client on Client{
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
  remark
  name
  nameEn
  nameCht
}
`;

export const baseContact = gql`
fragment baseContact on Contact{
  address
  email
  telCode
  tel
  whatsappCode
  whatsapp
  wechatCode
  wechat
  name
  nameEn
  nameCht
}
`;

export const baseMember = gql`
fragment baseMember2 on Member{
  id
  createdAt
  username
  name
  firstName
  lastName
  chineseFirstName
  chineseLastName
  hkid
  patientId
  gender
  dateOfBirth
  tel
  email
  photo
  photoThumbnail
  staffAssignmentTime
  activeCustomerBase
  grade
  status
  remarks
  updatedAt
  registeredAt
  joinedAt
  specialCodes
  lastContractDate
  declined
  ethnic
  appInstalled
  appLastActiveAt
}
`;

export const baseOperationLog = gql`
fragment baseOperationLog on OperationLog{
  id
  createdAt
  updatedAt
  objectType
  action
  changes
}
`;

export const baseAuthorizer = gql`
fragment baseAuthorizer on Authorizer{
  id
  createdAt
  updatedAt
  displayName
  name
}
`;

export const baseProjectTypeFragment = gql`
fragment projectType on ProjectType {
  id
  nameCht
  nameEn
}
`;

export const basehashtagFragment = gql`
fragment hashtag on ProjectHashtag {
  id
  nameCht
  nameEn
}
`;

export const baseClientContactFragment = gql`
fragment clientContact on ClientContacts {
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
  projectId
  quotationId
  client_id
  contactFiles {
    id
    fileUrl
    fileMimeType
  }
}
`;

export const baseProjectStatusFragment = gql`
fragment projectStatus on ProjectStatus {
  id
  code
  nameEn
  nameCht
  style
}
`;

export const baseQuotationStatusFragment = gql`
fragment quotationStatus on QuotationStatus { 
  id
  code
  nameEn
  nameCht
  sort
  show
}
`

export const baseProjectSpotlightFragment = gql`
fragment projectSpotlight on ProjectSpotlight { 
  id
  nameEn
  nameCht
  hex
  preset
  show
  sort
  deleted
}
`

export const baseProjectFragment = gql`
fragment project on Project {
  id
  code
  projectId
  start
  end
}
`;

export const baseQuotationFragment = gql`
fragment quotation on Quotation {
  id
  title
  code
  project {
    id
  }
}
`;

export const baseProjectOrderFragment = gql`
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
  files {
    id
    fileUrl
    fileMimeType
  }
}
`;

export const baseBookKeepingTransactionFragment = gql`
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
}
`;