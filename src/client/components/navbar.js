
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
    this.state = {
      adminToolsOpen: false,
    }
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

  orgPresent() {
    const { selectedOrg } = this.props;
    return selectedOrg && selectedOrg.id != null;
  }

  isAdmin() {
    const { user } = this.props;
    return user.isAdmin;
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
    const { subview } = this.props;

    if (!this.orgPresent()) {
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

  renderSiteAdminNav() {
    const { view } = this.props;
    const { adminToolsOpen } = this.state;

    return (
      <>
        <li
          className={ classnames({
            active: view === 'ORG'
          }) }
        >
          <a
            onClick={ () => appState.viewOrganizations() }
            href="#">Organizations</a>
        </li>
        <li
          className={ classnames({
            active: view === 'USER'
          }) }
        ><a
            onClick={ () => appState.viewUsers() }
            href="#">Users</a>
        </li>
        <li
          className={ classnames({
            active: view === 'DEVICE'
          }) }
        ><a
            onClick={ () => appState.viewDevices() }
            href="#">Devices</a>
        </li>
        <li
          onClick={ () => this.setState( { adminToolsOpen: !adminToolsOpen }) }
          className={ classnames('dropdown pointer', {
            open: adminToolsOpen
          }) }
        >
          <a className="dropdown-toggle">Messages<span className="caret"></span></a>
          <ul className="dropdown-menu">
            <li
              className={ classnames({
                active: view === 'EVENTS'
              }) }
            >
              <a href="#" onClick={ () => appState.viewEvents() }>Processed Messages</a>
            </li>
            <li
              className={ classnames({
                active: view === 'RAWEVENTS'
              }) }
            >
              <a href="#" onClick={ () => appState.viewRawEvents() }>Raw Messages</a>
            </li>
            <li
              className={ classnames({
                active: view === 'EXCEPTIONS'
              }) }
            >
              <a href="#" onClick={ () => appState.viewExceptions() }>Uncaught Exceptions</a>
            </li>
          </ul>
        </li>
      </>
    );
  }

  renderRightNav() {
    const { user, view } = this.props;
    const { isAdmin } = user;

    return (
      <ul className="nav navbar-nav navbar-right">
        { isAdmin && !this.orgPresent() ? this.renderSiteAdminNav() :
        <li>
          <a
            onClick={ () => appState.viewOrganizations() }
            href="#">Back To Organizations</a>
        </li> }
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
