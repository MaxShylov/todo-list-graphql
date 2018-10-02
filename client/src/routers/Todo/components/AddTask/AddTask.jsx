import gql from "graphql-tag";
import React from "react";
import Button from "antd/lib/button";
import { graphql } from "react-apollo/";
import Form from "antd/lib/form";
import Input from "antd/lib/input";

import "./AddTask.css";

const InputGroup = Input.Group;
const FormItem = Form.Item;

const ADD_TASK = gql`
  mutation ($content: String!) {
    addTask(content: $content) {
      id
    }
  }
`;


class AddTask extends React.Component {

  onSubmit = (e) => {
    e.preventDefault();

    const { form, mutate } = this.props;

    form.validateFields((err, { content }) => {
      if (!err) {

        mutate({ variables: { content } })
          .then(() => form.resetFields())
          .catch(err => console.log(err));
      }
    });
  };

  render() {
    const { form: { getFieldDecorator } } = this.props;

    return (
      <Form onSubmit={this.onSubmit} className='AddMessage'>
        <InputGroup compact>
          <FormItem>
            {getFieldDecorator("content", {
              rules: [{ required: false }]
            })(
              <Input className='input-add' placeholder='Input your task' />
            )}

            <Button
              className='button-add'
              htmlType='submit'
              type='primary'
            >
              Add Task
            </Button>
          </FormItem>
        </InputGroup>
      </Form>
    );
  }
}

export default graphql(ADD_TASK)(Form.create()(AddTask));

