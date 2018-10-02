import Login from './non-login/Login/Login';
import Register from './non-login/Register/Register';
import Todo from "./Todo/Todo";

export const ROUTERS = {
  INDEX: '/',

  LOGIN: '/login',
  REGISTER: '/register',

  TODO: '/'
};

const routes = [

  {
    path: ROUTERS.REGISTER,
    withoutLogin: true,
    exact: true,
    component: Register
  },
  {
    path: ROUTERS.LOGIN,
    withoutLogin: true,
    exact: true,
    component: Login
  },
  {
    path: ROUTERS.TODO,
    component: Todo
  },
  {} //404
];

export default routes;
