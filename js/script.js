
const vegApp = {};
var restaurants = {}; //<---global variable for vegetarian restaurants object
vegApp.restaurantArray = []; //<----array to eventually hold restaurant longitude/latitude

vegApp.key = '33e418f64bf7bc03576382b1eb9304a6'; //<------Zomato Key

//Initialize code ("init" function to be called in "document ready")
vegApp.init = function(){
	//When user clicks "find restaurants" button
	$('.find-restaurants').on('click', function() {
		//on "click", hide intro screen
		$(".intro-container").toggleClass("hidden fadeOutUp");
		// show loading screen while map loads
		$('.loading').show();
		//show map
		$(".mapContainer").toggleClass("show");
		//target geolocation finder to find user's longitute and latitute
		vegApp.geolocationsEvents();
		//target 
		
	});
}

//Find user's location when they click "Find Restaurants" button
//they will be prompted to allow gelocation tracking
vegApp.geolocationsEvents = function() {
	//refer to "success, error, options" if geolocation function proceeds
	if('geolocation' in navigator){
		   navigator.geolocation.getCurrentPosition(success, error, options);
		   //if not, the following alert appears - browser does not support geolocation
		} else {
		alert('Your browser does not support geolocation.')
	}
	//If geolocation successful, pull latitude and longitude data and store is variables
	function success(pos){
		var latitude = pos.coords.latitude;
		var longitude = pos.coords.longitude;
		///array to store user latitude/longitude
		vegApp.latLong = [latitude, longitude];
		//pass user latitude/longitude to leaflet map
		vegApp.createMap.panTo(vegApp.latLong); 
		//hide the loading screen once the above is loaded to map
		 $('.loading').hide();
		//obtain restaurant coordinates 
		vegApp.getVegRestaurants(latitude,longitude);
	};
	//if geolocation does not proceed successfully, following alerts will apply:
	function error(err){

		if (err.code == 0) {
		    // Unknown error
		    alert('unknown error');
		}
		if (err.code == 1) {
		    // Access denied by user
		    alert('Your settings do not allow Geolocation. Please reset location settings.');
		}
		if (err.code == 2) {
		    // Position unavailable
		    alert('position unavailable');
		}
		if (err.code == 3) {
		    // Timed out
		    alert('timed out');
		}
	}

	var options = {
		// disable high accuracy, favour quick load time as opposed to extremely accurate/timely result  
		   enableHighAccuracy: false, 
		// timeout = 5000 milliseconds to retrieve result
		   timeout: 5000,  
		// maximumAge = return current position, not cached position (0).
		   maximumAge: 0 
	};

};


	//Create map, Bring map to user's latitude/longitude, zoomed in at 14
	vegApp.createMap = L.map('mapContainer', {
		center: vegApp.latLong,
		zoom: 14
	});

	// Add a basemap layer to display map
	L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYW15dHNjaHUiLCJhIjoiY2ozNG5zNmJnMDFrczJ3cDY1ZmI3NXNvMiJ9.xO_RFTtsZqDPHl2EW8d0IQ', {
	    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
	    maxZoom: 18
	}).addTo(vegApp.createMap);



//Make a call to Zomato API, search Vegetarian Restaurants, pass in latitute and longitute
vegApp.getVegRestaurants = function(lat, lon){
	$.ajax({
	  url: 'https://developers.zomato.com/api/v2.1/search',
	  method: 'GET',
	  dataType: 'json',
	  headers: {
	  	'user-key': vegApp.key,
	  },
	  data: {
	  	cuisines: '308', //<---vegetarian restaurant Zomato ID
	  	lat: lat, //<--- latitude
	  	lon: lon //<---longitude
	  }
	}).then(function(vegRestaurantsData) {
		//store restaurants object into global variable
		restaurants = vegRestaurantsData.restaurants;
		//"for each" function to obtain data for every individual restaurant object
		restaurants.forEach(function(restaurant){
			//store individual values for each restaurant for lat/lon position + additional map display info (title, photo, etc)
			vegApp.restaurantArray.push({
				lat: restaurant.restaurant.location.latitude, 
				lon: restaurant.restaurant.location.longitude,
				name: restaurant.restaurant.name,
				address: restaurant.restaurant.location.address,
				photo: restaurant.restaurant.thumb,
				cuisine: restaurant.restaurant.cuisines,
				url: restaurant.restaurant.url,
				cost: restaurant.restaurant.average_cost_for_two

			});
		});
		//call function to place markers (leaves) on map at restaurant coordinates
		vegApp.placeMapMarkers();
	});
}

//Create custom leaf markers for restaurant locations
vegApp.locationIcon = L.icon({
	iconUrl: 'assets/leafmarker.svg', // The "leaf" image for the map marker
	iconSize: [70, 70], // dimensions of the icon
	iconAnchor:   [15, -5], // point of the icon which will correspond to marker's location
	popupAnchor: [0, 12.5] // position of the popup relative to the icon
});



//Function to place markers for vegetarian restaurants on map
vegApp.placeMapMarkers = function(){
	//pulling latitude and longitude for each restaurant in array
	vegApp.restaurantArray.forEach(function(marker) {
		var lat = marker.lat;
		var lon = marker.lon;
		//default image if restaurant data has no main thumbnail image
		marker.photo = marker.photo.length > 0 ? marker.photo : "assets/vegout-logo-small.jpg";
		//Leaflet method -> add custom marker to map at lat/longs pulled from above
		L.marker([lat, lon], {icon: vegApp.locationIcon})
		//Leaflet  method to create "pop up" when marker clicked
		.bindPopup(
			//template literal content for marker popups
			`<div class="restaurant-popup">
				<a href="${marker.url}" class="image-popup-link" target="_blank">
					<img src="${marker.photo}" class="image-popup">
				</a>
				<div class="popup-text">
					<a href="${marker.url}" target="_blank" class="popup-text_content">
							<h2>${marker.name}</h2>
							<p class="cuisine">${marker.cuisine}</p>
							<p>${marker.address}</p>
							<p>Cost for two: $${marker.cost}</p>
					</a>
				</div>
			</div>`
		)
		.addTo(vegApp.createMap);
	});	
}


//document ready to initiate funtions when page loaded
$(function(){
	vegApp.init();
});