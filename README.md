# Project Navex

## Description

We wanted to create a web application that allows the user to plot their navex checkpoints on Google Maps instantly get a navigational data sheet (NDS). The NDS contains a list of points separated by 50m or 100m from one checkpoint to the next.

### APIs Used

* Google Maps Javascript API - Used to generate map and checkpoints.
* [ESPG.io](https://github.com/maptiler/epsg.io) - Used to convert coordinates from latlng to Kertau (RSO).

## Features

User can click the map to add their points, or input them manually.

![Checkpoints](Images/screenshot1.png)

After selecting the desired interval, the NDS is automatically generated.

![NDS](Images/screenshot2.png)

## To Do

* Custom infowindow for checkpoints.
* Draggable markers.
* Highlight chosen checkpoints in NDS.
