import Dialog from "@reach/dialog";
import { useI18n } from "@/services/i18n";
import "@reach/dialog/styles.css";
import { ConnectorType } from "@/services/wallet";
import { ReactComponent as MetaMaskIcon } from "./icons/metamask.svg";
import { ReactComponent as TokenPocketIcon } from "./icons/tokenpocket.svg";
import { ReactComponent as TrustWalletIcon } from "./icons/trustwallet.svg";
import { ReactComponent as WalletConnectIcon } from "./icons/wallet-connect.svg";
import style from "./WalletSelector.scss";
import CloseImg from "./close.png";

interface Props {
  onDismiss: () => void;
  onSelect: (type: ConnectorType) => void;
}

export default function WalletSelector({ onDismiss, onSelect }: Props) {
  const i18n = useI18n();

  return (
    <Dialog
      className={style.Container}
      onDismiss={onDismiss}
      aria-label="Connect to a wallet"
    >
      <div className={style.Head}>
        <div className={style.Title}>
          {i18n("walletselector-title", "Connect to a wallet")}
        </div>
        <button className={style.CloseBtn} onClick={onDismiss}>
          <img src={CloseImg} alt="close" />
        </button>
      </div>
      <div className={style.Body}>
        <div
          className={style.item}
          onClick={() => {
            onSelect(ConnectorType.MetaMask);
            onDismiss();
          }}
        >
          <MetaMaskIcon className={style.itemIcon} />
          <span className={style.itemTitle}>MetaMask</span>
        </div>
        <div
          className={style.item}
          onClick={() => {
            onSelect(ConnectorType.TrustWallet);
            onDismiss();
          }}
        >
          <TokenPocketIcon className={style.itemIcon} />
          <span className={style.itemTitle}>TokenPocket</span>
        </div>
        <div
          className={style.item}
          onClick={() => {
            onSelect(ConnectorType.TokenPocket);
            onDismiss();
          }}
        >
          <TrustWalletIcon className={style.itemIcon} />
          <span className={style.itemTitle}>Trust Wallet</span>
        </div>
        <div
          className={style.item}
          onClick={() => {
            onSelect(ConnectorType.WalletConnect);
            onDismiss();
          }}
        >
          <WalletConnectIcon className={style.itemIcon} />
          <span className={style.itemTitle}>WalletConnect</span>
        </div>
      </div>
    </Dialog>
  );
}
