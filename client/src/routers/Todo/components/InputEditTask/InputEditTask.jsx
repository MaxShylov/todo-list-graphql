import React, { Component } from "react";
import PropTypes from "prop-types";
import gql from "graphql-tag";
import { graphql } from "react-apollo/";
import Icon from "antd/lib/icon";
import Input from "antd/lib/input";
import message from "antd/lib/message";

import "./InputEditTask.css";


const EDIT_TASK = gql`
  mutation ($id: ID!, $content: String!) {
    editTask(id: $id, content: $content ) {
      id
    }
  }
`;


class InputEditTask extends Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    toggleEdit: PropTypes.func.isRequired
  };

  state = {
    content: this.props.content
  };

  toggleEdit = () => this.props.toggleEdit();

  onKeyDown = (e) => {
    e.keyCode === 13 && this.onEdit();
    e.keyCode === 27 && this.toggleEdit();
  };

  onChange = (e) => this.setState({ content: e.target.value });

  onEdit = () => {
    const
      { id, mutate } = this.props,
      { content } = this.state;

    if (!content) return message.warning("You can't save empty task!");

    mutate({ variables: { id, content } })
      .then(() => {
        message.success("Task is update!");
        this.toggleEdit();
      })
      .catch(err => console.error(err));
  };

  render() {
    const { content } = this.props;

    return (
      <Input
        className='InputEditTask'
        defaultValue={content}
        onKeyDown={this.onKeyDown}
        onChange={this.onChange}
        suffix={[
          <Icon
            key={0}
            type="check-circle"
            theme="outlined"
            onClick={this.onEdit}
          />,
          <Icon
            key={1}
            type="close-circle"
            theme="outlined"
            onClick={this.toggleEdit}
          />
        ]}
      />
    );
  }
}


export default graphql(EDIT_TASK)(InputEditTask);
