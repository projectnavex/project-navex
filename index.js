let poly;
let map;

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
    });
}

function addLatLng(position, map) {
    // Add marker to map.
    new google.maps.Marker({
        position: position,
        map: map,
    });
    const path = poly.getPath(); // MVCarray
    path.push(position);
    document.getElementById("latlngs").innerHTML = path.getArray()[0].lat();
}

async function transformCoordinates() {
    // Set the source and target projections.
    const srcEpsg = 4326;
    const dstEpsg = 3168;

    // Set the coordinates to transform.
    let path = poly.getPath();

    path.forEach(function(latlng) {
        const transformedCoordinates = [];
        const lat = latlng.lat();
        const lng = latlng.lng();

        const url = `http://epsg.io/trans?x=${lng}&y=${lat}&s_srs=${srcEpsg}&t_srs=${dstEpsg}&callback=jsonpFunction`;
        
        // Create a script element to make the JSONP request.
        const script = document.createElement('script');
        script.src = url;
        document.body.appendChild(script);

        // Define the callback function to handle the response.
        window.jsonpFunction = function(response) {
            // Add the transformed coordinates to the array.
            transformedCoordinates.push({x: response.x, y: response.y});

            // Check if all coordinates have been transformed.
            if (transformedCoordinates.length === path.length) {
                console.log(transformedCoordinates);
            }
        }
    });
}
