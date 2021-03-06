import React, { Component } from 'react';
import Layout from 'antd/lib/layout';
import Icon from 'antd/lib/icon'
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import message from 'antd/lib/message';
import { withRouter } from 'react-router-dom';
import Spin from 'antd/lib/spin'

import './Todo.scss'

import AddTask from './components/AddTask/AddTask';
import WrapTaskList from './components/WrapTaskList/WrapTaskList';
import { ROUTERS } from '../index';
import LogoutButton from './components/LogoutButton/LogoutButton';

const { Header, Footer, Content } = Layout;


const CHECK_TOKEN = gql`
  query {
    checkToken {
      success
      error
    }
  }
`;


class Todo extends Component {

  render() {
    const { data, data: { checkToken, loading } } = this.props;

    if (!data) return null;

    if (loading) return <Spin spinning={true} />;

    if (!checkToken.success) {
      message.error(data.checkToken.error);
      localStorage.removeItem('token');
      this.props.history.push(ROUTERS.LOGIN);
    }

    return (
      <div className="Todo">
        <Layout className='App'>
          <Header>
            <a
              target='_blank'
              href="https://github.com/MaxShylov/todo-list-graphql"
              className='github-link'
            >
              <Icon type="github" theme="outlined" />
            </a>

            <h1>ToDo:</h1>

            <AddTask />

            <div className='username'>
              {localStorage.username}

              <LogoutButton />
            </div>
          </Header>

          <Content>
            <WrapTaskList />
          </Content>

          <Footer>
            Created by
            <a href="https://www.linkedin.com/in/max-shylov/" target='_blank'>Max Shylov</a>
          </Footer>
        </Layout>
      </div>
    );
  }
}


export default withRouter(graphql(CHECK_TOKEN)(Todo));
