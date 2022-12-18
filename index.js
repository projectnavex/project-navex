let poly;
let map;
const EPSGUrl = "http://epsg.io/trans?x=0&y=0&s_srs=4326&t_srs=3168&callback=jsonpFunction";

function initMap() {
    // Set centre as Lor Asrama
    var options = {
        zoom: 15,
        center: {lat: 1.412811, lng: 103.774780}
    }
    map = new google.maps.Map(document.getElementById('map'), options)
    
    // Setup Polylines
    poly = new google.maps.Polyline({
        strokeColor: "#000000",
        strokeOpacity: 1.0,
        strokeWeight: 3,
    });
    poly.setMap(map);

    // Listener to add markers
    map.addListener("click", function(e) {
        addLatLng(e.latLng, map);
    });
}

function addLatLng(position, map) {
    new google.maps.Marker({
        position: position,
        map: map,
    })

    const path = poly.getPath(); // MVCarray
    path.push(position);

    document.getElementById("latlngs").innerHTML = path.getArray()[0].lat();
}

function convertToMGR() {
    const latlngs = poly.getPath().getArray();
    const mgrs = [];

    for (let i=0; i<latlngs.length; i++) {
        $.getJSON(`http://epsg.io/trans?x=${latlngs[i].lat()}&y=${latlngs[i].lng()}&s_srs=4326&t_srs=3168&callback=jsonpFunction`, function(result){
            let mgr = JSON.parse(result);
            alert(parseInt(mgr.x).toString() + parseInt(mgr.y).toString());
            mgrs[i] = parseInt(mgr.x).toString() + parseInt(mgr.y).toString();
        });
    }

    document.getElementById("button-test").innerHTML = mgrs;
}