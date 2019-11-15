
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
    // orgName: PropTypes.string,
    // user: PropTypes.object,
  };

  // componentDidMount() {
  //   const el = this.myRef.current;
  //   debugger;
  //   if (!mounted) {
  //     mounted = true;
  //     // debugger;
  //     // el.style.height = "400px";
  //     el.appendChild(new google.maps.Map(el, {
  //       zoom: 4,
  //       center: { lat: 50, lng: -98.35 },
  //       rotateControl: true
  //     }));

  //   }
  // }


  createMarker = item => {
    const map = this.map.map;
    let position;
    if (item.last) {
      position = toGoogle(item.last);
    } else {
      position = toGoogle(item);
    }
  
    if (!position) {
      console.warn("Org marker, invalid position " + JSON.stringify(item));
      return;
    }
  
    const marker = new MarkerWithLabel({
      position: position,
      map: map,
      title: item.name,
      labelContent: item.name,
      labelAnchor: new google.maps.Point(0, 0),
      labelClass: "maplabel", // the CSS class for the label
      labelInBackground: false
    });
  
    marker.setIcon(Status.getMarkerIconFleetView(item.last));
    // google.maps.event.addListener(
    //   marker,
    //   "click",
    //   ClickListenerFactory.create(marker, item, position)
    // );
  
    return marker;
  }

  populateMapMarkers = () => {
    const { impliedSelectedVehicles, selectedFleets, selectedFleetsAll, vehiclesByID } = this.props;
    const { markersByVehicleID } = this;

    if (impliedSelectedVehicles.length > 0) {
      const bounds = new google.maps.LatLngBounds();

      impliedSelectedVehicles.forEach(vehicle => {
        if (vehiclesByID[vehicle.id]) {
          const marker = this.createMarker(vehiclesByID[vehicle.id], false);
          if (marker) {
            bounds.extend(marker.position);
            if (markersByVehicleID[vehicle.id]) {
              markersByVehicleID[vehicle.id].setMap(null); // TODO why necessary
            }
            markersByVehicleID[vehicle.id] = marker;
          }
        }
      });
    }
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
    // orgName: state.selectedOrg.name,
    // user: state.user,
  }),
  dispatch => bindActionCreators({
  }, dispatch),
)(Map);
