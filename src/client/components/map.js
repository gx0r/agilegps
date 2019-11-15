
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import GoogleMapReact from 'google-map-react';
import TheMap from '../map';
import ClickListenerFactory from '../markers/clicklistenerfactory';
import toGoogle from '../togoogle.js';
import MarkerWithLabel from '../markers/markerWithLabel';
import Status from "../../common/status";

class Map extends React.Component {
  constructor(props) {
    super(props);
    this.mapRef = React.createRef();
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
    const map = this.map.map;
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

    // TODO
    // google.maps.event.addListener(
    //   marker,
    //   "click",
    //   ClickListenerFactory.create(marker, item, position)
    // );
  
    return marker;
  }

  populateMapMarkers = () => {
    const { impliedSelectedVehicles, vehiclesByID } = this.props;
    const { markersByVehicleID } = this;

    const bounds = new google.maps.LatLngBounds();

    impliedSelectedVehicles.forEach(vehicle => {
      if (vehiclesByID[vehicle.id] && vehiclesByID[vehicle.id].last) {
        const marker = this.createMarker(vehiclesByID[vehicle.id], false);
        bounds.extend(marker.position);
        markersByVehicleID[vehicle.id] = marker;
      }
    });
  }

  handleApiLoaded = (map, maps) => {
    this.map = map;
    TheMap.setMap(map);
  };

  componentDidMount() {
    TheMap.mount(this.mapRef.current);
    this.populateMapMarkers();
  }

  componentWillUpdate() {
    // this.removeMapMarkers();
    this.populateMapMarkers();
  }

  render() {
    return (
      // Important! Always set the container height explicitly
      <div style={{ height: '50vh', width: '100%' }} ref={ this.mapRef }>
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
    vehiclesByID: state.vehiclesByID,
  }),
  dispatch => bindActionCreators({
  }, dispatch),
)(Map);
