import AsyncStorage from '@react-native-async-storage/async-storage';


function node ({location, address, modified, group_name, timestamp, type, image}) {
 this.location = {
  latitude: location?.latitude??null,
  longitude: location?.longitude??null
  }
 this.address = address??null 
 this.modified = modified??null,
 this.group_name = group_name??null,
 this.timestamp = timestamp??null,
 this.type = type??null,
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

function GalleryList(galleryList, first, after) { 
  console.log("GalleryList")
 this.edges = [];
 this.page_info = { has_next_page: false };
  if (galleryList) {
    let _galleryList = JSON.parse(galleryList);
    let total = _galleryList.edges.length;
    this.edges = _galleryList.edges.slice((after ? parseInt(after) : 0), after ? afterInt + first : first);
    this.page_info = { has_next_page: this.edges.length < total ? true : false }
  }
 return this
}

export const setGallery = async (gallery) => {
  console.log("setGallery", gallery)
  if (gallery) AsyncStorage.setItem('@gallery', JSON.stringify(gallery))
}

export const getGallery = async ({ first, after }) => {
 const afterInt = after ?? parseInt(after);
 return new GalleryList(await AsyncStorage.getItem('@gallery'), first, after);
}

export const addImageToGalleryAsynStorage = async (edges) => { 
  console.log("addImageToGalleryAsynStorage")
  console.log(edges)
  let Gallery = await getGallery({ first: 9999999 });
  for (let i of edges) {
    console.log(i)
    Gallery.edges.push({ node: new node(i.node)});
  }
  await setGallery(Gallery);
}

export const removeImageFormGalleryAsynStorage = async (imgs) => {
  // console.log("removeImageFormGalleryAsynStorage")
  let Gallery = await getGallery({ first: 9999999 });
  console.log(Gallery)
  Gallery.edges = Gallery.edges.filter(e => {
    return !imgs.includes(e.node.image.filename)
  }
  );
  await setGallery(Gallery);
  return Gallery
}

export const deleteGallery= async () => {
  // console.log("deleteGallery")
  try {
    await AsyncStorage.removeItem('@gallery')
    return true
  } catch (err) {
    console.log(err)
    return err
  }
}


