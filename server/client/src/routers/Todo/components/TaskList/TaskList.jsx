import React from "react";
import gql from "graphql-tag";
import { graphql } from "react-apollo";
import { arrayMove } from "react-sortable-hoc";

import "./TaskList.css";

import SortableList from "../SortableList/SortableList";


const SORT_TASKS = gql`
  mutation ($tasks: String!) {
    sortTasks(tasks: $tasks) {
      id
    }
  }
`;


class TaskList extends React.Component {

  state = {
    tasks: this.props.tasks
  };

  componentWillReceiveProps(nextProps) {
    if (nextProps.tasks !== this.state.tasks) {
      this.setState({ tasks: nextProps.tasks });
    }
  }

  onSortEnd = ({ oldIndex, newIndex }) => {
    const
      { mutate } = this.props,
      { tasks } = this.state,
      sortTasks = arrayMove(tasks, oldIndex, newIndex);

    this.setState({ tasks: sortTasks });

    mutate({ variables: { tasks: JSON.stringify(sortTasks) } })
      .then(() => null)
      .catch(err => console.log(err));
  };

  render() {
    const { tasks } = this.state;

    return (
      <div className='TaskList'>
        <SortableList
          pressDelay={150}
          tasks={tasks}
          onSortEnd={this.onSortEnd}
        />
      </div>
    );
  }
}

export default graphql(SORT_TASKS)(TaskList);
