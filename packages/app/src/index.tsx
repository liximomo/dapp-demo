import "./style/index.css";
import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import Providers from "./Providers";
import { initWallet } from "./services/wallet";
import { getSelectedWallet } from "./services/walletCache";

initWallet(getSelectedWallet()).then(() => {
  ReactDOM.render(
    <React.StrictMode>
      <Providers>
        <App />
      </Providers>
    </React.StrictMode>,
    document.getElementById("root")
  );
});
