import React, { Component } from 'react';
import Popover from 'antd/lib/popover';
import { Icon, Input, message } from 'antd';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';


const FORGOT_PASSWORD = gql`
  mutation($email: String!) {
    forgotPassword(email: $email) {
      success
      error
    }
  }
`;

class ForgotButton extends Component {
  state = { visible: false };

  handleVisibleChange = (visible) => this.setState({ visible });

  sendEmail = (e) => {
    const { value } = e.target;

    if (value) {
      this.props.mutate({ variables: { email: value } })
        .then((res) => {
          const { error } = res.data.forgotPassword;

          if (error) return message.error(error);

          message.success('Send message to ' + value);
        })
        .catch(err => {
          message.error(err);
          console.error(err)
        });

      this.handleVisibleChange(false)
      e.target.value = '';
    }
  };

  render() {
    const { visible } = this.state;

    return (
      <Popover
        content={(
          <Input
            prefix={<Icon type="mail" style={{ color: 'rgba(0,0,0,.25)' }} />}
            placeholder="Enter your email"
            onPressEnter={this.sendEmail}
          />
        )}
        trigger="click"
        visible={visible}
        onVisibleChange={this.handleVisibleChange}
      >
        <a className="form-forgot">Forgot password</a>
      </Popover>
    );
  }
}


export default graphql(FORGOT_PASSWORD)(ForgotButton);
