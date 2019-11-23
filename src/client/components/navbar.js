
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

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link
} from "react-router-dom";

class Navbar extends React.Component {
  constructor(props) {
    super(props);
    this.myRef = React.createRef();
    this.state = {
      adminToolsOpen: false,
      orgToolsOpen: false,
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
    const { selectedOrg, subview } = this.props;

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
          <Link to={ `/org/${selectedOrg.id}/reports` }><img src={ reportsSvg } /> Reports</Link>
        </li>
        <li
          className={ classnames({
            active: subview === 'MAP'
          }) }
        >
          <Link to={ `/org/${selectedOrg.id}/map` }><img src={ mapSvg } /> Map</Link>
        </li>
        <li
          className={ classnames({
            active: subview === 'SPLIT'
          }) }
        >
          <Link to={ `/org/${selectedOrg.id}/split` }><img src={ globeSvg } /> Split Screen</Link>
        </li>
      </ul>
    );
  }

  renderInOrgNav() {
    // Right side, logged into an org
    const { selectedOrg, subview, user } = this.props;
    const { orgToolsOpen } = this.state;

    return (
      <>
        <li
          className={ classnames({
            open: orgToolsOpen
          }) }
          onClick={ () => this.setState( { orgToolsOpen: !orgToolsOpen}) }
        >
          <a className="pointer dropdown-toggle">Manage<span className="caret"></span></a>
          <ul className="dropdown-menu">
            <li
              className={ classnames({
                active: subview === 'USERS',
              }) }
            >
              <Link to={ `/org/${selectedOrg.id}/users` }>Users</Link>
            </li>
            <li
              className={ classnames({
                active: subview === 'FLEETS',
              }) }
            >
              <Link to={ `/org/${selectedOrg.id}/fleets` }>Fleets</Link>
            </li>
            <li
              className={ classnames({
                active: subview === 'VEHICLES',
              }) }
            >
              <Link to={ `/org/${selectedOrg.id}/vehicles` }>Vehicles</Link>
            </li>
          </ul>
        </li>
      </>
    );
  }

  renderSiteAdminNav() {
    const { user, view, viewID } = this.props;
    const { adminToolsOpen } = this.state;

    return (
      <>
        <li
          className={ classnames({
            active: view === 'ORG'
          }) }
        ><Link to="/orgs">Organizations</Link>
        </li>
        <li
          className={ classnames({
            active: view === 'USER' && viewID !== user.username
          }) }
        ><Link to="/users">Users</Link>
        </li>
        <li
          className={ classnames({
            active: view === 'DEVICE'
          }) }
        ><Link to="/devices">Devices</Link>
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
              <Link to="/processed_messages">Processed Messages</Link>
            </li>
            <li
              className={ classnames({
                active: view === 'RAWEVENTS'
              }) }
            >
              <Link to="/raw_messages">Raw Messages</Link>
            </li>
            <li
              className={ classnames({
                active: view === 'EXCEPTIONS'
              }) }
            >
              <Link to="/exceptions">Uncaught Exceptions</Link>
            </li>
          </ul>
        </li>
      </>
    );
  }

  renderRightNav() {
    const { user, view, viewID } = this.props;
    const { isAdmin } = user;

    return (
      <ul className="nav navbar-nav navbar-right">
        { isAdmin && !this.orgPresent() ? this.renderSiteAdminNav() :
          user.username && 
          <li>
            <Link
              to="/orgs"
              onClick={ () => appState.selectOrgByID(null) }
            >Back To Organizations</Link>
          </li> }
        { this.orgPresent() && this.renderInOrgNav() }
        { user.username && <li
          className={ classnames({
            active: view === 'USER' && viewID === user.username
          }) }
        >
          <Link className={ classnames({
              active: view === 'HELP'
            }) }
            to={ `/users/edit/${user.username}` }>Profile</Link>
        </li> }
        
        { user.username && <li
         className={ classnames({
             active: view === 'HELP'
           }) }
         >
           <Link to="/help">Help</Link>
          </li> }
        <li
          className={ classnames({
            active: view === 'SESSION'
          }) }
        >
          <Link to="/">☰</Link>
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
              <img src="/images/logosmall.png" />
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
    viewID: state.viewID,
  }),
  dispatch => bindActionCreators({
  }, dispatch),
)(Navbar);
