import Login from './non-login/Login/Login';
import Register from './non-login/Register/Register';
import Todo from "./Todo/Todo";
import ResetPassword from './non-login/ResetPassword/ResetPassword';

export const ROUTERS = {
  INDEX: '/',

  LOGIN: '/login',
  REGISTER: '/register',
  RESET_PASSWORD: '/reset-password',

  TODO: '/todo'
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
    path: ROUTERS.RESET_PASSWORD,
    withoutLogin: true,
    exact: true,
    component: ResetPassword
  },
  {
    path: ROUTERS.TODO,
    component: Todo
  },
  {} //404
];

export default routes;


//TODO сделать стараницу reset-password и сделать, что б не редиректило на login
