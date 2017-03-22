
var map;
// variable for google map api
var geocoder;
//for google map geocoder api
var marker = null;
//marking on the google map
var townsSearched = new Array();
//list of towns being searched
var currCity = null;
//an Town object representing the current city which the user has searched

$("#place-input").keyup(function(e) {
    if (e.which == 13) { //13 means enter key
      e.preventDefault();
      searchNearby($("#place-input").value);
      //if the user press enter, we search the text in #place-input within the city
    }
});

//intialise auto complete search box and map
function initAutocomplete() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: -37.7869, lng: 175.3185},
    zoom: 13,
    mapTypeId: google.maps.MapTypeId.ROADMA
  });

  geocoder = new google.maps.Geocoder();

  //restrict the town searching to cities in nz only
  var townoptions = {
    types: ['(cities)'],
    componentRestrictions: {country: 'nz'}
  };

  var towninput = document.getElementById('town-input');
  var townAutocomplete = new google.maps.places.Autocomplete(towninput,townoptions);

  //if the place changes in the town search box, we trigger the searchCity()
  townAutocomplete.addListener('place_changed', function() {
    searchCity(document.getElementById("town-input").value);
  });

}

//send the name of the city to geocoding api, and retrieve the latitude and longtitude of the city
//then display the map of the town by initialising the map
function searchCity(name){

  for (var i = 0; i < townsSearched.length; i++) {
    if (townsSearched[i].getName().localeCompare(name) == 0) {
        //if the user has already searched this city, we'll simply use the old data to display the map without sending new request to the google map service
        map = new google.maps.Map(document.getElementById('map'), {
          center: townsSearched[i].getLocation_LatLng(),
          zoom: 13,
          mapTypeId: google.maps.MapTypeId.ROADMA
        });
        return;
    }
  }

  clearPlaceUI();
  var geocode_request = {
    address : name
  }

  geocoder.geocode(geocode_request, function(results, status) {
    if (status == google.maps.GeocoderStatus.OK) {

        //check if the types of the first result of the return from geocoding service is locality, if no, we alert the user and terminate the codes
        //if yes, we continue with our code. -1 means locality is not in the array
        if (jQuery.inArray("locality",results[0].types) == -1) {
          alert("please enter a city");
          return;
        }

        //check if the country is NZ, if no, we alert the user and terminate the code, otherwise continue
        //!= 0 means two items do not match
        for (var i = 0; i < results[0].address_components.length; i++) {
          if (jQuery.inArray("country",results[0].address_components[i].types) == 0) {
            //find the types in the address_components that is country
            if (results[0].address_components[i].short_name.localeCompare("NZ") != 0) {
              //if the country is not NZ
              alert("please enter a city in NZ. Bear in mind that there are cities with the same name, in order to get accrurate result, please add country at the end. Refer to the suggestion box for detail");
              return;
            }
          }
        }
        //get the location latitude and longtitude of the city, and display the map
        var location_latlng = results[0].geometry.location;
        map = new google.maps.Map(document.getElementById('map'), {
          center: location_latlng,
          zoom: 13,
          mapTypeId: google.maps.MapTypeId.ROADMA
        });

        var town = new Town(name,results[0].geometry.location.lat(), results[0].geometry.location.lng());
        currCity = town;
        townsSearched.push(town);
        refreshTownList();
    }
    else {
      alert("Geocode was not successful for the following reason: " + status);
    }
  });
}

//search the type of service within the city (the last city being searched), and display the retrieved data in #places-nearby
function searchNearby(name){
  if(townsSearched.length == 0){alert("you haven't serarched any cities yet");return;}
  document.getElementById("places-nearby").innerHTML = "<img src='ajax-loader.gif' class='loader'>";
  //townsSearched.slice(-1)[0] means the last town in the array
  var latitude = currCity.getLatitude();
  var longtitude = currCity.getLongtitude();
  var name = document.getElementById("place-input").value;

  var jqpost  = $.post(
    "map.php",
    {
       latitude: latitude,
       longtitude: longtitude,
       query: name,
    },
    function(data) {
      var response = JSON.parse(data);
      if (response.status.localeCompare("OK") == 0) {
        //if the response is ok
        clearPlaceUI();
        var uilist = document.getElementById("places-nearby");
          for (var i = 0; i < response.results.length; i++) {
            var place = new Place(response.results[i].name,   response.results[i].formatted_address,   response.results[i].geometry.location.lat,  response.results[i].geometry.location.lng);
            uilist.appendChild(place.getDOM());
                //create the UI for each place, and then placed under the uilist
          }
      }else{
        alert("searching business was not successful for the following reason: " + response.status);
        clearPlaceUI();
      }

    }

  ).fail(function(jqXHR, textStatus ){
    alert("searching business was not successful for the following reason: " + jqXHR.status);
    clearPlaceUI();
  });

}

//clear the ui element first, and redisplay all the towns in townsSearched in the ui element
function refreshTownList(){
  var UIlist = document.getElementById("townsSearched");
  UIlist.innerHTML = "";
  for (var i = 0; i < townsSearched.length; i++) {
    UIlist.appendChild(townsSearched[i].getDOM());
  }
}

//mark a point on the map using ilat(latitude) and ilng(longtitude), izoom specifies the level of zoom
function markMap(ilat,ilng,izoom){
  map = new google.maps.Map(document.getElementById("map"), {
    center: {lat: ilat, lng: ilng},
    zoom: izoom,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  });
  var marker = new google.maps.Marker({
    position: {lat: ilat, lng: ilng},
  });
  marker.setMap(map);
}

function clearPlaceUI(){
  document.getElementById("places-nearby").innerHTML = "";
}
//object constructor for Place
function Place(name, address, lat, lng){
  var _name = name;
  var _address = address;
  var _lat = lat;
  var _lng = lng;

  var _ui = {
    container:null,
  };

  var _createUI = function(){
    _ui.container = document.createElement("li");
    _ui.container.innerHTML = _name + " " + address;
    _ui.container.lat = _lat;
    _ui.container.lng = _lng;
    _ui.container.onclick = function(){
        markMap(this.lat,this.lng,18);
    };
  }

  this.getName = function(){
    return _name;
  }
  this.getLatitude = function(){
    return _address;
  }
  this.getLatitude = function(){
    return _lat;
  }
  this.getLongtitude = function(){
    return _lng;
  }
  this.getDOM = function(){
    return _ui.container;
  }
  this.getLocation_LatLng = function(){
    return {lat: _lat, lng: _lng};
  }
  _createUI();
}

//object constructor for Town
function Town(name,lat,long){
  var _name = name;
  var _lat = lat;
  var _lng = long;

  var _ui = {
    container:null,
  };

  var _createUI = function(){
    _ui.container = document.createElement("li");
    _ui.container.lat = _lat;
    _ui.container.lng = _lng;
    _ui.container.onclick = function(){
        for (var i = 0; i < townsSearched.length; i++) {
          if (townsSearched[i].getLatitude() == this.lat && townsSearched[i].getLongtitude() == this.lng) {
            //find the town that matches the lat and lng, then set currCity to that one
            currCity = townsSearched[i];
            break;
          }
        }
        clearPlaceUI();
        markMap(this.lat,this.lng,13);
    };
    _ui.container.innerHTML = _name;
  }

  this.getName = function(){
    return _name;
  }
  this.getLatitude = function(){
    return _lat;
  }
  this.getLongtitude = function(){
    return _lng;
  }
  this.getDOM = function(){
    return _ui.container;
  }
  this.getLocation_LatLng = function(){
    return {lat: _lat, lng: _lng};
  }
  _createUI();
}
