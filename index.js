let map, poly, infowindow, activeMarker;
let uniqueID = 1;
let markers = [];
const TRAINING_AREAS = {
    "Ama Keng": {"lat": 1.403703, "lng": 103.702338, "zoom": 15},
    "Jalan Bahar": {"lat": 1.359666, "lng": 103.674655, "zoom": 14},
    "Jalan Bathera": {"lat": 1.409809, "lng": 103.683807, "zoom": 14},
    "Lorong Asrama": {"lat": 1.412811, "lng": 103.774780, "zoom": 15},
    "Lower Mandai": {"lat": 1.348384, "lng": 103.812913, "zoom": 15},
    "Marsling": {"lat": 1.400156, "lng": 103.771155, "zoom": 15},
    "Tekong": {"lat": 1.412587, "lng": 104.038093, "zoom": 14}
}
const SINGAPORE_BOUNDS = {
    north: 1.466878,
    south: 1.211860,
    west: 103.584676,
    east: 104.114079,
}

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
                const area = TRAINING_AREAS[option.innerText];
                const latlng = new google.maps.LatLng(area.lat, area.lng);
                map.setZoom(area.zoom);
                map.panTo(latlng);

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

// Initialize buttons that toggle map types.
function initMapToggles() {
    const mapButtons = document.querySelectorAll('.map-toggle input[type="radio"]');
    mapButtons.forEach(button => {
        button.addEventListener("change", () => {
            map.setMapTypeId(button.id);
        })
    })
}

initMapToggles();

// Initialize Google Maps with Google Maps API.
function initMap() {
    var options = {
        zoom: 15,
        center: {lat: 1.412811, lng: 103.774780},  // Lorong Asrama
        restriction: {
            latLngBounds: SINGAPORE_BOUNDS,
            strictBounds: false,
        },
        mapTypeControl: false,
        clickableIcons: false,
        disableDefaultUI: true,
        disableDoubleClickZoom: true,
        keyboardShortcuts: false,
        styles: [  // Dark Mode
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

    // Define the options to make lines between checkpoints dotted.
    var lineSymbol = {
        path: 'M 0, -1 0, 1',
        strokeOpacity: 1,
        scale: 3
    }

    // Setup Polylines object which creates lines between checkpoints..
    poly = new google.maps.Polyline({
        strokeColor: "#000000",
        strokeOpacity: 0,
        icons: [{
            icon: lineSymbol,
            offset: '0',
            repeat: '20px'
        }]
    });

    // Initialize polylines onto maps.
    poly.setMap(map);

    // Initialize infowindow for each marker.
    const content = 
		'<div id="infowindow">' + 
        '<button onclick="deleteMarker()">Delete</button>' +
		'</div>';
    infowindow = new google.maps.InfoWindow({content: content})

    // Add markers to map upon user click.
    map.addListener("click", e => addLatLng(e.latLng, map))
}

function addLatLng(position, map) {
    // Add marker to map.
    const marker = new google.maps.Marker({
        position: position,
        draggable: true,
        map: map,
    })

    // Add unique ID to each marker for easier deletion.
    marker.id = uniqueID;
    uniqueID++;

    // Add even listener to markers.
    marker.addListener("click", () => {
        infowindow.open(map, marker);
        activeMarker = marker.id;
    })

    // Update polylines when marker is dragged.
    marker.addListener("dragend", () => poly.setPath(markers.map(marker => marker.position)));

    // Update markers array.
    markers.push(marker);

    // MVC-array that stores coordinates.
    const path = poly.getPath();
    path.push(position);
}

// Delete specific marker.
function deleteMarker() {
  	for (var i = 0; i < markers.length; i++) {
    	if (markers[i].id == activeMarker) {
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

// JSONP callback function that receives JSON data from espg API.
function getNDS(response) {
    // Store transformed MGRS.
    const mgrs = [];

    // Loop through JSON data and add data to mgrs array.
    response.forEach(function(point) {
        mgrs.push({e: parseInt(point.x.slice(1, 5)), n: parseInt(point.y.slice(1, 5))});
    })
    
    // Check for interval radio button.
    let interval;

    if (document.getElementById("day").checked) {
        // Day
        interval = 100;
    } else {
        // Night
        interval = 50;
    }

    // Create image to show water only
    const center = map.getCenter();

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = `https://maps.googleapis.com/maps/api/staticmap?maptype=roadmap&center=${center.lat()},${center.lng()}&scale=1&zoom=15&size=640x640&style=feature:administrative|visibility:off&style=feature:landscape|visibility:off&style=feature:poi|visibility:off&style=feature:road|visibility:off&style=feature:transit|visibility:off&style=feature:water|color:0x00ff00&style=element:labels|visibility:off&key=AIzaSyBP9pYHfZKn0Ts4xt7eV89X-3YH6ohAKJQ`;

    img.onload = function() {
        // Initialize grid for pathfinding
        const grid = initGrid(img);

        const points = [mgrs[0]];
        const ptDists = [];
        const azimuths = [];
        const path = poly.getPath();

        // orginalMGR[i] is true if the ith MGR is in the original MGR list.
        // This array is used for highlighting the original MGRS in the NDS table.
        const originalMGR = [true];

        // Format MGRS data.
        for (let i = 1; i < mgrs.length; i++) {
            // Previous point.
            let easting = mgrs[i - 1].e;
            let northing = mgrs[i - 1].n;

            let lat = path.getAt(i-1).lat();
            let lng = path.getAt(i-1).lng();

            // Calculate distance & azimuth between 2 points
            const eDiff = mgrs[i].e - easting;
            const nDiff = mgrs[i].n - northing;
            const dist = ((eDiff ** 2 + nDiff ** 2) ** 0.5) / (interval / 10);
            const azimuth = calcAzimuth(eDiff, nDiff);

            const latDiff = path.getAt(i).lat() - lat;
            const lngDiff = path.getAt(i).lng() - lng;

            // Derive Easting & Northing increments for subpoints
            const eIncrement = eDiff / dist;
            const nIncrement = nDiff / dist;

            const latIncrement = latDiff / dist;
            const lngIncrement = lngDiff / dist;

            // Creating subpoints
            for (let j = 0; j < Math.floor(dist); j++) {
                // Check if subpoint is on water
                const pxCoordinates = latLngToPx(lat + latIncrement, lng + lngIncrement, center.lat(), center.lng(), 15); // ### PLACEHOLDER CENTER LATLNG! CHANGE LTR ###
                if (isWater(pxCoordinates, img)) {
                    // Shift to path finding
                    console.log('w', easting+eIncrement, northing+nIncrement);
                } else {
                    console.log('n', easting+eIncrement, northing+nIncrement);
                }
                // ### SHIFT THIS PART TO ELSE AFTER IMPLEMENTING PATH FINDING ###
                lat += latIncrement;
                lng += lngIncrement;

                easting += eIncrement;
                northing += nIncrement;

                points.push({e: easting, n: northing});
                ptDists.push(interval);
                azimuths.push(azimuth);

                originalMGR.push(false);
            }

            // If distance < interval or if distance not perfectly divisible by interval
            const remainder = dist - Math.floor(dist);

            // Check if point is on water
            const pxCoordinates = latLngToPx(lat + remainder * latIncrement, lng + remainder * lngIncrement, center.lat(), center.lng(), 15); // ### PLACEHOLDER CENTER LATLNG! CHANGE LTR ###
            if (isWater(pxCoordinates, img)) {
                // Implement path finding
                console.log('w', easting+remainder*eIncrement, northing+remainder*nIncrement);
            } else {
                console.log('n', easting+remainder*eIncrement, northing+remainder*nIncrement);
            }
            // ### SHIFT THIS PART TO ELSE AFTER IMPLEMENTING PATH FINDING ###
            easting += remainder * eIncrement;
            northing += remainder * nIncrement;

            points.push({e: easting, n: northing});
            ptDists.push(Math.floor(remainder * interval));
            azimuths.push(azimuth);

            originalMGR.push(true);
        }

        // Make the last entry highlighted as well.
        originalMGR[azimuths.length - 1] = true;
        new generateTable(points, azimuths, ptDists, originalMGR);
    }
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

function generateTable(points, azimuths, ptDists, originalMGR) {
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
    for (let i = 0; i < azimuths.length; i++) {
        const row = document.createElement("tr");
        const startMGR = Math.floor(points[i].e).toString() + ' ' +  Math.floor(points[i].n).toString();
        const endMGR = Math.floor(points[i + 1].e).toString() + ' ' +  Math.floor(points[i + 1].n).toString();

        row.appendChild(createCell("td", i + 1));
        row.appendChild(createCell("td", startMGR));
        row.appendChild(createCell("td", endMGR));
        row.appendChild(createCell("td", azimuths[i]));
        row.appendChild(createCell("td", ptDists[i]));

        table.appendChild(row);

        // If current row contains an orignal MGR the user entered, highlight it.
        if (originalMGR[i] === true) {
            row.setAttribute('style', 'color: #FAEBAF');
        }
    }

    tableDiv.replaceChildren(table);
}

// Create invisible canvas to show water areas
function createCanvas(center) {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = `https://maps.googleapis.com/maps/api/staticmap?maptype=roadmap&center=${center.lat()},${center.lng()}&scale=1&zoom=15&size=640x640&style=feature:administrative|visibility:off&style=feature:landscape|visibility:off&style=feature:poi|visibility:off&style=feature:road|visibility:off&style=feature:transit|visibility:off&style=feature:water|color:0x00ff00&style=element:labels|visibility:off&key=AIzaSyBP9pYHfZKn0Ts4xt7eV89X-3YH6ohAKJQ`;

    img.onload = function() {
        const canvas = document.getElementById("water-canvas");
        canvas.getContext("2d", {willReadFrequently: true}).drawImage(img, 0, 0, img.width, img.height);
    };
}

// Initialize 2D array Grid
function initGrid(img) {
    // Draw img onto canvas    
    const canvas = document.getElementById("water-canvas");
    canvas.getContext("2d", {willReadFrequently: true}).drawImage(img, 0, 0, img.width, img.height);

    // Get array of RGBA values
    const imgData = canvas.getContext("2d", {willReadFrequently: true}).getImageData(0, 0, 640, 640).data;
    
    var grid = [];

    const height = 640;
    const width = 640;

    for (let x=0; x<width; x++) {
        for (let y=0; y<height; y++) {
            var point = {
                g: NaN,
                h: NaN
            };

            // Check if corresponding pixel is water
            if (imgData[(y * width + x) * 4 + 1] === 255) {
                point.water = true;
            } else {
                point.water = false;
            }

            grid.push(point);
        }
    }
    return grid;
}

// Point (LatLng) to pixel coordinate on Google Static Map
function latLngToPx(lat, lng, clat, clng, zoom) {
    const degreesPerMeterAtEquator = 360 / (2 * Math.PI * 6378137)
    const metresAtEquatorPerTilePx = 156543.03392 / (2 ** zoom)

    const latIncrementPerTilePx = degreesPerMeterAtEquator * Math.cos(lat * Math.PI / 180) * metresAtEquatorPerTilePx
    const lngIncrementPerTilePx = degreesPerMeterAtEquator * metresAtEquatorPerTilePx

    const diffLat = clat - lat;
    const diffLng = clng - lng;

    const pxCoordinates = {
        x: Math.round(320 - diffLng / lngIncrementPerTilePx),
        y: Math.round(320 + diffLat / latIncrementPerTilePx)
    };

    return pxCoordinates;
}

// Check if point is water using on canvas
function isWater(pxCoordinates, img) {
    // Draw image onto canvas
    var canvas = document.getElementById("water-canvas");
    var ctx = canvas.getContext("2d", {willReadFrequently: true});
    ctx.clearRect(0, 0, 640, 640);
    ctx.drawImage(img, 0, 0, img.width, img.height);
    
    // Get RGBA of target pixel
    var data = ctx.getImageData(pxCoordinates.x, pxCoordinates.y, 1, 1).data;

    if (data[1] === 255) {
        return true;
    } 

    return false;
}

// Pathfinding to traverse around water obstacle (A* algorithm)
/*function findPath(startPx, endPx, grid) {

}*/


/*
var astar = {
  init: function(grid) {
    for(var x = ; x < grid.length; x++) {
      for(var y = ; y < grid[x].length; y++) {
        grid[x][y].f = ;
        grid[x][y].g = ;
        grid[x][y].h = ;
        grid[x][y].debug = "";
        grid[x][y].parent = null;
      }  
    }
  },
  search: function(grid, start, end) {
    astar.init(grid);
 
    var openList   = [];
    var closedList = [];
    openList.push(start);
 
    while(openList.length > ) {
 
      // Grab the lowest f(x) to process next
      var lowInd = ;
      for(var i=; i<openList.length; i++) {
        if(openList[i].f < openList[lowInd].f) { lowInd = i; }
      }
      var currentNode = openList[lowInd];
 
      // End case -- result has been found, return the traced path
      if(currentNode.pos == end.pos) {
        var curr = currentNode;
        var ret = [];
        while(curr.parent) {
          ret.push(curr);
          curr = curr.parent;
        }
        return ret.reverse();
      }
 
      // Normal case -- move currentNode from open to closed, process each of its neighbors
      openList.removeGraphNode(currentNode);
      closedList.push(currentNode);
      var neighbors = astar.neighbors(grid, currentNode);
 
      for(var i=; i<neighbors.length;i++) {
        var neighbor = neighbors[i];
        if(closedList.findGraphNode(neighbor) || neighbor.isWall()) {
          // not a valid node to process, skip to next neighbor
          continue;
        }
 
        // g score is the shortest distance from start to current node, we need to check if
        //   the path we have arrived at this neighbor is the shortest one we have seen yet
        var gScore = currentNode.g + 1; // 1 is the distance from a node to it's neighbor
        var gScoreIsBest = false;
 
 
        if(!openList.findGraphNode(neighbor)) {
          // This the the first time we have arrived at this node, it must be the best
          // Also, we need to take the h (heuristic) score since we haven't done so yet
 
          gScoreIsBest = true;
          neighbor.h = astar.heuristic(neighbor.pos, end.pos);
          openList.push(neighbor);
        }
        else if(gScore < neighbor.g) {
          // We have already seen the node, but last time it had a worse g (distance from start)
          gScoreIsBest = true;
        }
 
        if(gScoreIsBest) {
          // Found an optimal (so far) path to this node.   Store info on how we got here and
          //  just how good it really is...
          neighbor.parent = currentNode;
          neighbor.g = gScore;
          neighbor.f = neighbor.g + neighbor.h;
          neighbor.debug = "F: " + neighbor.f + "<br />G: " + neighbor.g + "<br />H: " + neighbor.h;
        }
      }
    }
 
    // No result was found -- empty array signifies failure to find path
    return [];
  },
  heuristic: function(pos0, pos1) {
    // This is the Manhattan distance
    var d1 = Math.abs (pos1.x - pos0.x);
    var d2 = Math.abs (pos1.y - pos0.y);
    return d1 + d2;
  },
  neighbors: function(grid, node) {
    var ret = [];
    var x = node.pos.x;
    var y = node.pos.y;
 
    if(grid[x-1] && grid[x-1][y]) {
      ret.push(grid[x-1][y]);
    }
    if(grid[x+1] && grid[x+1][y]) {
      ret.push(grid[x+1][y]);
    }
    if(grid[x][y-1] && grid[x][y-1]) {
      ret.push(grid[x][y-1]);
    }
    if(grid[x][y+1] && grid[x][y+1]) {
      ret.push(grid[x][y+1]);
    }
    return ret;
  }
};
*/