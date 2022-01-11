import React, { useMemo } from "react";
import { WalletContext } from "./context/WalletContext";
import { getWallet } from "./services/wallet";
import { I18nProvider } from "./services/i18n";

function Providers({ children }: React.PropsWithChildren<{}>) {
  const wallet = getWallet();

  const value = useMemo(
    () => ({
      wallet
    }),
    [wallet]
  );

  return (
    <I18nProvider>
      <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
    </I18nProvider>
  );
}

export default Providers;
