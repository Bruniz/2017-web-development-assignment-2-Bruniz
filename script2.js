let country, zipCode, jsonData, map;

/*
Function is triggered when clicking the search button. Fetches the data and calls other needed functions
 */
function search() {
    // Get the country and the code supplied by the user
    country = document.getElementById('country').value;
    zipCode = document.getElementById('zipCode').value;

    // Don't call API if user has not supplied parameters
    if (country && zipCode) {

        // Make the HTTP request
        let client = new XMLHttpRequest();
        // Add the country and zipCode to the uri
        client.open("GET", `https://api.zippopotam.us/${country}/${zipCode}`, true);
        // Code from zippopotam. When state of request changes the check state. Event listener
        client.onreadystatechange = function () {

            if (client.readyState == 4) {
                // No need to update UI if it was a 404
                if (client.status !== 404) {
                    // Convert the response to JSON
                    jsonData = JSON.parse(client.responseText);
                    // Trigger the Google maps API
                    displayMap(jsonData.places);
                    // Display the results of cities and coordinates
                    populateTable(jsonData.places);
                    // Add successful search to the history
                    addToHistory(jsonData);
                    // Update the history list
                    displayHistory();
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
}

/*
Function for populating the table with the results from the request
 */
function populateTable(places) {
    // Get the table from the DOM
    let tableBody = document.getElementById('locations-table-body');
    // Add the heading to the table
    tableBody.innerHTML = '<tr class="table-heading">\n' +
        '                <td>Place name</td>\n' +
        '                <td>Longitude</td>\n' +
        '                <td>Latitude</td>\n' +
        '            </tr>';
    // Loop through all the places
    places.forEach(function (place) {

        // Create new table row
        let row = document.createElement('tr');
        // Create three table cells
        let cell1 = document.createElement('td');
        let cell2 = document.createElement('td');
        let cell3 = document.createElement('td');
        // Create the text for the cells
        let text1 = document.createTextNode(place['place name']);
        let text2 = document.createTextNode(place.longitude);
        let text3 = document.createTextNode(place.latitude);
        // Add the text to the cells
        cell1.appendChild(text1);
        cell2.appendChild(text2);
        cell3.appendChild(text3);
        // Add the cells to the row
        row.appendChild(cell1);
        row.appendChild(cell2);
        row.appendChild(cell3);
        // Add the row to the table
        tableBody.appendChild(row);

    });
}

/*
Function for saving the 10 most recent searches persistently in the browser
 */
function addToHistory(data) {
    //Get the history item from the storage
    let history = localStorage.getItem('history');
    // Create the new item
    let newItem = {country: data.country, zip: data['post code']};
    // If there was not a history saved before, create it and add new object
    if (!history) {
        history = [];
        history.push(newItem);
    }
    // Else history was there
    else {
        // Parse to JSON for manipulation
        history = JSON.parse(history);
        // Reverse it to add item to the front with push()
        history.reverse();
        // Add item
        history.push(newItem);
        // Reverse again so newest object is first
        history.reverse();

    }
    // Trim the history if it is to long
    if (history.length > 10) {
        history = history.slice(0, 10);
    }
    // Save the history to storage
    localStorage.setItem('history', JSON.stringify(history));
}

/*
Function for displaying the data that is stored in the localStorage persistently. Also used for updating the history view
 */
function displayHistory() {

    // Get the history item
    let history = localStorage.getItem('history');

    // Get the list from the DOM
    let list = document.getElementById('history');
    // Reset the list
    list.innerHTML = '';

    // If there is something stored, display it, else do nothing
    if (history) {
        // Convert the history object to JSON
        history = JSON.parse(history);
        // Loop through all history objects and append them to the list
        history.forEach(function (item) {
            // Create a list item
            let listItem = document.createElement('li');
            // Construct the text to display
            let text = document.createTextNode(item.country + ' - ' + item.zip);
            // Add the text to the li
            listItem.appendChild(text);
            // Add the li to the list (ul)
            list.appendChild(listItem);
        })
    }

}

function displayMap(places) {

    // Center the map on the first place
    let mapProps = {
        center: new google.maps.LatLng(places[0].latitude, places[0].longitude),
        zoom: 9,
    };
    // Create map
    map = new google.maps.Map(document.getElementById("map"), mapProps);

    // Loop through all places and add markers
    places.forEach(function (place) {
        // Create the marker point
        let markerPoint = new google.maps.LatLng(place.latitude, place.longitude);
        // Create the marker
        let marker = new google.maps.Marker({position: markerPoint});
        // Add marker to map
        marker.setMap(map);
    })
}

/*
Extra function for cleaning the storage
 */
function clearHistory() {
    localStorage.clear();
    displayHistory();
}
