import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { delay } from 'bluebird';
import GoogleMapReact from 'google-map-react';
import * as ClickListenerFactory from '../markers/clicklistenerfactory';
import * as toGoogle from '../togoogle.js';
import * as MarkerWithLabel from '../markers/markerWithLabel';
import { getMarkerIconFleetView, getMarkerIconIndividualHistory, getStatusColor } from "../../common/status";
import * as tomiles from "../tomiles";
import * as appState from '../appState';

const defaults = {
  center: {
    lat: 50,
    lng: -98.35,
  },
  zoom: 4
};

function Map({
  animationPlaying,
  animationSpeed,
  autoUpdate,
  hist,
  impliedSelectedVehiclesByID,
  selectedHistoryItemID,
  selectedMapVehicleID,
  split,
  vehiclesByID}) {
  const [map, setMap] = useState(null);
  const [markersByVehicleID, setMarkersByVehicleID] = useState({});
  const [historyMarkersByID, setHistoryMarkersByID] = useState({});
  const [linesByHistoryItemID, setLinesByHistoryItemID] = useState({});
  const [animationPromise, setAnimationPromise] = useState(Promise.resolve());
  const [currentAnimationFrame, setCurrentAnimationFrame] = useState(0);
  const [previousHistoryItem, setPreviousHistoryItem] = useState(null);

  const maybeRepositionMap = bounds => {
    if (autoUpdate) {
      delay(100).then(() => {
        map.fitBounds(bounds);
      });
    }
  };

  const createMarker = vehicle => {
    const position = toGoogle(vehicle.last);
  
    const marker = new MarkerWithLabel({
      position,
      map,
      title: vehicle.name,
      labelContent: vehicle.name,
      labelAnchor: new google.maps.Point(0, 0),
      labelClass: "maplabel", // the CSS class for the label
      labelInBackground: false
    });
  
    marker.la = vehicle.last.la;
    marker.lo = vehicle.last.lo;

    marker.setIcon(getMarkerIconFleetView(vehicle.last));

    google.maps.event.addListener(
      marker,
      "click",
      ClickListenerFactory.create(marker, vehicle, position, map)
    );
  
    return marker;
  }

  const createHistoryMarkerAndLine = historyItem => {
    const position = toGoogle(historyItem);
    if (!position) {
      console.warn("Invalid vehicle position " + JSON.stringify(historyItem));
      return;
    }

    const icon = getMarkerIconIndividualHistory(historyItem);

    const marker = new google.maps.Marker({
      position: position,
      map,
      title: historyItem.name
    });

    if (icon == null) {
      // hide extraneous "moving" markers
      marker.setVisible(false);
    } else {
      marker.setIcon(icon);
    }

    google.maps.event.addListener(
      marker,
      "click",
      ClickListenerFactory.create(marker, historyItem, position, map)
    );

    if (selectedHistoryItemID === historyItem.id) {
      new google.maps.event.trigger(marker, 'click');
    }

    // now draw lines
    let line = null;

    if (previousHistoryItem) {
      const flightPlanCoordinates = [toGoogle(previousHistoryItem), toGoogle(historyItem)];
      const speed = tomiles(historyItem.s)
      const color = getStatusColor(historyItem);
      const lineSymbol = { path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW };
      if (
        flightPlanCoordinates &&
        flightPlanCoordinates.length == 2 &&
        flightPlanCoordinates[0] != null &&
        flightPlanCoordinates[1] != null
      ) {
        line = new google.maps.Polyline({
            path: flightPlanCoordinates,
            // https://developers.google.com/maps/documentation/javascript/examples/overlay-symbol-arrow
            // icons: [{
            // 	icon: lineSymbol,
            // 	offset: '50%'
            // }],
            geodesic: true,
            strokeColor: color,
            strokeOpacity: 0.8,
            strokeWeight: 3,
            // position: loc,
            map,
            // title: i + ''
          });
      }
    }

    setPreviousHistoryItem(historyItem);

    return {
      marker,
      line
    };
  }

  const clickMarkerByHistoryID = id => {
    const marker = historyMarkersByID[id];
    if (marker) {
      new google.maps.event.trigger(marker, "click");
    }
  };

  const clickMarkerByVehicleID = id => {
    const marker = markersByVehicleID[id];  
    if (marker) {
      new google.maps.event.trigger(marker, "click");
    }
  };

  const removeMapMarkers = () => {
    Object.keys(linesByHistoryItemID).forEach(key => {
      linesByHistoryItemID[key].setMap(null);
      delete linesByHistoryItemID[key];
    });

    Object.keys(historyMarkersByID).forEach(key => {
      historyMarkersByID[key].setMap(null);
      delete historyMarkersByID[key];
    })

    Object.keys(impliedSelectedVehiclesByID).forEach(key => {
      const vehicle = impliedSelectedVehiclesByID[key];
      if (vehicle && markersByVehicleID[vehicle.id]) {
        markersByVehicleID[vehicle.id].setMap(null);
        delete markersByVehicleID[vehicle.id];
      } else {
        console.warn(key + ' missing from impliedSelectedVehiclesByID' )
      }
    });
  }

  const nextAnimation = () => {
    const bounds = new google.maps.LatLngBounds();
    console.log(currentAnimationFrame);
    console.log(hist.length);
    if (currentAnimationFrame < hist.length) {
      return delay(500).then(() => {
        const item = hist[currentAnimationFrame];
        const { marker, line } = createHistoryMarkerAndLine(item);
        if (marker) {
          historyMarkersByID[item.id] = marker;
          bounds.extend(marker.position);
          maybeRepositionMap(bounds);
        }
        if (!animationPlaying || currentAnimationFrame >= history.length - 1) {
          playing = false;
          paused = false;
        } else {
          setCurrentAnimationFrame(currentAnimationFrame + 1);
          nextAnimation();
        }
      });
    }
  }

  const repopulateVehicleHistoryMarkers = () => {
    const bounds = new google.maps.LatLngBounds();

    Object.keys(historyMarkersByID).forEach(key => {
      historyMarkersByID[key].setMap(null);
      delete historyMarkersByID[key];
    });

    Object.keys(linesByHistoryItemID).forEach(key => {
      linesByHistoryItemID[key].setMap(null);
      delete linesByHistoryItemID[key];
    });

    if (selectedVehicle) {
      // individual vehicle history
      if (!animationPlaying) {
        hist.forEach(item => {
          const { marker, line } = createHistoryMarkerAndLine(item);
          historyMarkersByID[item.id] = marker;
          if (line) {
            // may be null
            linesByHistoryItemID[item.id] = line;
          }
          if (marker) {
            bounds.extend(marker.position);
          }
        });  
        maybeRepositionMap(bounds);
      } else {
        // TODO fixup
        nextAnimation();
      }
    }
  }

  const repopulateMapMarkers = () => {
    const bounds = new google.maps.LatLngBounds();

    // Delete markers for vehicles not shown anymore
    Object.keys(markersByVehicleID).forEach(key => {
      if (impliedSelectedVehiclesByID[key] == null) {
        markersByVehicleID[key].setMap(null);
        delete markersByVehicleID[key];
      }
    })

    Object.keys(impliedSelectedVehiclesByID).forEach(key => {
      const vehicle = impliedSelectedVehiclesByID[key];
      if (vehicle && vehicle.id && vehicle.last) {
        if (markersByVehicleID[vehicle.id]) {
          const oldMarker = markersByVehicleID[vehicle.id];
          if (oldMarker.la === vehicle.last.la && oldMarker.lo === vehicle.last.lo) {
            // The below doesn't work due to floating points
            // if (oldMarker.position.lat() === vehicle.last.la && oldMarker.position.lng() === vehicle.last.lo) {
            // console.log(`same position for ${vehicle.name}`);
            bounds.extend(oldMarker.position);
            return;
          } else {
            markersByVehicleID[vehicle.id].setMap(null);
            delete markersByVehicleID[vehicle.id];
          }
        }

        const marker = createMarker(vehicle);
        if (marker) {
          bounds.extend(marker.position);
          markersByVehicleID[vehicle.id] = marker;
          if (selectedMapVehicleID === vehicle.id) {
            new google.maps.event.trigger(marker, 'click');
          }
        }
      }
    });

    appState.setMarkersByVehicleID(markersByVehicleID);
    maybeRepositionMap(bounds);
  }

  useEffect(() =>  {
    repopulateMapMarkers();
    repopulateVehicleHistoryMarkers();

    return () => {
      removeMapMarkers();
    }
  }, [impliedSelectedVehiclesByID])

  const handleApiLoaded = (suppliedMap, maps) => {
    setMap(suppliedMap.map);
    appState.setMap(suppliedMap.map);
  };

  // componentWillUnmount() {
  //   this.removeMapMarkers();
  // }

  // componentDidUpdate() {
  //   this.repopulateVehicleHistoryMarkers();
  //   this.repopulateMapMarkers();
  // }

  return (
    // Important! Always set the container height explicitly
    <div style={{
        height: split ? '50vh' : '75vh',
        width: '100%'
      }}>
      <GoogleMapReact
        bootstrapURLKeys={{ key: '1234' }}
        defaultCenter={defaults.center}
        defaultZoom={defaults.zoom}
        onGoogleApiLoaded={ handleApiLoaded } 
        yesIWantToUseGoogleMapApiInternals
      >          
      </GoogleMapReact>
    </div>
  )
}

export default connect(
  state => ({
    animationSpeed: state.animationSpeed,
    animationPlaying: state.animationPlaying,
    autoUpdate: state.autoUpdate,
    hist: state.selectedVehicleHistory,
    impliedSelectedVehiclesByID: state.impliedSelectedVehiclesByID,
    selectedFleets: state.selectedFleets,
    selectedFleetsAll: state.selectedFleetsAll,
    selectedHistoryItemID: state.selectedHistoryItemID,
    selectedMapVehicleID: state.selectedMapVehicleID,
    selectedVehicle: state.selectedVehicle,
    vehiclesByID: state.vehiclesByID,
  }),
  {

  }
)(Map);
