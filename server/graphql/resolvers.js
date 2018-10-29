const { PubSub } = require('apollo-server');
const isEmpty = require('lodash/isEmpty');
const escapeRegExp = require('lodash/escapeRegExp');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const UsersModel = require('../db/models/users.model');

const pubsub = new PubSub();

const TASK_CREATED = 'TASK_CREATED';
const TASK_REMOVED = 'TASK_REMOVED';
const TASK_EDITED = 'TASK_EDITED';
const SORT_TASKS = 'SORT_TASKS';


const createToken = (body) => {
  return jwt.sign(
    body,
    process.env.SECRET,
    { expiresIn: process.env.EXPIRES_IN }
  );
};


const resolvers = {
  Query: {
    checkToken: async (root, args, { token }) => {
      const user = await UsersModel.findOne({ token });
      let success = true, error;

      if (!user) {
        success = false;
        error = 'Token is not valid'
      }

      return { success, error }
    },
    tasks:
      async (root, args, context) => {
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

      if (!isEmpty(user)) return ({ error: 'User already exist!' });
      if (password !== confirm) return ({ error: 'Password field and confirm password field must be identical!' });

      const newUser = await UsersModel.create({
        username,
        password
      });

      const token = createToken({ id: newUser._id, username: newUser.username });

      await UsersModel.findById(newUser._id, (error, user) => {
        if (error) return { error };

        user.set({ token });
        user.save((error) => {
          if (error) return { error };
        });
      });

      return { token };
    },
    login: async (root, { username, password }) => {
      const user = await UsersModel.findOne({ username: escapeRegExp(username) });

      if (!user || !bcrypt.compareSync(password, user.password)) {
        return ({ error: 'User not exist or password not correct' });
      }

      const token = createToken({ id: user._id, username: user.username });

      await UsersModel.findById(user._id, (error, user) => {
        if (error) return { error };

        user.set({ token });
        user.save((error) => {
          if (error) return { error };
        });
      });

      return { token };
    },
    logout: async (root, arg, { token }) => {
      const { id } = jwt.decode(token);

      const request = await UsersModel.findById(id, (error, user) => {
        if (error) return ({ error });

        user.set({ token: null });
        user.save((error) => {
          if (error) return ({ error });
        });

        return ({ success: true });
      });

      return request
    },
    addTask: async (root, { content }, context) => {
      const
        _id = jwt.decode(context.token).id,
        newTask = {
          content,
          status: 'not-done',
          createAt: new Date().toISOString(),
          edited: false
        };

      await UsersModel.findById(_id, (err, user) => {
        if (err) return console.log(err);

        const { tasks } = user;

        user.set({
          tasks: [newTask, ...tasks],
          countTasks: tasks.length + 1
        });
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

        if (!task) return null;

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

        user.set({
          tasks: [...tasks.filter(i => i._id.toString() !== id)],
          countTasks: tasks.length - 1
        });
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

      await UsersModel.findByIdAndUpdate(_id, { $set: { tasks } }, async (err, result) => {
        if (err) return console.log(err);

        const { tasks } = await UsersModel.findById(_id);


        pubsub.publish(SORT_TASKS, { tasksSorted: tasks });

        return tasks;
      });
    }
  }
};

module.exports = resolvers;
