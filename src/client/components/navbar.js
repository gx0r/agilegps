
import React, { useState } from 'react';
import * as PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as moment from 'moment';
import * as classnames from 'classnames';

import * as appState from '../appState';
import { startListening, stopListening } from "../appSocketState";

import reportsSvg from '../svg/reports.svg';
import mapSvg from '../svg/map.svg';
import globeSvg from '../svg/globe.svg';
import xcloudSvg from '../svg/xcloud.svg';

import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  useParams
} from "react-router-dom";

function Navbar(props) {
  const [adminToolsOpen, setAdminToolsOpen] = useState(false);
  const [orgToolsOpen, setOrgToolsOpen] = useState(false);
  const { orgId } = useParams();
  console.log(orgId);

  const formatLastUpdated = () => {
    const { lastUpdated, metric } = props;
    if (!lastUpdated) {
      return "";
    }
    if (metric) {
      return moment(lastUpdated).format("HH:mm:ss");
    } else {
      return moment(lastUpdated).format("h:mm:ss A");
    }
  }

  const isAdmin = () => {
    const { user } = props;
    return user.isAdmin;
  }

  const getWelcomeText = () => {
    const { user } = props;
    if (user.username) {
      return `Welcome ${user.username}`;
    } else {
      return null;
    }
  }

  const renderConnectivity = () => {
    const { dispatch, realTimeUpdates, user } = props;
    
    if (!user.username) {
      return null;
    }

    return (
      <a
        className="pointer"
        onClick={ () => {
          if (realTimeUpdates) {
            stopListening();
          } else {
            startListening(dispatch);
          }
        }}
        style={{color: realTimeUpdates ? '' : '' }}>
      
      { realTimeUpdates && `Last update: ${formatLastUpdated()} ⚡` }
      { !realTimeUpdates && 'Real-time disconnected ' }
      { !realTimeUpdates && <img src={ xcloudSvg } width="24" height="24" /> }
      </a>
    );
  }

  const renderLeftNav = () => {
    const { subview } = props;

    if (!orgId) {
      return null;
    }

    return (
      <ul className="nav navbar-nav">
        <li
          className={ classnames({
            active: subview === 'REPORT'
          }) }
        >
          <Link to={ `/org/${orgId}/reports` }><img src={ reportsSvg } /> Reports</Link>
        </li>
        <li
          className={ classnames({
            active: subview === 'MAP'
          }) }
        >
          <Link to={ `/org/${orgId}/map` }><img src={ mapSvg } /> Map</Link>
        </li>
        <li
          className={ classnames({
            active: subview === 'SPLIT'
          }) }
        >
          <Link to={ `/org/${orgId}/split` }><img src={ globeSvg } /> Split Screen</Link>
        </li>
      </ul>
    );
  }


  const renderInOrgNav = () => {
    // Right side, logged into an org
    const { subview } = props;

    return (
      <>
        <li
          className={ classnames({
            open: orgToolsOpen
          }) }
          onClick={ () => setOrgToolsOpen(!orgToolsOpen) }
        >
          <a className="pointer dropdown-toggle">Manage<span className="caret"></span></a>
          <ul className="dropdown-menu">
            <li
              className={ classnames({
                active: subview === 'USERS',
              }) }
            >
              <Link to={ `/org/${orgId}/users` }>Users</Link>
            </li>
            <li
              className={ classnames({
                active: subview === 'FLEETS',
              }) }
            >
              <Link to={ `/org/${orgId}/fleets` }>Fleets</Link>
            </li>
            <li
              className={ classnames({
                active: subview === 'VEHICLES',
              }) }
            >
              <Link to={ `/org/${orgId}/vehicles` }>Vehicles</Link>
            </li>
          </ul>
        </li>
      </>
    );
  }

  const renderSiteAdminNav = () => {
    const { user, view, viewID } = props;

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
          onClick={ () => setAdminToolsOpen(!adminToolsOpen) }
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
              <Link to="/messages/processed">Processed Messages</Link>
            </li>
            <li
              className={ classnames({
                active: view === 'RAWEVENTS'
              }) }
            >
              <Link to="/messages/raw">Raw Messages</Link>
            </li>
            <li
              className={ classnames({
                active: view === 'EXCEPTIONS'
              }) }
            >
              <Link to="/messages/exceptions">Uncaught Exceptions</Link>
            </li>
          </ul>
        </li>
      </>
    );
  }

  const renderRightNav = () => {
    const { user, view, viewID } = props;
    const { isAdmin } = user;

    return (
      <ul className="nav navbar-nav navbar-right">
        { isAdmin && !orgId ? renderSiteAdminNav() :
          user.username && 
          <li>
            <Link to="/orgs">Back To Organizations</Link>
          </li> }
        { orgId && renderInOrgNav() }
        { user.username && <li
          className={ classnames({
            active: view === 'USER' && viewID === user.username
          }) }
        >
          <Link className={ classnames({
              active: view === 'HELP'
            }) }
            to={ `/user/${user.username}/edit` }>Profile</Link>
        </li> }
        
        { isAdmin && <li>
            <Link to="/system">System</Link>
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

  const { orgsByID } = props;

  return (
    <nav className="navbar navbar-static-top navbar-inverse">
      <div className="container-fluid">
        <div className="container-fluid">
          <li style={{float:'left'}}>
            <Link to="/"><img src="/images/logosmall.png" /></Link>
          </li>
          <li className="nav navbar-right" style={{textAlign:'right'}}>
            <br />
            <span className="company-name">{ orgsByID[orgId] && orgsByID[orgId].name }</span>
            <br />
            <a>{ getWelcomeText() }</a>
            <br />
            { renderConnectivity() }
          </li>            
        </div>
        { renderLeftNav() }         
        { renderRightNav() }        
      </div>
    </nav>
  );
}

export default connect(
  state => ({
    lastUpdated: state.lastUpdated,
    metric: state.user && state.user.metric,
    orgsByID: state.orgsByID,
    realTimeUpdates: state.realTimeUpdates,
    user: state.user,
  }),
  dispatch => bindActionCreators({
    dispatch,
  }, dispatch),
)(Navbar);
