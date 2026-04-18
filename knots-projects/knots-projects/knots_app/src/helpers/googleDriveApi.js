const b64toBlob = (b64Data, contentType='', sliceSize=512) => {
  const byteCharacters = atob(b64Data);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);

    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  const blob = new Blob(byteArrays, {type: contentType});
  return blob;
}

export const createAlbum = async (accessToken, title) => {
 return fetch(
  `https://photoslibrary.googleapis.com/v1/albums`,
  {
   method: "POST",
   headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + accessToken
   },
   body: JSON.stringify({
    "album": {
     "title": title
    }
   })
  }
 ).then(async (response) =>  await response.json())
  .catch((error) => error)
}

export const shareAlbum = async (accessToken, albumId) => {
  return fetch(
    `https://photoslibrary.googleapis.com/v1/albums/${albumId}:share`,
    {
      method: "Post",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + accessToken,
        'X-Goog-Upload-Protocol': 'raw',
      },
      body: JSON.stringify(
        {
          "sharedAlbumOptions": {
          "isCollaborative": true,
          "isCommentable": true
          }
        }
      )
      
    }
  ).then(async (response) => await response.json())
   .catch((error) => error);
}

export const listShareAlbum = async (accessToken) => {
return fetch(
   `https://photoslibrary.googleapis.com/v1/sharedAlbums`,
   {
     method:"Get",
     headers: {
       'Content-Type': 'application/json',
       'Authorization': 'Bearer '+accessToken
     }
   }
 ).then(async (response) => await response.json())
 .catch((error) => error);
}

export const joinAlbum = async (accessToken, shareToken) => {
  console.log("joinAlbum")
 return fetch(
    `https://photoslibrary.googleapis.com/v1/sharedAlbums:join`,
    {
      method:"Post",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer '+ accessToken
      },
      body: JSON.stringify({
       "shareToken": shareToken //"AOVP0rRq5aOOKYUSrWrc0jRgtVp_dT3XEtntwFcSUi5K81_c_LAY312I9cbQIcSIhB7hlTiGDtYhQ9qIINZnuvSeQkD_luAmXQuAQxs9-9D6bn0h4DbCnASipZgncs0FoYI"
     })
    }
  ).then(async (response) => await response.json())
  .catch((error) => error);
}

export const uploads = async (accessToken, fileName, filebase64, parents = ["1PlAYpuqf81QFr0hwO1fikpRwwopQiGge"]) => {
  let file = await fetch(filebase64);
  let blob = await file?.blob();
  // console.log(blob)
  var headers = new Headers();
  headers.append("Authorization", "Bearer " + accessToken);
  headers.append("Content-Type", "image/jpeg");
  // headers.append("Content-Type", "charset=UTF-8");
  // headers.append("Content-Type", "multipart/form-data");
  // headers.append("Content-Type", filebase64.length);
  // headers.append("Content-Type", "multipart/related;"); 
  // headers.append("Content-Type", 'application/json;charset=UTF-8'); 
  headers.append("X-Upload-Content-Type", 'application/octet-stream'); 
  headers.append("X-Goog-Upload-Protocol", 'raw'); 
  // headers.append("X-Upload-Content-Length", 0);
 let uploadedFile = await fetch(
    `https://www.googleapis.com/upload/drive/v3/files?uploadType=Resumable&supportsAllDrives=true&fields=*`,
    {
      method: "POST",
      headers: headers,
      body: blob
    }
  ).then(async (response) => {
    console.log("uploads", response)
    if (response.status == 200) {
      let resJson = await response.json();
      console.log(resJson)
      await updateFile(accessToken, resJson.id, parents)
    }
    
    else return await response.text()
  }).catch((error) => console.log(error));
  console.log(uploadedFile)
}

export const updateFile = async (accessToken, id, parents) => {
  var headers = new Headers();
  headers.append("Authorization", "Bearer " + accessToken);
  // headers.append("Content-Type", "image/jpeg");
  headers.append("Content-Type", 'application/json;charset=UTF-8'); 
  headers.append("X-Upload-Content-Type", 'application/octet-stream'); 
  headers.append("X-Goog-Upload-Protocol", 'raw'); 
  // headers.append("X-Upload-Content-Length", 0);
  await fetch(
    `https://www.googleapis.com/drive/v3/files/${id}?uploadType=Resumable&supportsAllDrives=true&fields=*&addParents=${parents.toString()}`,
    {
      method: "PATCH",
      headers: headers,
      body: JSON.stringify(
        { 
          name: "dasdas.jpg"
        }
      )
    }
  ).then(async (response) => {
    console.log("uploads", response)
    if (response.status == 200) console.log(await response.json());
    else return console.log(await response.text());
  }).catch((error) => console.log(error));

}
export const batchCreate = async (accessToken, albumID, uploadTokenArr, cb) => {
  // console.log("batchCreate", uploadTokenArr)
  var raw = JSON.stringify({
    "albumId": albumID,
    "newMediaItems": uploadTokenArr.map(e => {
      return {
        "description": "",
        "simpleMediaItem": {
          "fileName": e.fileName,
          "uploadToken": e.uploadToken
        }
      }
    })
  });
 return await fetch(
    `https://photoslibrary.googleapis.com/v1/mediaItems:batchCreate`,
    {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + accessToken
      },
      body: raw
    }
  ).then(async (response) => { 
    let res = await response.json();
    // console.log("res", res.newMediaItemResults)
    // res.newMediaItemResults = res.newMediaItemResults.map((e, i) => {
    //   e.fileName = uploadTokenArr[i].fileName;
    //   return e
    // });
    if (cb) cb(res);
    return res
  })
    .catch((error) => { 
      console.log(error)
      if (cb) cb(error);
      return error
    });
}