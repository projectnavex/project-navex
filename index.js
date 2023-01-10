let map;
let poly;
let uniqueID = 1;
let markers = [];
var trainingAreas = {};

function initDropdown() {
    // Initialize dropdown menu.
    const dropdowns = document.querySelectorAll('.dropdown');

    // Loop through all dropdown elements.
    dropdowns.forEach(dropdown => {
        const select = dropdown.querySelector('.select');
        const caret = dropdown.querySelector('.caret');
        const menu = dropdown.querySelector('.menu');
        const options = dropdown.querySelectorAll('.menu li');
        const selected = dropdown.querySelector('.selected');

        // Add a click event to the select element.
        select.addEventListener('click', () => {
        
            select.classList.toggle('select-clicked');
            caret.classList.toggle('caret-rotate');
            menu.classList.toggle('menu-open');
        })

        // Loop through all option elements.
        options.forEach(option => {
            // Add a click event to the option element.
            option.addEventListener('click', () => {

                // Set map to selected training area.
                map.panTo(trainingAreas[option.innerText]);

                selected.innerText = option.innerText;
                select.classList.remove('select-clicked');
                caret.classList.remove('caret-rotate');
                menu.classList.remove('menu-open');

                options.forEach(option => {
                    option.classList.remove('active');
                })
                option.classList.add('active');
            })
        })
    })
}

initDropdown();

// Initialize Google Maps with Google Maps API.
function initMap() {
    // Set centre as Lor Asrama and styles sets map to dark mode.
    var options = {
        zoom: 15,
        center: {lat: 1.412811, lng: 103.774780},
        mapTypeControl: true,
        clickableIcons: false,
        disableDefaultUI: true,
        disableDoubleClickZoom: true,
        keyboardShortcuts: false,
        styles: [
            { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
            { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
            { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
            {
              featureType: "administrative.locality",
              elementType: "labels.text.fill",
              stylers: [{ color: "#d59563" }],
            },
            {
              featureType: "poi",
              elementType: "labels.text.fill",
              stylers: [{ color: "#d59563" }],
            },
            {
              featureType: "poi.park",
              elementType: "geometry",
              stylers: [{ color: "#263c3f" }],
            },
            {
              featureType: "poi.park",
              elementType: "labels.text.fill",
              stylers: [{ color: "#6b9a76" }],
            },
            {
              featureType: "road",
              elementType: "geometry",
              stylers: [{ color: "#38414e" }],
            },
            {
              featureType: "road",
              elementType: "geometry.stroke",
              stylers: [{ color: "#212a37" }],
            },
            {
              featureType: "road",
              elementType: "labels.text.fill",
              stylers: [{ color: "#9ca5b3" }],
            },
            {
              featureType: "road.highway",
              elementType: "geometry",
              stylers: [{ color: "#746855" }],
            },
            {
              featureType: "road.highway",
              elementType: "geometry.stroke",
              stylers: [{ color: "#1f2835" }],
            },
            {
              featureType: "road.highway",
              elementType: "labels.text.fill",
              stylers: [{ color: "#f3d19c" }],
            },
            {
              featureType: "transit",
              elementType: "geometry",
              stylers: [{ color: "#2f3948" }],
            },
            {
              featureType: "transit.station",
              elementType: "labels.text.fill",
              stylers: [{ color: "#d59563" }],
            },
            {
              featureType: "water",
              elementType: "geometry",
              stylers: [{ color: "#17263c" }],
            },
            {
              featureType: "water",
              elementType: "labels.text.fill",
              stylers: [{ color: "#515c6d" }],
            },
            {
              featureType: "water",
              elementType: "labels.text.stroke",
              stylers: [{ color: "#17263c" }],
            },
          ]
    };

    // Initialize map.
    map = new google.maps.Map(document.getElementById('map'), options);

    // Initialize training areas.
    trainingAreas = {
        'Lorong Asrama': new google.maps.LatLng(1.412811, 103.774780),
        'Tekong': new google.maps.LatLng(1.414904127505336, 104.03877925542783),
    }

    // For dotted lines between checkpoints.
    var lineSymbol = {
        path: 'M 0, -1 0, 1',
        strokeOpacity: 1,
        scale: 3
    }

    // Setup Polylines.
    poly = new google.maps.Polyline({
        strokeColor: "#000000",
        strokeOpacity: 0,
        icons: [{
            icon: lineSymbol,
            offset: '0',
            repeat: '20px'
        }]
    });

    // Initialize polylines.
    poly.setMap(map);

    // Listener to add markers upon user click.
    map.addListener("click", function(e) {
    	addLatLng(e.latLng, map);
    })
}

function addLatLng(position, map) {
    // Add marker to map.
    const marker = new google.maps.Marker({
        position: position,
        map: map,
    })

	marker.setAnimation(google.maps.Animation.DROP);

    // Add unique ID to each marker for easier deletion.
    marker.id = uniqueID;
    uniqueID++;

    // Initialize infowindow for each marker.
    const content = 
		'<div id="infowindow">' + 
		'<input type="button" value="Delete" onclick="deleteMarker('+ marker.id +')"/>' +
		'</div>';
    const infowindow = new google.maps.InfoWindow({
      	content: content
    })

    // Add even listener to markers.
    marker.addListener("click", function(e) {
      	infowindow.open(map, marker);
    })

    markers.push(marker);

    // MVC-array that stores coordinates.
    const path = poly.getPath();
    path.push(position);
}

// Delete specific marker.
function deleteMarker(id) {
  	for (var i = 0; i < markers.length; i++) {
    	if (markers[i].id == id) {
      		// Remove the marker from the map.
			markers[i].setMap(null);

			// Remove the marker from the markers array.
			markers.splice(i, 1);
    }
  }
  
	// Refresh polyline path so that it no longer follows deleted marker.
	poly.setPath(markers.map(marker => marker.position));
}

// Delete all markers.
function deleteMarkers() {
    for (let i = 0; i < markers.length; i++) {
        markers[i].setMap(null);
    }

    // Clear polylines.
    const path = poly.getPath();
    path.clear();

    // Clear markers.
    markers = [];
}

// Transform Google Map coordinates into the MGR that we use.
function transformCoordinates() {
    // Set the source and target projections.
    const srcEpsg = 4326; // WGS 84
    const dstEpsg = 3168; // Kertau (RSO) / RSO Malaya

    // path is the MVC-array of the points the user clicked on the map.
    const path = poly.getPath();
    let data = "";

    // Format data for URL. For each point the user chose, add it to data.
    path.getArray().forEach(function(point) {
        data += point.lng().toString() + ',' + point.lat().toString() + ';';
    })

    // Dynamic script tag. API transforms multiple coordinates at a time.
    const script = document.createElement('script');
    script.src = `https://epsg.io/trans?data=${data.slice(0, -1)}&s_srs=${srcEpsg}&t_srs=${dstEpsg}&callback=getNDS`; // Callback function getNDS
    document.body.appendChild(script);
}

function calcAzimuth(eDiff, nDiff) {
    if (eDiff == 0) {
        // Vertical
        if (nDiff > 0) {
            // Upwards
            return 6400;
        } else {
            // Downwards
            return 3200;
        }
    } else {
        let angle = Math.atan(nDiff / eDiff);
        if (eDiff > 0) {
            // 1st & 4th quadrant
            return Math.floor(1600 - (angle / (2 * Math.PI) * 6400));
        } else {
            // 2nd & 3rd quadrant
            return Math.floor(4800 - (angle / (2 * Math.PI) * 6400));
        }
    }
}

function createCell(type, text) {
    const data = document.createElement(type);
    const node = document.createTextNode(text);
    data.appendChild(node);

    return data;
}

function generateTable(points, azimuths, ptDists) {
    const tableDiv = document.getElementById("table-div");
    const table = document.createElement("table");

    // Insert table headers
    const headers = document.createElement("tr");
    
    headers.appendChild(createCell("th", "No."));
    headers.appendChild(createCell("th", "Start MGR"));
    headers.appendChild(createCell("th", "End MGR"));
    headers.appendChild(createCell("th", "Mil"));
    headers.appendChild(createCell("th", "Dist."));

    table.appendChild(headers);

    // Insert data
    for (let i=0; i<azimuths.length; i++) {
        const row = document.createElement("tr");

        row.appendChild(createCell("td", i+1));
        row.appendChild(createCell("td", Math.floor(points[i].e).toString() + ' ' +  Math.floor(points[i].n).toString()));
        row.appendChild(createCell("td", Math.floor(points[i+1].e).toString() + ' ' +  Math.floor(points[i+1].n).toString()));
        row.appendChild(createCell("td", azimuths[i]));
        row.appendChild(createCell("td", ptDists[i]));

        table.appendChild(row);
    }

    tableDiv.replaceChildren(table);
}

function addUserMGR() {
	// Extract MGR from input box.
	var inputBox = document.getElementById("mgr-input-box")
	const mgr = inputBox.value;
  
	// Invalid MGR.
	if (mgr.length != 8 | isNaN(mgr)) {
		document.getElementById("mgr-input-result").innerHTML = "Invalid MGR.";
	} else {
		// Valid MGR.
		document.getElementById("mgr-input-result").innerHTML = "Your MGR has been added!";
		const srcEpsg = 3168; // Kertau (RSO) / RSO Malaya
		const dstEpsg = 4326; // WGS 84
		const lng = "".concat("6", mgr.slice(0, 4), "0");
		const lat = "".concat("1", mgr.slice(4, 8), "0");
	
		// Convert MGR to coordinates used by Google Maps.
		const script = document.createElement('script');
		script.src = `https://epsg.io/trans?x=${lng}&y=${lat}&s_srs=${srcEpsg}&t_srs=${dstEpsg}&callback=getUserPoint`;
		document.body.appendChild(script);
	}
  	inputBox.value = "";
}

// JSONP callback function for adding users point on the map.
function getUserPoint(response) {
	var position = new google.maps.LatLng(parseFloat(response.y), parseFloat(response.x))
	addLatLng(position, map);
}

// JSONP callback function that receives JSON data from espg API.
function getNDS(response) {
    // Store transformed MGRS.
    const mgrs = [];

    // Loop through JSON data and add data to mgrs array.
    response.forEach(function(point) {
        mgrs.push({e: parseInt(point.x.slice(1, 5)), n: parseInt(point.y.slice(1, 5))});
    })
    
    let interval;

    // Check for interval radio button.
    if (document.getElementById("day").checked) {
        // Day
        interval = 100;
    } else {
        // Night
        interval = 50;
    }

    const points = [mgrs[0]];
    const ptDists = [];
    const azimuths = [];

    // Format MGRS data.
    for (let i = 1; i < mgrs.length; i++) {
        // Previous point.
        let easting = mgrs[i - 1].e;
        let northing = mgrs[i - 1].n;

        // Calculate distance & azimuth between 2 points
        const eDiff = mgrs[i].e - easting;
        const nDiff = mgrs[i].n - northing;
        const dist = ((eDiff ** 2 + nDiff ** 2) ** 0.5) / (interval / 10);
        const azimuth = calcAzimuth(eDiff, nDiff);

        // Derive Easting & Northing increments for subpoints
        const eIncrement = eDiff / dist;
        const nIncrement = nDiff / dist;

        // Creating subpoints
        for (let j = 0; j < Math.floor(dist); j++) {
            easting += eIncrement;
            northing += nIncrement;

            points.push({e: easting, n: northing});
            ptDists.push(interval);
            azimuths.push(azimuth);
        }

        // If distance < interval or if distance not perfectly divisible by interval
        const remainder = dist - Math.floor(dist);
        easting += remainder * eIncrement;
        northing += remainder * nIncrement;

        points.push({e: easting, n: northing});
        ptDists.push(Math.floor(remainder * interval));
        azimuths.push(azimuth);
    }

    new generateTable(points, azimuths, ptDists);
}