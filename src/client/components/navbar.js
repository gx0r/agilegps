
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

class Navbar extends React.Component {
  constructor(props) {
    super(props);
    this.myRef = React.createRef();
  }

  static propTypes = {
    orgName: PropTypes.string,
    user: PropTypes.object,
  };

  componentDidMount() {
  }

  getWelcomeText = () => {
    const { user } = this.props;
    return `Welcome: ${user.username}`;
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
              <a>
                <br/>
                <span className="company-name">{ this.props.orgName }</span>
                <br/>
                { this.getWelcomeText() }
              </a>
            </li>
          </div>
        </div>
      </nav>
    );
  }
}

export default connect(
  state => ({
    orgName: state.selectedOrg.name,
    user: state.user,
  }),
  dispatch => bindActionCreators({
  }, dispatch),
)(Navbar);
