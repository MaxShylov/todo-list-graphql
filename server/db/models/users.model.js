const bcrtypt = require('bcryptjs');
const mongoose = require('../connect');

const Schema = mongoose.Schema;

const UsersSchema = new Schema({
  id: Schema.Types.ObjectId,
  username: String,
  email: String,
  password: String,
  createAt: { type: Date, default: Date.now },
  countTasks: { type: Number, default: 0 },
  forgotPasswordToken: String,
  tasks: [{
    content: String,
    status: String,
    createAt: Date,
    edited: Boolean
  }],
  token: String
}, {
  collection: 'UsersCollection'
});


UsersSchema.pre('save', function (next) {
  if (this.isModified('password') || this.isNew) this.password = bcrtypt.hashSync(this.password, 12);
  next();
});

const UsersModel = mongoose.model('UsersModel', UsersSchema);

module.exports = UsersModel;
