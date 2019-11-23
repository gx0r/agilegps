import * as React from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import GoogleMapReact from 'google-map-react';

import * as ClickListenerFactory from '../markers/clicklistenerfactory';
import * as toGoogle from '../togoogle.js';
import * as MarkerWithLabel from '../markers/markerWithLabel';
import { getMarkerIconFleetView, getMarkerIconIndividualHistory, getStatusColor } from "../../common/status";
import * as tomiles from "../tomiles";
import * as appState from '../appState';

class Map extends React.Component {
  constructor(props) {
    super(props);
    this.markersByVehicleID = {};
    this.historyMarkersByID = {};
    this.linesByHistoryItemID = {};
    this.animationPromise = Promise.resolve();
    this.currentAnimationFrame = 0;
  }

  static defaultProps = {
    center: {
      lat: 50,
      lng: -98.35,
    },
    zoom: 4
  };

  static propTypes = {
  };

  maybeRepositionMap = bounds => {
    const { autoUpdate } = this.props;
    const { map } = this;
    if (autoUpdate) {
      Promise.delay(100).then(() => {
        map.fitBounds(bounds);
      });
    }
  };

  createMarker = vehicle => {
    const map = this.map;
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

  createHistoryMarkerAndLine = historyItem => {
    const { selectedHistoryItemID } = this.props;

    const map = this.map;
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

    const { previousHistoryItem } = this;
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

    this.previousHistoryItem = historyItem;

    return {
      marker,
      line
    };
  }

  clickMarkerByHistoryID = id => {
    const { historyMarkersByID } = this;
    const marker = historyMarkersByID[id];

    if (marker) {
      new google.maps.event.trigger(marker, "click");
    }
  };

  clickMarkerByVehicleID = id => {
    const { markersByVehicleID } = this;
    const marker = markersByVehicleID[id];
  
    if (marker) {
      new google.maps.event.trigger(marker, "click");
    }
  };

  removeMapMarkers = () => {
    const { impliedSelectedVehiclesByID } = this.props;
    const { historyMarkersByID, linesByHistoryItemID, markersByVehicleID } = this;

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
      if (markersByVehicleID[vehicle.id]) {
        markersByVehicleID[vehicle.id].setMap(null);
        delete markersByVehicleID[vehicle.id];
      }
    });
  }

  nextAnimation = (currentAnimationFrame = 0) => {
    const { animationPromise, map } = this;
    const { animationSpeed, autoUpdate, hist, historyMarkersByID } = this.props;
    const bounds = new google.maps.LatLngBounds();
    console.log(currentAnimationFrame);
    console.log(hist.length);
    if (currentAnimationFrame < hist.length) {
      return Promise.delay(500).then(() => {
        const item = hist[currentAnimationFrame];
        const marker = this.createHistoryMarker(item);
        historyMarkersByID[item.id] = marker;
        if (marker && autoUpdate) {
          map.fitBounds(marker.position);
        }
        const animationPlaying = appState.getState().animationPlaying;
        if (!animationPlaying || currentAnimationFrame >= history.length - 1) {
          playing = false;
          paused = false;
        } else {
          this.nextAnimation(currentAnimationFrame + 1);
        }
      });
    }
  }

  repopulateVehicleHistoryMarkers = () => {
    const { animationPlaying, hist, selectedVehicle } = this.props;
    const { historyMarkersByID, linesByHistoryItemID } = this;
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
          const { marker, line } = this.createHistoryMarkerAndLine(item);
          historyMarkersByID[item.id] = marker;
          if (line) {
            // may be null
            linesByHistoryItemID[item.id] = line;
          }
          if (marker) {
            bounds.extend(marker.position);
          }
        });  
        this.maybeRepositionMap(bounds);
      } else {
        // TODO fixup
        this.nextAnimation();
      }
    }
  }

  repopulateMapMarkers = () => {
    const { impliedSelectedVehiclesByID, selectedMapVehicleID, vehiclesByID } = this.props;
    const { markersByVehicleID, map } = this;

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
      if (vehicle.id && vehicle.last) {
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

        const marker = this.createMarker(vehicle);
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

    this.maybeRepositionMap(bounds);
  }

  handleApiLoaded = (map, maps) => {
    this.map = map.map;
    appState.setMap(this.map);
  };

  componentWillUnmount() {
    this.removeMapMarkers();
  }

  componentDidUpdate() {
    this.repopulateVehicleHistoryMarkers();
    this.repopulateMapMarkers();
  }

  render() {
    const { split } = this.props;
    const height = split ? '50vh' : '75vh';

    return (
      // Important! Always set the container height explicitly
      <div style={{ height, width: '100%' }}>
        <GoogleMapReact
          bootstrapURLKeys={{ key: '1234' }}
          defaultCenter={this.props.center}
          defaultZoom={this.props.zoom}
          onGoogleApiLoaded={ this.handleApiLoaded } 
          yesIWantToUseGoogleMapApiInternals
        >          
        </GoogleMapReact>
      </div>
    );
  }
}

export default connect(
  state => ({
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
  dispatch => bindActionCreators({
  }, dispatch),
)(Map);
