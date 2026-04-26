import { gql } from '@apollo/client';

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
