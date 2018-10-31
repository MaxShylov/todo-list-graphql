import React from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';

import './App.scss';

import routes, { ROUTERS } from './routers';


class App extends React.Component {

  render() {
    const
      isLogined = localStorage.token,
      pathname = isLogined ? ROUTERS.TODO : ROUTERS.LOGIN,
      rule = (route) => route.path && (isLogined ? !route.withoutLogin : route.withoutLogin);

    return (
      <div className="App">
        <Router>
          <Switch>
            {routes.map(({ component: Component, ...props }, i) => (
              <Route
                key={i}
                {...props}
                render={data => (
                  rule(props)
                    ? <Component {...data} />
                    : <Redirect to={{ pathname }} />
                )}
              />
            ))}
          </Switch>
        </Router>
      </div>
    );
  }
}

export default App;
