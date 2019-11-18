
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import GoogleMapReact from 'google-map-react';
import ClickListenerFactory from '../markers/clicklistenerfactory';
import toGoogle from '../togoogle.js';
import MarkerWithLabel from '../markers/markerWithLabel';
import Status from "../../common/status";

import appState from '../appState';

class Map extends React.Component {
  constructor(props) {
    super(props);
    this.markersByVehicleID = {};
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
  
    marker.setIcon(Status.getMarkerIconFleetView(vehicle.last));

    google.maps.event.addListener(
      marker,
      "click",
      ClickListenerFactory.create(marker, vehicle, position, map)
    );
  
    return marker;
  }

  clickMarkerByVehicleID = id => {
    const { markersByVehicleID } = this;
    const marker = markersByVehicleID[id];
  
    if (marker) {
      new google.maps.event.trigger(marker, "click");
      // this.map.panTo(marker.position);
    }
  };

  removeMapMarkers = () => {
    const { impliedSelectedVehicles } = this.props;
    const { markersByVehicleID } = this;

    impliedSelectedVehicles.forEach(vehicle => {
        if (markersByVehicleID[vehicle.id]) {
          markersByVehicleID[vehicle.id].setMap(null);
        }
    });

    this.markersByVehicleID = {};
  }

  populateMapMarkers = () => {
    const { impliedSelectedVehicles, selectedMapVehicleID, vehiclesByID } = this.props;
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

    Promise.delay(100).then(() => {
      map.fitBounds(bounds);
    });
  }

  handleApiLoaded = (map, maps) => {
    this.map = map.map;
    appState.setMap(this.map);
  };

  componentDidMount() {
  }

  componentWillUpdate() {
    this.removeMapMarkers();
  }

  componentDidUpdate() {
    this.populateMapMarkers();
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
    impliedSelectedVehicles: state.impliedSelectedVehicles,
    selectedFleets: state.selectedFleets,
    selectedFleetsAll: state.selectedFleetsAll,
    selectedMapVehicleID: state.selectedMapVehicleID,
    subview: state.subview,
    vehiclesByID: state.vehiclesByID,
  }),
  dispatch => bindActionCreators({
  }, dispatch),
)(Map);
