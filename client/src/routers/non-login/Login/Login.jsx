import React, { Component } from "react";
import { Form, Icon, Input, Button, message } from "antd";
import Link from "react-router-dom/es/Link";

import "./Login.css";
import gql from "graphql-tag";
import { graphql } from "react-apollo";

const FormItem = Form.Item;

const LOGIN = gql`
  mutation($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      token
      error
    }
  }
`;


class Login extends Component {
  state = { loading: false };


  handleSubmit = (e) => {
    e.preventDefault();

    const { form, mutate } = this.props;

    form.validateFields((err, values) => {
      if (!err) {
        mutate({ variables: { ...values } })
          .then((res) => {
            const { error, token } = res.data.login;

            if (error) return message.error(error);

            localStorage.setItem("token", token);
            window.location.reload();
          })
          .catch(err => console.error(err));
      }
    });
  };

  render() {
    const
      { loading } = this.state,
      { getFieldDecorator } = this.props.form;

    return (
      <div className='Login'>
        <h1>Login to ToDo</h1>

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
              rules: [{ required: true, message: "Please input your password!" }]
            })(
              <Input
                prefix={<Icon type="lock" style={{ color: "rgba(0,0,0,.25)" }} />}
                type="password"
                placeholder="Password"
              />
            )}
          </FormItem>
          <FormItem>
            <Button
              type="primary"
              htmlType="submit"
              className="form-button"
              loading={loading}
            >
              Log in
            </Button>
          </FormItem>
          Or <Link to={"/register"}>register now!</Link>

          <a
            className="form-forgot"
            onClick={() => alert("Don't work! =(")}
          >
            Forgot password
          </a>
        </Form>
      </div>
    );
  }
}


export default graphql(LOGIN)(Form.create()(Login));
