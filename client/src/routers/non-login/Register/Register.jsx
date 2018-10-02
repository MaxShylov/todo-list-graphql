import React, { Component } from "react";
import { Form, Icon, Input, Button, message } from "antd";
import { Link } from "react-router-dom";


import "./Register.css";
import { ROUTERS } from "../../index";
import gql from "graphql-tag";
import { graphql } from "react-apollo";

const FormItem = Form.Item;

const REGISTER = gql`
  mutation($username: String!, $password: String!, $confirm: String!) {
    register(username: $username, password: $password, confirm: $confirm) {
      token
      error
    }
  }
`;


class Register extends Component {
  state = {
    confirmDirty: false,
    loading: false
  };

  handleSubmit = (e) => {
    e.preventDefault();

    const { form, mutate } = this.props;

    form.validateFields((err, values) => {
      console.log("values", values);

      if (!err) {
        mutate({ variables: { ...values } })
          .then((res) => {
            const { error, token } = res.data.register;

            if (error) return message.error(error);

            localStorage.setItem("token", token);
            window.location.reload();
          })
          .catch(err => console.error(err));
      }
    });
  };

  handleConfirmBlur = (e) => {
    const value = e.target.value;
    this.setState({ confirmDirty: this.state.confirmDirty || !!value });
  };


  validateToNextPassword = (rule, value, callback) => {
    const form = this.props.form;

    if (value && this.state.confirmDirty) form.validateFields(["confirm"], { force: true });

    if (value && value.length < 1) callback("Password should have more then 8 characters!");

    callback();
  };


  compareToFirstPassword = (rule, value, callback) => {
    const form = this.props.form;
    if (value && value !== form.getFieldValue("password")) {
      callback("Two passwords that you enter is inconsistent!");
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
        <h1>Register</h1>

        <Form onSubmit={this.handleSubmit} className="form">
          <FormItem>
            {getFieldDecorator("username", {
              rules: [{ required: true, message: "Please input your username!" }]
            })(
              <Input
                prefix={<Icon type="user" style={{ color: "rgba(0,0,0,.25)" }} />}
                placeholder="Username"
              />
            )}
          </FormItem>

          <FormItem>
            {getFieldDecorator("password", {
              rules: [
                { required: true, message: "Please input your password!" },
                { validator: this.validateToNextPassword }
              ]
            })(
              <Input
                prefix={<Icon type="lock" style={{ color: "rgba(0,0,0,.25)" }} />}
                type="password"
                placeholder="Password"
              />
            )}
          </FormItem>

          <FormItem>
            {getFieldDecorator("confirm", {
              rules: [
                { required: true, message: "Please confirm your password!" },
                { validator: this.compareToFirstPassword }
              ]
            })(
              <Input
                prefix={<Icon type="lock" style={{ color: "rgba(0,0,0,.25)" }} />}
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
              Register
            </Button>
          </div>
        </Form>
      </div>
    );
  }
}


export default graphql(REGISTER)(Form.create()(Register));
