
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import GoogleMapReact from 'google-map-react';
import ClickListenerFactory from '../markers/clicklistenerfactory';
import toGoogle from '../togoogle.js';
import MarkerWithLabel from '../markers/markerWithLabel';
import { getMarkerIconFleetView, getMarkerIconIndividualHistory } from "../../common/status";

import appState from '../appState';

class Map extends React.Component {
  constructor(props) {
    super(props);
    this.markersByVehicleID = {};
    this.historyMarkersByID = {};
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
    const { historyMarkersByID } = this;

    const map = this.map;
    const position = toGoogle(historyItem);
    if (!position) {
      console.warn("Invalid vehicle position " + JSON.stringify(historyItem));
      return;
    }

    const icon = getMarkerIconIndividualHistory(historyItem);
    console.log(icon);

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
    const { historyMarkersByID, markersByVehicleID } = this;

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

  populateVehicleHistoryMarkers = () => {
    const { hist, impliedSelectedVehicles, selectedMapVehicleID, selectedVehicle, vehiclesByID } = this.props;
    const { markersByVehicleID } = this;

    const bounds = new google.maps.LatLngBounds();

    if (selectedVehicle) {
      // individual vehicle history
      hist.forEach(item => {
        const marker = this.createHistoryMarker(item);
        if (marker) {
          bounds.extend(marker.position);
        }
      });
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
