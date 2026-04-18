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

export const uploads = async (accessToken, fileName, uri) => {
//  console.log("uploads", accessToken, fileName, uri)
 const img = await fetch(uri);
 const imgBlob = await img.blob();
 return await fetch(
   `https://photoslibrary.googleapis.com/v1/uploads`,
   {
     method: "POST",
     headers: {
       'Content-type': 'application/octet-stream',
       'X-Goog-Upload-Content-Type': 'mime-type',
       'X-Goog-Upload-Protocol': 'raw',
       'Authorization': 'Bearer ' + accessToken
     },
     body: imgBlob
   }
 ).then(async (response) => { 
  //  console.log("uploads", response)
   if (response.status == 200) return {status:"ok", fileName:fileName, uploadToken: await response.text()};
   else return { status: "error", error: (await response.json()).message, uri:uri};
 })
  .catch((error) => console.log(error));
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