import { useState, useEffect } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import Loadable from "@/libs/loadable";
import { useNetwork } from "@/hooks";
import { initWallet } from "./services/wallet";
import { getSelectedWallet } from "./services/walletCache";
import style from "./App.scss";

const Loading = () => null;

const Home = Loadable({
  loader: () => import("@/pages/index"),
  loading: Loading
});
const Demo = Loadable({
  loader: () => import("@/pages/demo"),
  loading: Loading
});

function App() {
  const [inited, setInited] = useState(false);

  useEffect(() => {
    initWallet(getSelectedWallet()).then(() => {
      setInited(true);
    });
  }, []);

  const content = (
    <Switch>
      <Route exact path="/">
        <Home />
      </Route>
      <Route exact path="/demo">
        <Demo />
      </Route>
    </Switch>
  );

  return (
    <Router>
      <div className={style.Container}>
        <div className={style.Content}>{inited ? content : null}</div>
      </div>
    </Router>
  );
}

function AppWrap() {
  const { chainId } = useNetwork();
  return <App key={chainId} />;
}

export default AppWrap;
