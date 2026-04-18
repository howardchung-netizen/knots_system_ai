import AsyncStorage from '@react-native-async-storage/async-storage';


export function node({ location, address, modified, group_name, timestamp, date, type, mime, image }) {
  // console.log("node", location);
 this.location = {
  latitude: location?.latitude??null,
  longitude: location?.longitude??null
  }
 this.address = address ?? null,
 this.date = date ?? null,
 this.modified = modified??null,
 this.group_name = group_name??null,
 this.timestamp = timestamp??null,
 this.type = type ?? null,
 this.mime = mime?? null,
 this.image = {
   fileSize: image?.fileSize??null,
   filename: image?.filename??null,
   playableDuration: image?.playableDuration??null,
   height: image?.height??null,
   width: image?.width??null,
   uri: image?.uri??null
    }
  // console.log("node", this);
 return this
}

function Album(album, first, after) { 
// console.log("albums")
 this.edges = [];
 this.page_info = { has_next_page: false };
  if (album) {
    let _album = JSON.parse(album);
    let total = _album.edges.length;
    this.edges = _album.edges.slice((after ? parseInt(after) : 0), after ? afterInt + first : first);
    this.page_info = { has_next_page: this.edges.length < total ? true : false }
  }
 return this
}

export const getAlbum = async (projectName, projectID, first, after) => {
  const afterInt = after ?? parseInt(after);
  return new Album(await AsyncStorage.getItem('@album_'+projectName+'_'+projectID), first, after);
}

export const setAlbum = async (projectName, projectID, album) => {
  // console.log("setAlbum", album)
  await albumsList(projectName, projectID)
  if (album) AsyncStorage.setItem('@album_'+projectName+'_'+projectID, JSON.stringify(album));
}
 
export const addImageToAlbumAsynStorage = async (projectName, projectID, edges) => { 
  console.log("addImageToAlbumAsynStorage", )
  // console.log(edges)
  let album = await getAlbum(projectName, projectID, 9999999 );
  for (let i of edges) {
    album.edges.push({ node: new node(i.node)});
  }
  await setAlbum(projectName, projectID, album);
}

export const removeImageFormAlbumAsynStorage = async (projectName, projectID, imgs) => {
  // console.log("removeImageFormAlbumAsynStorage")
  let album = await getAlbum(projectName, projectID, 9999999 );
  // console.log(album)
  album.edges = album.edges.filter(e => {
    return !imgs.includes(e.node.image.filename)
  });
  await setAlbum(projectName, projectID, album);
  return album
}

export const deleteAlbum = async (projectName, projectID) => {
  // console.log("deleteAlbum")
  try {
    await AsyncStorage.removeItem('@Album_'+projectName+'_'+projectID)
    return true
  } catch (err) {
    console.log(err)
    return err
  }
}

export const albumsList = async (projectName, projectID) => {
  // console.log("albumsList")
  let albumsList = await AsyncStorage.getItem('@albumsList');
  albumsList = albumsList ? JSON.parse(albumsList) : [];
  if (projectName && projectID) {
    if (albumsList.find(e => e.projectName == projectName && e.projectID == projectID)) return;
    else {
      albumsList.push({ projectName, projectID });
      await AsyncStorage.setItem('@albumsList', JSON.stringify(albumsList));
    }
  }
  else return albumsList;
}

