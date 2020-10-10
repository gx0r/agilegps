import React, { useState } from 'react';
import { connect } from 'react-redux';
import * as moment from 'moment';
import * as classnames from 'classnames';

import { startListening, stopListening } from "../appSocketState";

import reportsSvg from '../svg/reports.svg';
import mapSvg from '../svg/map.svg';
import globeSvg from '../svg/globe.svg';
import xcloudSvg from '../svg/xcloud.svg';

import onClickOutside from 'react-onclickoutside';

import {
  Link,
  NavLink,
  useParams
} from "react-router-dom";

const clickOutsideConfig = {
  handleClickOutside: () => Navbar.handleClickOutside
};

function Navbar(props) {
  const [adminToolsOpen, setAdminToolsOpen] = useState(false);
  const toggleAdminToolsOpen = () => setAdminToolsOpen(!adminToolsOpen);
  const [orgToolsOpen, setOrgToolsOpen] = useState(false);
  const { orgId } = useParams();

  Navbar.handleClickOutside = () => { setAdminToolsOpen(false) }

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
    if (!orgId) {
      return null;
    }

    return (
      <ul className="nav navbar-nav">
        <li>
          <NavLink to={`/org/${orgId}/reports`} activeClassName="active-nav"><img src={ reportsSvg } /> Reports</NavLink>
        </li>
        <li>
          <NavLink to={`/org/${orgId}/map`} activeClassName="active-nav"><img src={ mapSvg } /> Map</NavLink>
        </li>
        <li>
          <NavLink to={`/org/${orgId}/split`} activeClassName="active-nav"><img src={ globeSvg } /> Split Screen</NavLink>
        </li>
      </ul>
    );
  }


  const renderInOrgNav = () => {
    // Right side, logged into an org
    const { subview } = props;

    return (
      <>
        <li className={ classnames({ open: orgToolsOpen }) } onClick={ () => setOrgToolsOpen(!orgToolsOpen) }>
          <a className="pointer dropdown-toggle">Manage<span className="caret"></span></a>
          <ul className="dropdown-menu">
            <li>
              <NavLink to={`/org/${orgId}/users`} activeClassName="active-nav-dropdown">Users</NavLink>
            </li>
            <li>
              <NavLink to={`/org/${orgId}/fleets`} activeClassName="active-nav-dropdown">Fleets</NavLink>
            </li>
            <li>
              <NavLink to={`/org/${orgId}/vehicles`} activeClassName="active-nav-dropdown">Vehicles</NavLink>
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
        <li><NavLink to="/orgs" activeClassName="active-nav">Organizations</NavLink>
        </li>
        <li><NavLink to="/users" activeClassName="active-nav">Users</NavLink>
        </li>
        <li><NavLink to="/devices" activeClassName="active-nav">Devices</NavLink>
        </li>
        <li
          onClick={ () => setAdminToolsOpen(!adminToolsOpen) }
          className={ classnames('dropdown pointer', {
            open: adminToolsOpen
          }) }
        >
          <a className="dropdown-toggle">System<span className="caret"></span></a>
          <ul className="dropdown-menu">
            <li>
              <NavLink to="/system/messages/processed" activeClassName="active-nav-dropdown">Processed Messages</NavLink>
            </li>
            <li>
              <NavLink to="/system/messages/raw" activeClassName="active-nav-dropdown">Raw Messages</NavLink>
            </li>
            <li>
              <NavLink to="/system/messages/errors" activeClassName="active-nav-dropdown">Server Errors</NavLink>
            </li>
            <li>
              <NavLink to="/system/jobs" activeClassName="active-nav-dropdown">Database Jobs</NavLink>
            </li>
            <li>
              <NavLink to="/system/stats" activeClassName="active-nav-dropdown">Database Stats</NavLink>
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
            <NavLink to="/orgs" activeClassName="active-nav">Back To Organizations</NavLink>
          </li> }
        { orgId && renderInOrgNav() }
        { user.username && <li
          className={ classnames({
            active: view === 'USER' && viewID === user.username
          }) }
        >
          <NavLink to={`/user/${user.username}/edit`} activeClassName="active-nav">Profile</NavLink>
        </li> }
        { user.username && <li>
           <NavLink to="/help" activeClassName="active-nav">Help</NavLink>
          </li> }
        <li>
          <NavLink exact to="/" activeClassName="active-nav">☰</NavLink>
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
  })
)(onClickOutside(Navbar, clickOutsideConfig));
