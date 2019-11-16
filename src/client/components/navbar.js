
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import moment from 'moment';
import appState from '../appState';

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
    return `Welcome: ${user.username}`;
  }

  render() {
    const { realTimeUpdates } = this.props;

    return (
      <nav className="navbar navbar-static-top navbar-inverse">
        <div className="container-fluid">
          <div className="container-fluid">
            <li style={{float:'left'}}>
              <img src="images/logosmall.png" />
            </li>
            <li className="nav navbar-right" style={{textAlign:'right'}}>
              <a>
                <br />
                <span className="company-name">{ this.props.orgName }</span>
                <br />
                { this.getWelcomeText() }
                <br />
                <a style={{color: realTimeUpdates ? '' : 'red' }}>
                  { realTimeUpdates ? `Last update: ${this.formatLastUpdated()} ` : 'Connectivity lost' }
                </a>
              </a>
            </li>            
          </div>
          <ul className="nav navbar-nav">
            <li>
              <a
                onClick={ () => appState.viewReports() }
                href="#">Reports</a>
            </li>
            <li>
              <a
                onClick={ () => appState.viewMap() }
                href="#">Map</a>
              <a
                onClick={ () => appState.viewSplitScreen() }
                href="#">Split Screen</a>
            </li>
          </ul>
          <ul className="nav navbar-nav navbar-right">
            <li>
              <a
                onClick={ () => appState.viewOrganizations() }
                href="#">Back to Organizations</a>
            </li>
            <li>
              <a
                onClick={ () => appState.viewLogin() }
                href="#">☰</a>
            </li>
          </ul>          
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
    user: state.user,
  }),
  dispatch => bindActionCreators({
  }, dispatch),
)(Navbar);
