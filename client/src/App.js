import React from "react";
import { BrowserRouter as Router, Route, Redirect } from "react-router-dom";

import "./App.css";

import routes, { ROUTERS } from "./routers";

class App extends React.Component {

  render() {
    const
      isLogined = localStorage.token,
      pathname = isLogined ? ROUTERS.TODO : ROUTERS.LOGIN,
      rule = (route) => route.path && [isLogined ? !route.withoutLogin : route.withoutLogin];

    console.log("pathname", pathname);

    return (
      <div className="App">
        <Router>
          <div>
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
          </div>
        </Router>
      </div>
    );
  }
}


export default App;
