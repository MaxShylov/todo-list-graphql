import React, { Component } from 'react';
import Layout from "antd/lib/layout";

import AddTask from "./components/AddTask/AddTask";
import WrapTaskList from "./components/WrapTaskList/WrapTaskList";

const { Header, Footer, Content } = Layout;


class Todo extends Component {
  render() {

    return (
      <div className="Todo">
        <Layout className='App'>
          <Header>
            <h1>ToDo:</h1>

            <AddTask />
          </Header>

          <Content>
            <WrapTaskList />
          </Content>

          <Footer>Footer</Footer>
        </Layout>
      </div>
    );
  }
}


export default Todo;
