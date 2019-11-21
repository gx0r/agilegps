
import * as React from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as moment from 'moment';
import * as classnames from 'classnames';

import * as appState from '../appState';

import reportsSvg from '../svg/reports.svg';
import mapSvg from '../svg/map.svg';
import globeSvg from '../svg/globe.svg';
import xcloudSvg from '../svg/xcloud.svg';

class Navbar extends React.Component {
  constructor(props) {
    super(props);
    this.myRef = React.createRef();
  }

  static propTypes = {
    orgName: PropTypes.string,
    user: PropTypes.object,
  };

  formatLastUpdated() {
    const { lastUpdated, metric } = this.props;
    if (!lastUpdated) {
      return "";
    }
    if (metric) {
      return moment(lastUpdated).format("HH:mm:ss");
    } else {
      return moment(lastUpdated).format("h:mm:ss A");
    }
  }

  componentDidMount() {
  }

  getWelcomeText = () => {
    const { user } = this.props;
    if (user.username) {
      return `Welcome ${user.username}`;
    } else {
      return null;
    }
  }

  renderConnectivity() {
    const { realTimeUpdates, user } = this.props;
    
    if (!user.username) {
      return null;
    }

    return (
      <a style={{color: realTimeUpdates ? '' : 'red' }}>
      
      { realTimeUpdates && `Last update: ${this.formatLastUpdated()} ⚡` }
      { !realTimeUpdates && 'Connection lost ' }
      { !realTimeUpdates && <img src={ xcloudSvg } /> }
      </a>
    );
  }

  renderLeftNav() {
    const { selectedOrg, subview } = this.props;

    if (!selectedOrg.id) {
      return null;
    }

    return (
      <ul className="nav navbar-nav">
        <li
          className={ classnames({
            active: subview === 'REPORT'
          }) }
        >
          <a
            onClick={ () => appState.viewReports() }
            href="#"><img src={ reportsSvg } />Reports
          </a>
        </li>
        <li
          className={ classnames({
            active: subview === 'MAP'
          }) }
        >
          <a
            onClick={ () => appState.viewMap() }
            href="#"><img src={ mapSvg } />Map</a>
        </li>
        <li
          className={ classnames({
            active: subview === 'SPLIT'
          }) }
        >
          <a
            onClick={ () => appState.viewSplitScreen() }
            href="#"><img src={ globeSvg } />Split Screen</a>
        </li>
      </ul>
    );
  }

  renderRightNav() {
    const { view } = this.props;

    return (
      <ul className="nav navbar-nav navbar-right">
        <li>
          <a
            onClick={ () => appState.viewOrganizations() }
            href="#">Back to Organizations</a>
        </li>
        <li
          className={ classnames({
            active: view === 'HELP'
          }) }
        >
          <a
            onClick={ () => appState.viewHelp() }
            href="#">Help</a>
        </li>
        <li
          className={ classnames({
            active: view === 'SESSION'
          }) }
        >
          <a
            onClick={ () => appState.viewLogin() }
            href="#">☰</a>
        </li>
      </ul>  
    );

  }

  render() {
    const { view } = this.props;

    return (
      <nav className="navbar navbar-static-top navbar-inverse">
        <div className="container-fluid">
          <div className="container-fluid">
            <li style={{float:'left'}}>
              <img src="images/logosmall.png" />
            </li>
            <li className="nav navbar-right" style={{textAlign:'right'}}>
              <br />
              <span className="company-name">{ this.props.orgName }</span>
              <br />
              <a>{ this.getWelcomeText() }</a>
              <br />
              { this.renderConnectivity() }
            </li>            
          </div>
          { this.renderLeftNav() }         
          { this.renderRightNav() }        
        </div>
      </nav>
    );
  }
}

export default connect(
  state => ({
    lastUpdated: state.lastUpdated,
    metric: state.user && state.user.metric,
    orgName: state.selectedOrg.name,
    realTimeUpdates: state.realTimeUpdates,
    selectedOrg: state.selectedOrg,
    subview: state.subview,
    user: state.user,
    view: state.view,
  }),
  dispatch => bindActionCreators({
  }, dispatch),
)(Navbar);
