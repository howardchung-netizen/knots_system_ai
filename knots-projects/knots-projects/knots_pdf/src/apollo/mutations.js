import { gql } from '@apollo/client';

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
