
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import GoogleMapReact from 'google-map-react';

class Map extends React.Component {
  // constructor(props) {
  //   super(props);
  //   this.myRef = React.createRef();
  // }

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

  getWelcomeText = () => {
    const { user } = this.props;
    return `Welcome: ${user.username}`;
  }

  render() {
    return (
      // Important! Always set the container height explicitly
      <div style={{ height: '100vh', width: '100%' }}>
        <GoogleMapReact
          bootstrapURLKeys={{ key: '1234' }}
          defaultCenter={this.props.center}
          defaultZoom={this.props.zoom}
        >
          
        </GoogleMapReact>
      </div>
    );
  }
}

export default connect(
  state => ({
    // orgName: state.selectedOrg.name,
    // user: state.user,
  }),
  dispatch => bindActionCreators({
  }, dispatch),
)(Map);
