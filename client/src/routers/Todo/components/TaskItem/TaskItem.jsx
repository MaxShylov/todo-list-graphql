import React, { Component } from "react";
import PropTypes from "prop-types";
import { graphql } from "react-apollo/";
import Icon from "antd/lib/icon";
import Card from "antd/lib/card";
import message from "antd/lib/message";
import { SortableElement } from "react-sortable-hoc";
import gql from "graphql-tag";
import cn from "classnames";

import "./TaskItem.css";

import InputEditTask from "../InputEditTask/InputEditTask";
import TaskStatus from "../TaskStatus/TaskStatus";


const REMOVE_TASK = gql`
  mutation ($id: ID!) {
    removeTask(id: $id) {
      id
    }
  }
`;


class TaskItem extends Component {
  static propTypes = {
    content: PropTypes.string.isRequired,
    createAt: PropTypes.string.isRequired,
    edited: PropTypes.bool.isRequired,
    status: PropTypes.string.isRequired
  };

  state = { isEdit: false };

  toggleEdit = () => this.setState({ isEdit: !this.state.isEdit });

  onRemove = () => {
    const { mutate, id } = this.props;

    mutate({ variables: { id } })
      .then(() => message.success("Task was removed"))
      .catch(err => console.error(err));
  };

  render() {
    const
      { isEdit } = this.state,
      { content, createAt, status, id } = this.props;

    return (
      <Card
        className={cn("TaskItem", status)}
        actions={[
          <Icon
            type="edit"
            theme="outlined"
            onClick={this.toggleEdit}
          />,
          <Icon
            type="delete"
            theme="outlined"
            onClick={this.onRemove}
          />
        ]}
      >
        <Card.Meta
          avatar={<TaskStatus id={id} status={status} />}
          title={
            !isEdit
              ? content
              : (
                <InputEditTask
                  id={id}
                  content={content}
                  toggleEdit={this.toggleEdit}
                />
              )
          }
          description={
            <span>
              <Icon type="clock-circle" theme="outlined" />
              {new Date(+createAt).toString().split("GMT")[0]}
            </span>
          }
        />
      </Card>
    );
  }
}


export default graphql(REMOVE_TASK)(SortableElement(TaskItem));
