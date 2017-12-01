let routes, dataSet, routesUrl, map, routeId, route_short_name;
let showBuses = false;
let buses = [];

/*
Function that is triggered when the page has loaded. Fetches the available api. Then calls the function
that fetches the available bus lines.
 */
function getDataSet() {

    // Request client
    let client = new XMLHttpRequest();
    // Get the current api parameters
    client.open("GET", `https://data.foli.fi/gtfs/`, true);
    // Event listener
    client.onreadystatechange = function () {

        if (client.readyState == 4) {
            // No need to update UI if it was a 404
            if (client.status !== 404) {
                // Convert the response to JSON
                dataSet = JSON.parse(client.responseText);

                // Construct the url to fetch the available routes
                routesUrl = `https://data.foli.fi/${dataSet.gtfspath}/${dataSet.latest}/routes`;
                // Call function that fetches the routes
                getAvailableRoutes(routesUrl);
            }
            // Else show message that the api is not functioning properly
            else {
                alert('API error');
            }
        }
    };
    // Send the request
    client.send();
}

/*
Function for fetching the available routes. When the response comes, calls function that populates the select.
 */
function getAvailableRoutes(url) {

    //Request client
    let client = new XMLHttpRequest();
    // Use the url provided by the caller
    client.open("GET", url, true);
    // Event listener
    client.onreadystatechange = function () {

        if (client.readyState == 4) {
            // No need to update UI if it was a 404
            if (client.status !== 404) {
                // Convert the response to JSON
                routes = JSON.parse(client.responseText);
                // Call function that loops through all routes adding them to the select
                populateSelect(routes);

            }
            // Else show message that nothing was found
            else {
                alert('Could not find routes');
            }
        }
    };
    // Send the request
    client.send();
}

/*
Function that iterates over all the routes passed in and appends them to the select
 */
function populateSelect(routes) {

    // Get the select box from the DOM
    let busLines = document.getElementById('busLines');
    // Iterate over all routes
    routes.forEach(function (route) {
        // Construct the select option
        let option = document.createElement('option');
        option.value = route.route_id;
        option.text = route.route_long_name;
        // Add the option to the select
        busLines.appendChild(option);
    });
}

/*
Function for drawing the map.
 */
function displayRoute() {

    // Reset the map
    document.getElementById('map').innerHTML = '';

    // Call the function for getting the id of the shape to draw on map.
    getShapeId(function (shapeId) {
        // Function for fetching the shape using the id from above.
        getShape(shapeId, function (shape) {
            // Something was returned
            if (shape) {

                // Create the map
                map = new google.maps.Map(document.getElementById('map'), {
                    zoom: 12,
                    // Center the map on the middle of the route
                    center: {lat: shape[0].lat, lng: shape[0].lon}
                });

                // Map over the shape the return an array of the coordinate objects
                let shapeInfo = shape.map(function (cord) {
                    return {lat: cord.lat, lng: cord.lon}
                });

                // Create the route line
                let routeLine = new google.maps.Polyline({
                    path: shapeInfo,
                    geodesic: true,
                    strokeColor: '#FF0000',
                    strokeOpacity: 1.0,
                    strokeWeight: 2
                });
                // Add the line to the map
                routeLine.setMap(map);
            }
            else {
                alert('Could not draw the route');
            }
        });
    });


}

/*
Helper function for fetching the id of the shape. Uses the selected routes id
 */
function getShapeId(callback) {

    showBuses = false;

    // Get the selected route from the select
    let selectedRouteId = document.getElementById('busLines').value;

    // Check if there is something selected, if not then return without doing anything
    if (!selectedRouteId) {
        alert('No route selected');
        return 1;
    }

    // Save the id so the wrong buses aren't fetched if user changes route with out showing the new route
    routeId = document.getElementById('busLines').value;

    // Get the route short name (number) that matches the selected using filter
    route_short_name = routes.filter(function (route) {
        return route.route_id === routeId;
    })[0].route_short_name;

    // Get the trips for the selected route (the trip contains the shape_id)
    let url = `https://data.foli.fi/${dataSet.gtfspath}/${dataSet.latest}/trips/route/${selectedRouteId}`;
    let client = new XMLHttpRequest();
    // Add the country and zipCode to the uri
    client.open("GET", url, true);
    // Event listener
    client.onreadystatechange = function () {

        if (client.readyState == 4) {
            // No need to do this, 404
            if (client.status !== 404) {
                // Convert the response to JSON
                let tripsJson = JSON.parse(client.responseText);
                // A shape id was found, then we should be able show buses
                // This prevents the buses to be loaded before a showing a route
                showBuses = true;
                // Pass the shape id to the callback
                callback(tripsJson[0].shape_id);

            }
            // Else show message that nothing was found
            else {
                // Use jQuery for a nice effect
                $("#error").fadeIn(1000).delay(3000).fadeOut(2000);
            }
        }
    };
    // Send the request
    client.send();

}
/*
Helper function for fetching the shape to be drawn on the map.
 */
function getShape(shapeId, callback) {

    // Url for the shape
    let url = `https://data.foli.fi/${dataSet.gtfspath}/${dataSet.latest}/shapes/${shapeId}`;
    // Request client
    let client = new XMLHttpRequest();
    // use the url to fetch the shape
    client.open("GET", url, true);
    // Event listener
    client.onreadystatechange = function () {

        if (client.readyState == 4) {
            // No need to update UI if it was a 404
            if (client.status !== 404) {
                // Convert the response to JSON
                let shapeJson = JSON.parse(client.responseText);
                // Pass the shape to the callback
                callback(shapeJson);

            }
            // Else show message that nothing was found
            else {
                alert('Could not fetch route');
            }
        }
    };
    // Send the request
    client.send();

}

/*
Function for displaying the bus markers on the map. Is used by show buses button and refresh. Fetches the bus info
from the api and iterates over it to find the buses on the selected route.
 */
function displayBuses() {

    // There are bus markers in the list
    if (buses.length) {
        // Loop through and remove them from the map
        for (i = 0; i < buses.length; i++) {
            buses[i].setMap(null);
        }
        // Empty the array
        buses = [];
    }

    // If route is selected and shape is found then fetch the buses
    if (routeId && showBuses) {

        // Request client
        let client = new XMLHttpRequest();
        // Url to fetch bus information
        client.open("GET", `https://data.foli.fi/siri/vm`, true);
        // Event listener
        client.onreadystatechange = function () {

            if (client.readyState == 4) {
                // No need to update UI if it was a 404
                if (client.status !== 404) {

                    // Convert the response to JSON
                    let jsonData = JSON.parse(client.responseText);
                    // Extract the buses from the repsonse json
                    let busInfo = jsonData.result.vehicles;

                    // Map through all the buses.
                    Object.keys(busInfo).map(function (key) {

                        // If the current bus matches the current route then add the marker to the list
                        if (busInfo[key].publishedlinename === route_short_name) {
                            // Create the marker point
                            let markerPoint = new google.maps.LatLng(busInfo[key].latitude, busInfo[key].longitude);
                            // Create the marker
                            let marker = new google.maps.Marker({position: markerPoint});
                            //Push to list of buses
                            buses.push(marker);
                        }
                    });

                    // Loop through all buses and add them to the map
                    for (var i = 0; i < buses.length; i++) {
                        buses[i].setMap(map);
                    }
                }
                // Else show message that nothing was found
                else {
                    alert('Could not fetch buses');
                }
            }
        };
        // Send the request
        client.send();
    }
    else {
        // Use jQuery for a nice effect
        $("#noRoute").fadeIn(1000).delay(3000).fadeOut(2000);
    }
}