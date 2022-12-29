let map;
let poly;
const interval = 50;

function initMap() {
    // Set centre as Lor Asrama.
    var options = {
        zoom: 15,
        center: {lat: 1.412811, lng: 103.774780}
    };

    map = new google.maps.Map(document.getElementById('map'), options);
    
    // Setup Polylines
    poly = new google.maps.Polyline({
        strokeColor: "#000000",
        strokeOpacity: 1.0,
        strokeWeight: 1,
    });

    poly.setMap(map);

    // Listener to add markers
    map.addListener("click", function(e) {
        addLatLng(e.latLng, map);
    })
}

function addLatLng(position, map) {
    // Add marker to map.
    new google.maps.Marker({
        position: position,
        map: map,
    })

    // MVCarray
    const path = poly.getPath();
    path.push(position);
}

function transformCoordinates() {
    // Set the source and target projections.
    const srcEpsg = 4326;
    const dstEpsg = 3168;

    // Set the coordinates to transform.
    let path = poly.getPath();

    const transformedCoordinates = [];

    // Get a promise that resolves with the transformed coordinates.
    return new Promise((resolve, reject) => {
        // Loop through the coordinates array.
        path.forEach(function(coord) {
            // Extract the longitude and latitude.
            const lat = coord.lat();
            const lng = coord.lng();

            // Build the URL for the request.
            const url = `http://epsg.io/trans?x=${lng}&y=${lat}&s_srs=${srcEpsg}&t_srs=${dstEpsg}&callback=jsonpFunction`;

            // Create a script element to make the JSONP request.
            const script = document.createElement('script');
            script.src = url;
            document.body.appendChild(script);
        })

        // Define the callback function to handle the response.
        window.jsonpFunction = function(response) {
            // Add the transformed coordinates to the array.
            transformedCoordinates.push({x: response.x, y: response.y});

            // Check if all coordinates have been transformed.
            if (transformedCoordinates.length === path.length) {
                // All coordinates have been transformed, so resolve the promise with the result.
                resolve(transformedCoordinates);
            }
        }
    })
}

function getPoints(point1, point2, interval) {
    const xDistance = point1.x - point2.x;
    const yDistance = point1.y - point2.y;
    const distance = Math.sqrt(xDistance ** 2 + yDistance ** 2);
    const numberOfPoints = Math.floor(distance / interval);

    const xStep = xDistance / numberOfPoints;
    const yStep = yDistance / numberOfPoints;

    const points = [];

    for (i = 1; i <= numberOfPoints; i++) {
        points.push({x: point1.x + i * xStep, y: point1.y + i * yStep});
    }

    points.push({x: point2.x, y: point2.y});
    return points;
}

function getNDS() {
    let promise = transformCoordinates();
    promise.then(coordinates => {
        console.log(coordinates);
        const nds = [];
        for (i = 1; i < coordinates.length; i++) {
            const point1 = coordinates[i - 1];
            const point2 = coordinates[i];
            const subpoints = getPoints(point1, point2, interval);
            nds.push(subpoints);
        }
        console.log(nds);
    })
}
