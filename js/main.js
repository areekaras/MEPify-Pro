/* MEPify · Start-up: Android back button hook and first render. Loads last.
   by Mohamed Shafaf Karumannil */

window.scBack=function(){if(document.querySelector(".x-dim")&&window.scSheetClose){window.scSheetClose();window.scSheetClose=null;return true}if(view==="load"&&hlBack())return true;if(view!=="home"){if(isView(view))go("home");else goBack();return true}return false};
render();
