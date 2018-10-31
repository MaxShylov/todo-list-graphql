const { PubSub } = require('apollo-server');
const isEmpty = require('lodash/isEmpty');
const escapeRegExp = require('lodash/escapeRegExp');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const UsersModel = require('../db/models/users.model');
const sendEmail = require('../nodemailer/index');

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

const createTokenForgotPassword = (body) => {
  return jwt.sign(
    body,
    process.env.SECRET_FORGOT
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

    register: async (root, { username, email, password, confirm }) => {
      if (!username) return ({ error: 'Username is require!' });
      if (!email) return ({ error: 'Email is require!' });
      if (!password) return ({ error: 'Password is require!' });
      if (!confirm) return ({ error: 'Confirm Password is require!' });
      if (password !== confirm) return ({ error: 'Password and Confirm Password must be identical!' });

      const userWithUsername = await UsersModel.find({ username: escapeRegExp(username) }).lean().exec();
      const userWithEmail = await UsersModel.find({ email }).lean().exec();

      if (!isEmpty(userWithUsername)) return ({ error: 'User already exist!' });
      if (!isEmpty(userWithEmail)) return ({ error: 'Email already exist!' });

      const newUser = await UsersModel.create({
        username,
        email,
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
      if (!username) return ({ error: 'Username is require!' });
      if (!password) return ({ error: 'Password is require!' });

      const user = await UsersModel.findOne({ username: escapeRegExp(username) });

      if (!user || !bcrypt.compareSync(password, user.password)) {
        return ({ error: 'User not exist or password not correct' });
      }

      const token = createToken({ id: user._id, username: user.username });

      user.set({ token });
      user.save((error) => {
        if (true) return { error };
      });

      return { token };
    },


    forgotPassword: async (root, { email }) => {
      const user = await UsersModel.findOne({ email });

      if (!user) return ({ error: 'Email not found!' });

      await UsersModel.findOne({ email }, (error, user) => {
        if (error) return { error };

        if (!user) return ({ error: 'Email not found!' });

        const forgotPasswordToken = createTokenForgotPassword({ id: user._id, email });

        sendEmail(email, forgotPasswordToken);

        user.set({ forgotPasswordToken });
        user.save((error) => {
          if (error) return { error };
        });
      });

      return { success: true };
    },


    resetPassword: async (root, { forgotPasswordToken, password, confirm }) => {
      if (!forgotPasswordToken) return ({ error: 'Error!' });
      if (!password) return ({ error: 'Password is require!' });
      if (!confirm) return ({ error: 'Confirm Password is require!' });
      if (password !== confirm) return ({ error: 'Password and Confirm Password must be identical!' });

      const user = await UsersModel.findOne({ forgotPasswordToken });

      if (!user) return { error: 'Error!' };

      const token = createToken({ id: user._id, username: user.username });

      user.set({
        password,
        token,
        forgotPasswordToken: null
      });

      user.save((error) => {
        if (error) return ({ error });
      });


      return { success: true };
    },


    logout: async (root, arg, { token }) => {
      const { id } = jwt.decode(token);

      const user = await UsersModel.findById(id);

      user.set({ token: null });
      user.save((error) => {
        if (error) return ({ error });
      });

      return ({ success: true });
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
