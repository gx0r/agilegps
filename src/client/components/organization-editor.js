
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import classnames from 'classnames';

import * as Organization from "../../common/models/Organization";

class OrganizationEditor extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      editing: true,
    }
  }

  static propTypes = {
    org: PropTypes.object.isRequired,
  };

  componentWillMount() {
  }

  render() {
    const { org } = this.props;

    return (
      <div className="business-table">
        <div className="col-sm-3" />
        <div className="business-table col-sm-6">
          <div className="btn center">Edit Organization</div>
        </div>
        <form className="form-horizontal">
          {
            Object.keys(org).map(key => {
              return (
                <div className="form-group">
                  <label className="col-md-2 control-label">{ key }</label>
                  <div className="div.col-md-10">
                    <div className="input.form-control">
                    { org[key] }
                    </div>
                  </div>                
                </div>
              );
            })
          }
          <div className="buttons-right">
          <button
            className="btn btn-default"
            onClick={ window.history.back() }
          >Cancel</button>
          <button className="btn btn-success">Save</button>
        </div>
        </form>        
        <div className="col-sm-3" />
      </div>
    );
  }
}

export default connect(
  state => {
    const { orgsByID, subview, viewID } = state;
    let org;
    if (subview === 'NEW') {
      org = new Organization();
    } else {
      org = orgsByID[viewID];
    }

    return {
      org: org,
    }
  },
  dispatch => bindActionCreators({
  }, dispatch),
)(OrganizationEditor);
