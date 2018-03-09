// const $thumbnails = $('.thumbnails');
var thumbnails = document.getElementById("thumbnails");
//default directory
var recipe_directory = "Recipes/";
var searchType = "recipe_search";

//recipe search on 'enter' function
var searchBar = document.getElementById("recipe_search");
searchBar.addEventListener("keyup", function(event) {
  event.preventDefault();
  if (event.keyCode === 13)
    document.getElementById("recipe_search_button").click();
});
var ingredientSearch = document.getElementById("ingredient_search");
ingredientSearch.addEventListener("keyup", function(event) {
  event.preventDefault();
  if (event.keyCode === 13) {
    searchType = "ingredient_search";
    newSearch();
    searchType = "recipe_search";
  }
});

function organizedDisplay(){
  var isDisplayPage = false;
  if (thumbnails.innerHTML == "Show Here!") {
    isDisplayPage = true;
    recipe_directory = getQuerystring('recipe').replace(/%20/g," ").toString();
    thumbnails.innerHTML = "";
  }
  var dbRefObject = firebase.database().ref().child(recipe_directory);
  var hold = recipe_directory;

  var div = $('<div onclick="passTitle(\''+ hold +'\')" style="width:220px;">').appendTo(thumbnails);
  var pic = $('<img src="""/>').appendTo(div);
  var title = $('<h2 style="text-align:center; color:#243010;">').appendTo(div);

  // var title = $('<p>').appendTo(thumbnails);
  // var pic = $('<img src="" style="width:200px;height:200px;"/>').appendTo(thumbnails);
  if (isDisplayPage) {
	var ultitle = $('<h3>').appendTo(thumbnails);
    var ul = $('<ul>').appendTo(thumbnails);
	var ulnontitle = $('<h3>').appendTo(thumbnails);
    var ulnon = $('<ul style="list-style-type:none">').appendTo(thumbnails);
  }

  inOrderDisplay(
    function(){
  var dbPicObject = dbRefObject.child('picRef/');
  var stPicObject = firebase.storage().ref('Recipes/');
  var fileURL = dbPicObject.on('value', function(snap){
    console.log("snap val is: " + snap.val());

  stPicObject.child(snap.val()).getDownloadURL().then(function(url){
    var key = ('<img src="'+ url +'" style="display:block; max-width:200px;max-height:200px;border:5px solid #243010; margin-left:auto; margin-right:auto;">');
    console.log("here is key: "+key);
    pic.replaceWith(key);
    hold = hold.substring(0, hold.length-1);
    title.append(hold.substring(8));

  }).catch(function(error){});
  });
},function(){
  var dbIngreObject = dbRefObject.child('Ingredients/');
  ul.prepend(ultitle);
  ultitle.append("Ingredients: ");
  dbIngreObject.on('value', snap => {
    snap.forEach(function(child){
      ul.append(
        $(document.createElement('li')).html(child.key + ": " + child.val())
      );
    });
  });
},function(){
  var dbInstrObject = dbRefObject.child('Instructions/');
  ulnon.prepend(ulnontitle);
  ulnontitle.append('Instructions: ');
  dbInstrObject.on('value', snap => {
    snap.forEach(function(child){
      ulnon.append(
        $(document.createElement('li')).html(child.key.substring(12) +": "+child.val())
      );
    });
  });
}
)}

function inOrderDisplay() {
    var items = arguments;
    if (items.length <= 0)
        return;
    (function linkTogether(i) {
        if (i >= items.length || typeof items[i] !== 'function'){
            return;}
        window.setTimeout(function() {
            items[i]();
            linkTogether(i + 1);}, 500);
	})(0);
}

function newSearch() {
  emptyScreen();
  document.getElementById(searchType).select();
  var searchWord = document.getElementById(searchType).value.toLowerCase();
  var dbRefObject = firebase.database().ref().child('Recipes/');
  dbRefObject.on('value', snap => {
    //search each recipe
    snap.forEach(function(child){
      var dbRecipeObj = dbRefObject.child(child.key + "/");
      var dbIngreObject = dbRecipeObj.child('Ingredients/');
      var recipe_loaded = false;
      //always search ingredients
      dbIngreObject.on('value', snap => {
        snap.forEach(function(child){
          var n = child.key.toLowerCase().search(searchWord);
          recipe_loaded = processSearch(recipe_loaded, n, dbRecipeObj.key);
        });
      });
      if (searchType == "recipe_search") {
        //search recipe names
        var n = dbRecipeObj.key.toLowerCase().search(searchWord);
        recipe_loaded = processSearch(recipe_loaded, n, dbRecipeObj.key);
        //search meal type
        // n = dbRecipeObj.child('Meal Type/').val().toLowerCase().search(searchWord);
        // recipe_loaded = processSearch(recipe_loaded, n, dbRecipeObj.key);
      }
    });
  });
}

function uploadRecipe() {
  var loader = document.getElementById('loader');
  loader.innerHTML = "";
}

function emptyScreen() {
  document.getElementById("loader").innerHTML = "";
  document.getElementById("thumbnails").innerHTML = "";
}

function passTitle(p) {
  window.location = "recipeDisplay.html?recipe=" + p;
}

function getQuerystring(key, default_) {
  if (default_==null) default_="";
  key = key.replace(/[\\[]/,"\\\\\\[").replace(/[\\]]/,"\\\\\\]");
  var regex = new RegExp("[\\\\?&]"+key+"=([^&#]*)");
  var qs = regex.exec(window.location.href);
  if(qs == null)
    return default_;
  else
    return qs[1];
}

function processSearch(recipe_loaded, n, key) {
  if (recipe_loaded == true) {
    //if recipe already loaded, do nothing
  } else {
    if (n != -1) {
      //if matched, display
      recipe_directory = "Recipes/" + key + "/";
      organizedDisplay();
      recipe_loaded = true;
    } else {
      //recipe name didn't match
    }
  }
  return recipe_loaded;
}
