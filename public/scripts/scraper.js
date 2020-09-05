let spaceRadio = document.getElementById("spaceRad");
let earthRadio = document.getElementById("earthRad");
const regex = /theme=/g;
let pageCookie = document.cookie;
let themeIndex = pageCookie.search(regex);
let pageTheme = document.cookie
  .substring(themeIndex + 6, themeIndex + 15)
  .toLowerCase();
console.log(pageTheme);
if (pageTheme == "spaceporn" || pageTheme == undefined) {
  spaceRadio.checked = true;
} else {
  earthRadio.checked = true;
}
