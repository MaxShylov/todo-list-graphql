import { PubSub } from "apollo-server";
import isEmpty from "lodash/isEmpty";
import escapeRegExp from "lodash/escapeRegExp";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

import UsersModel from "../db/models/users.model";

const pubsub = new PubSub();

const TASK_CREATED = "TASK_CREATED";
const TASK_REMOVED = "TASK_REMOVED";
const TASK_EDITED = "TASK_EDITED";
const SORT_TASKS = "SORT_TASKS";


const createToken = (body) => {
  return jwt.sign(
    body,
    process.env.SECRET,
    { expiresIn: process.env.EXPIRES_IN }
  );
};


const resolvers = {
  Query: {
    tasks: async (root, args, context) => {
      const _id = jwt.decode(context.token).id;
      let data = await UsersModel.findOne({ _id });

      return data.tasks;
    }
  },
  Subscription: {
    taskCreated: {
      subscribe: () => pubsub.asyncIterator(TASK_CREATED)
    },
    taskEdited: {
      subscribe: () => pubsub.asyncIterator(TASK_EDITED)
    },
    taskRemoved: {
      subscribe: () => pubsub.asyncIterator(TASK_REMOVED)
    },
    tasksSorted: {
      subscribe: () => pubsub.asyncIterator(SORT_TASKS)
    }
  },
  Mutation: {
    register: async (root, { username, password, confirm }) => {
      const user = await UsersModel.find({ username: escapeRegExp(username) }).lean().exec();

      if (!isEmpty(user)) return ({ error: "User alredy exist" });
      if (password !== confirm) return ({ error: "Password field and confirm password field must be identical." });

      const newUser = await UsersModel.create({
        username,
        password
      });

      const token = createToken({ id: newUser._id, username: newUser.username });

      return { token };
    },
    login: async (root, { username, password }) => {
      const user = await UsersModel.findOne({ username: escapeRegExp(username) }).lean().exec();

      if (!isEmpty(user) && !bcrypt.compareSync(password, user.password)) {
        return ({ error: "User not exist or password not correct" });
      }

      const token = createToken({ id: user._id, username: user.username });

      return { token };
    },
    addTask: async (root, { content }, context) => {
      const
        _id = jwt.decode(context.token).id,
        newTask = {
          content,
          status: "not-done",
          createAt: new Date().toISOString(),
          edited: false
        };

      await UsersModel.findById(_id, (err, user) => {
        if (err) return console.log(err);

        const { tasks } = user;

        user.set({ tasks: [newTask, ...tasks] });
        user.save((err) => {
          if (err) return console.log(err);
        });

        const task = user.tasks[0];

        pubsub.publish(TASK_CREATED, { taskCreated: task });

        return task;
      });
    },
    editTask: async (root, { id, content, status }, context) => {
      const _id = jwt.decode(context.token).id;

      await UsersModel.findById(_id, (err, user) => {
        if (err) return console.log(err);

        const { tasks } = user;

        const task = tasks.filter(i => i._id.toString() === id)[0];

        if (content) task.content = content;
        if (status) task.status = status;
        task.edited = true;

        user.set({ tasks });
        user.save((err) => {
          if (err) return console.log(err);
        });

        pubsub.publish(TASK_EDITED, { taskEdited: task });

        return task;
      });
    },
    removeTask: async (root, { id }, context) => {
      const _id = jwt.decode(context.token).id;

      await UsersModel.findById(_id, (err, user) => {
        if (err) return console.log(err);

        const { tasks } = user;

        user.set({ tasks: [...tasks.filter(i => i._id.toString() !== id)] });
        user.save((err) => {
          if (err) return console.log(err);
        });

        pubsub.publish(TASK_REMOVED, { taskRemoved: { id } });

        return { id };
      });
    },
    sortTasks: async (root, { tasks }, context) => {
      const _id = jwt.decode(context.token).id;

      tasks = JSON.parse(tasks);

      await UsersModel.findById(_id, (err, user) => {
        if (err) return console.log(err);

        user.set({ tasks });
        user.save((err) => {
          if (err) return console.log(err);
        });

        pubsub.publish(SORT_TASKS, { tasksSorted: tasks });

        return tasks;
      });
    },
  }
};

export default resolvers;
