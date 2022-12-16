function initMap() {
    var options = {
        zoom: 15,
        center: {lat: 1.412811, lng: 103.774780}
    }
    var map = new google.maps.Map(document.getElementById('map'), options)
    map.addListener("click", function(e) {
        addLatLng(e.latLng, map);
    });
}

function addLatLng(position, map) {
    new google.maps.Marker({
        position: position,
        map: map,
    })
    alert(position)
}