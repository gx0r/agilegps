
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import GoogleMapReact from 'google-map-react';
import ClickListenerFactory from '../markers/clicklistenerfactory';
import toGoogle from '../togoogle.js';
import MarkerWithLabel from '../markers/markerWithLabel';
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

  createMarker = vehicle => {
    const map = this.map;
    const position = toGoogle(vehicle.last ? vehicle.last : item);
  
    const marker = new MarkerWithLabel({
      position,
      map,
      title: vehicle.name,
      labelContent: vehicle.name,
      labelAnchor: new google.maps.Point(0, 0),
      labelClass: "maplabel", // the CSS class for the label
      labelInBackground: false
    });
  
    marker.setIcon(getMarkerIconFleetView(vehicle.last));

    google.maps.event.addListener(
      marker,
      "click",
      ClickListenerFactory.create(marker, vehicle, position, map)
    );
  
    return marker;
  }

  createHistoryMarker = historyItem => {
    const { selectedHistoryItemID } = this.props;
    const { historyMarkersByID, linesByHistoryItemID } = this;

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

    historyMarkersByID[historyItem.id] = marker;

    if (selectedHistoryItemID === historyItem.id) {
      new google.maps.event.trigger(marker, 'click');
    }

    // now draw lines

    if (this.previousHistoryItem) {
      const { previousHistoryItem } = this;
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
        linesByHistoryItemID[historyItem.id] = new google.maps.Polyline({
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
    return marker;
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
    const { impliedSelectedVehicles } = this.props;
    const { historyMarkersByID, linesByHistoryItemID, markersByVehicleID } = this;

    Object.keys(linesByHistoryItemID).forEach(key => {
      linesByHistoryItemID[key].setMap(null);
      delete linesByHistoryItemID[key];
    });

    Object.keys(historyMarkersByID).forEach(key => {
      historyMarkersByID[key].setMap(null);
      delete historyMarkersByID[key];
    })

    impliedSelectedVehicles.forEach(vehicle => {
        if (markersByVehicleID[vehicle.id]) {
          markersByVehicleID[vehicle.id].setMap(null);
          delete markersByVehicleID[vehicle.id];
        }
    });
  }

  nextAnimation = (currentAnimationFrame = 0) => {
    const { animationPromise, map } = this;
    const { animationSpeed, hist } = this.props;
    const bounds = new google.maps.LatLngBounds();
    console.log(currentAnimationFrame);
    console.log(hist.length);
    if (currentAnimationFrame < hist.length) {
      return Promise.delay(500).then(() => {
        const marker = this.createHistoryMarker(hist[currentAnimationFrame]);
        if (marker) {
          map.fitBounds(marker.position);
        }
        if (currentAnimationFrame >= history.length - 1) {
          playing = false;
          paused = false;
        } else {
          this.nextAnimation(currentAnimationFrame + 1);
        }
      });
    }
  }

  populateVehicleHistoryMarkers = () => {
    const { animationPlaying, hist, impliedSelectedVehicles, selectedMapVehicleID, selectedVehicle, vehiclesByID } = this.props;
    const { markersByVehicleID } = this;

    const bounds = new google.maps.LatLngBounds();

    if (selectedVehicle) {
      // individual vehicle history
      if (!animationPlaying) {
        hist.forEach(item => {
          const marker = this.createHistoryMarker(item);
          if (marker) {
            bounds.extend(marker.position);
          }
        });  
      } else {
        this.nextAnimation();
      }
    }
  }

  populateMapMarkers = () => {
    const { hist, impliedSelectedVehicles, selectedMapVehicleID, vehiclesByID } = this.props;
    const { markersByVehicleID } = this;

    const bounds = new google.maps.LatLngBounds();

    impliedSelectedVehicles.forEach(vehicle => {
      if (vehiclesByID[vehicle.id] && vehiclesByID[vehicle.id].last) {
        const marker = this.createMarker(vehiclesByID[vehicle.id], false);
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

    // Promise.delay(100).then(() => {
    //   map.fitBounds(bounds);
    // });
  }

  handleApiLoaded = (map, maps) => {
    this.map = map.map;
    appState.setMap(this.map);
  };

  componentWillUpdate() {
    this.removeMapMarkers();
  }

  componentDidUpdate() {
    this.populateMapMarkers();
    this.populateVehicleHistoryMarkers();
  }

  render() {
    const { subview } = this.props;
    const height = subview === 'SPLIT' ? '50vh' : '75vh';

    return (
      // Important! Always set the container height explicitly
      <div style={{ height, width: '100%' }}>
        <GoogleMapReact
          bootstrapURLKeys={{ key: '1234' }}
          defaultCenter={this.props.center}
          defaultZoom={this.props.zoom}
          onGoogleApiLoaded={ this.handleApiLoaded } 
        >          
        </GoogleMapReact>
      </div>
    );
  }
}

export default connect(
  state => ({
    animationPlaying: state.animationPlaying,
    hist: state.selectedVehicleHistory,
    impliedSelectedVehicles: state.impliedSelectedVehicles,
    selectedFleets: state.selectedFleets,
    selectedFleetsAll: state.selectedFleetsAll,
    selectedHistoryItemID: state.selectedHistoryItemID,
    selectedMapVehicleID: state.selectedMapVehicleID,
    selectedVehicle: state.selectedVehicle,
    subview: state.subview,
    vehiclesByID: state.vehiclesByID,
  }),
  dispatch => bindActionCreators({
  }, dispatch),
)(Map);
