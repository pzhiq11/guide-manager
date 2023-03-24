
let userId = '';

export function _setUserId(id: string){
  userId = id;
}
export async function getUserId() {
  try {
    if (userId) return userId;
    // const res = await User.isLogin();
    _setUserId('pzq');//res?.userId
    return userId;
  } catch (error) {
    console.log(error);
    return '';
  }
}
let localStorage ={};
export function setStorage(key: string, item: string) {
  console.log(`set storeage${userId}${key}`);
  // localStorage.setItem(userId + key, item);
  localStorage[userId + key] = item;
}

export function getStorage(key: string) {
  console.log(`get storeage${userId}${key}`);
  // return localStorage.getItem(userId + key);
  return localStorage[userId + key]
}
