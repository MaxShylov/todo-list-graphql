import React, { Component } from "react";
import gql from "graphql-tag";
import { graphql } from "react-apollo";
import Icon from "antd/lib/icon";

import "./TaskStatus.css";


const TOGGLE_STATUS = gql`
  mutation ($id: ID!, $status: String!) {
    editTask(id: $id, status: $status) {
      id
    }
  }
`;


class TaskStatus extends Component {

  toggleStatus = () => {
    const
      { id, mutate, status: s } = this.props,
      status = s === "done" ? "not-done" : "done";

    mutate({ variables: { id, status } })
      .then(() => null)
      .catch(err => console.error(err));
  };

  render() {
    const { status } = this.props;

    return (
      <div
        className="TaskStatus"
        onClick={this.toggleStatus}
      >
        {
          status === "done"
            ? <Icon type="check-square" theme="outlined" />
            : <Icon type="border" theme="outlined" />
        }
      </div>
    );
  }
}

export default graphql(TOGGLE_STATUS)(TaskStatus);
