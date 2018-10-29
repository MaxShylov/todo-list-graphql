import React, { Component } from 'react';
import Icon from 'antd/lib/icon';
import Tooltip from 'antd/lib/tooltip';
import gql from 'graphql-tag';
import message from 'antd/lib/message';
import { graphql } from 'react-apollo';


const LOGOUT = gql`
  mutation {
    logout {
      success
      error
    }
  }
`;


class LogoutButton extends Component {

  logout = () => {
    this.props.mutate()
      .then((res) => {
        const { error } = res.data.logout;

        if (error) return message.error(error);
        localStorage.removeItem('token');
        window.location.reload();
      })
      .catch(err => console.error(err));
  };

  render() {

    return (
      <Tooltip placement="bottom" title='Logout'>
        <Icon
          type="logout"
          theme="outlined"
          onClick={this.logout}
        />
      </Tooltip>
    );
  }
}


export default graphql(LOGOUT)(LogoutButton);
