let map;
let poly;
let markers = [];

// GOOGLE MAPS API
function initMap() {
    // Set centre as Lor Asrama.
    var options = {
        zoom: 15,
        center: {lat: 1.412811, lng: 103.774780},
        clickableIcons: false,
        disableDefaultUI: true,
        disableDoubleClickZoom: true,
        keyboardShortcuts: false
    };

    // Initialize map.
    map = new google.maps.Map(document.getElementById('map'), options);

    
    // Setup Polylines.
    poly = new google.maps.Polyline({
        strokeColor: "#000000",
        strokeOpacity: 1.0,
        strokeWeight: 1,
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

    markers.push(marker);

    // MVC-array
    const path = poly.getPath();
    path.push(position);
}


function deleteMarkers() {
    for (let i=0; i<markers.length; i++) {
        markers[i].setMap(null);
    }

    const path = poly.getPath();
    path.clear();
}

// DATA PROCESSING
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
    headers.appendChild(createCell("th", "Azimuth"));
    headers.appendChild(createCell("th", "Distance"));

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
        interval = 50;
    } else {
        // Night
        interval = 100;
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
