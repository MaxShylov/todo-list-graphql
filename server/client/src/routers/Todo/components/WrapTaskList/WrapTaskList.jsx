import React from "react";
import gql from "graphql-tag";
import { graphql } from "react-apollo";
import isEmpty from "lodash/isEmpty";
import Spin from "antd/lib/spin";

import "./WrapTaskList.css";

import TaskList from "../TaskList/TaskList";


const GET_TASKS = gql`
  query {
    tasks {
      id
      content
      status
      createAt
      edited
    }
  }
`;

const TASK_CREATED = gql`
  subscription {
    taskCreated {
      id
      content
      status
      createAt
      edited
    }
  }
`;

const TASK_EDITED = gql`
  subscription {
    taskEdited {
      id
      content
      status
      createAt
      edited
    }
  }
`;

const TASK_REMOVED = gql`
  subscription {
    taskRemoved {
      id
    }
  }
`;

const TASKS_SORTED = gql`
  subscription {
    tasksSorted {
      id
      content
      status
      createAt
      edited
    }
  }
`;


class WrapTaskList extends React.Component {

  componentDidMount() {
    const { data } = this.props;

    data.subscribeToMore({
      document: TASK_CREATED,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;

        return {
          tasks: [
            subscriptionData.data.taskCreated,
            ...prev.tasks
          ]
        };
      }
    });

    data.subscribeToMore({
      document: TASK_EDITED,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;

        const editTask = subscriptionData.data.taskEdited;

        prev.tasks.filter(i => i.id === editTask)[0] = editTask;

        return {
          tasks: [
            ...prev.tasks
          ]
        };
      }
    });

    data.subscribeToMore({
      document: TASK_REMOVED,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;

        return {
          tasks: [
            ...prev.tasks.filter(i => i.id !== subscriptionData.data.taskRemoved.id)
          ]
        };
      }
    });

    data.subscribeToMore({
      document: TASKS_SORTED,
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data) return prev;

        return {
          tasks: [
            ...subscriptionData.data.tasksSorted
          ]
        };
      }
    });
  }

  render() {
    const { data, data: { tasks, loading } } = this.props;

    if (!data) return null;

    return (
      <div className='WrapTaskList'>
        <Spin spinning={loading}>
          {
            !tasks || isEmpty(tasks)
              ? "No Tasks"
              : <TaskList tasks={tasks} />
          }
        </Spin>
      </div>
    );
  }
}

export default graphql(GET_TASKS)(WrapTaskList);
