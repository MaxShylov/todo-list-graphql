import React, { Component } from 'react';
import { Form, Icon, Input, Button, message } from 'antd';
import { Link } from 'react-router-dom';


import './ResetPassword.scss';
import { ROUTERS } from '../../index';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';

const FormItem = Form.Item;

const RESET_PASSWORD = gql`
  mutation($forgotPasswordToken: String!, $password: String!, $confirm: String!) {
    resetPassword(forgotPasswordToken: $forgotPasswordToken, password: $password, confirm: $confirm) {
      success
      error
    }
  }
`;


class ResetPassword extends Component {
  state = {
    confirmDirty: false,
    loading: false
  };

  handleSubmit = (e) => {
    e.preventDefault();

    const { form, mutate, location: { search } } = this.props;

    this.setState({ loading: true });

    form.validateFields((err, values) => {
      if (!err) {
        mutate({ variables: { ...values, forgotPasswordToken: search.slice(1) } })
          .then((res) => {
            if (!res.data.resetPassword) return message.error('error');

            const { error } = res.data.resetPassword;

            this.setState({ loading: false });

            if (error) return message.error(error);

            this.props.history.push('/login');
          })
          .catch(err => {
            message.error(err);
            console.error(err)
          });
      }
    });
  };

  handleConfirmBlur = (e) => {
    const value = e.target.value;
    this.setState({ confirmDirty: this.state.confirmDirty || !!value });
  };


  validateToNextPassword = (rule, value, callback) => {
    const form = this.props.form;

    if (value && this.state.confirmDirty) form.validateFields(['confirm'], { force: true });

    if (value && value.length < 1) callback('Password should have more then 8 characters!');

    callback();
  };


  compareToFirstPassword = (rule, value, callback) => {
    const form = this.props.form;
    if (value && value !== form.getFieldValue('password')) {
      callback('Two passwords that you enter is inconsistent!');
    } else {
      callback();
    }
  };

  render() {
    const
      { loading } = this.state,
      { getFieldDecorator } = this.props.form;

    return (
      <div className='Register'>
        <h1>Reset Password</h1>

        <Form onSubmit={this.handleSubmit} className="form">
          <FormItem>
            {getFieldDecorator('password', {
              rules: [
                { required: true, message: 'Please input your password!' },
                { validator: this.validateToNextPassword }
              ]
            })(
              <Input
                prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                type="password"
                placeholder="Password"
              />
            )}
          </FormItem>

          <FormItem>
            {getFieldDecorator('confirm', {
              rules: [
                { required: true, message: 'Please confirm your password!' },
                { validator: this.compareToFirstPassword }
              ]
            })(
              <Input
                prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />}
                type="password"
                placeholder="Confirm password"
                onBlur={this.handleConfirmBlur}
              />
            )}
          </FormItem>

          <div className='buttons'>
            <Button
              className='register-button'
              disabled={loading}
            >
              <Link to={ROUTERS.LOGIN}>
                Cancel
              </Link>
            </Button>

            <Button
              type='primary'
              htmlType='submit'
              className='register-button'
              loading={loading}
            >
              Reset
            </Button>
          </div>
        </Form>
      </div>
    );
  }
}


export default graphql(RESET_PASSWORD)(Form.create()(ResetPassword));
