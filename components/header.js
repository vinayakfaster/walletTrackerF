import { useState } from "react";
import Link from "next/link";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import WalletSlider from "./WalletSlider";
import styles from "../styles/Header.module.css";
// import MonitorTransactions from "./MonitorTransactions";
import TransactionMonitor from "./TransactionMonitor";
import ShowFav from "./ShowFav";
import MultiplesWallet from "./MultiplesWallet";

export default function Header() {
  const { isConnected } = useAccount();
  const [showWalletSlider, setShowWalletSlider] = useState(false);
  const [showTransaction, setShowTransaction] = useState(false);
  const [showfav, setShowFav] = useState(false);
  const [multi, setMulti] = useState(false);

  const handleAddWalletClick = (e) => {
    e.preventDefault();
    setShowWalletSlider(true);
  };

  const handleShowTransaction = (e) => {
    e.preventDefault();
    setShowTransaction(true);
  };

  const handleCloseSlider = () => {
    setShowWalletSlider(false);
  };

  const handleCloseTransaction = () => {
    setShowTransaction(false);
  };

  const handleShowFavClick = (e) => {
    e.preventDefault();
    setShowFav(true);
  };

  const handleShowFavClose = (e) => {
    e.preventDefault();
    setShowFav(false);
  };

  const handleShowMultiwalletClick = (e) => {
    e.preventDefault();
    setMulti(true);
  };

  const handleCloseMultiwalletClick = (e) => {
    e.preventDefault();
    setMulti(false);
  };

  return (
    <section className={styles.header}>
      <div className={styles.logo}>
        <Link href="/">
          Wallet Tracker
        </Link>
      </div>
      <section className={styles.nav}>
        <ul>
          <li className={styles.nav_li}>
            <button className={styles.buttonAsLink} onClick={handleAddWalletClick}>Add Wallet</button>
          </li>
          <li className={styles.nav_li}>
            <button className={styles.buttonAsLink} onClick={handleShowTransaction}>Monitor Transactions</button>
          </li>
          <li className={styles.nav_li}>
            <button className={styles.buttonAsLink} onClick={handleShowMultiwalletClick}>MultiWallet</button>
          </li>
          <li className={styles.nav_li}>
            <button className={styles.buttonAsLink} onClick={handleShowFavClick}>Watchlist</button>
          </li>
          {isConnected && (
            <li>
              <ConnectButton showBalance={false} accountStatus={"avatar"} />
            </li>
          )}
        </ul>
      </section>
      {showWalletSlider && <WalletSlider onClose={handleCloseSlider} />}
      {showTransaction && <TransactionMonitor onClose={handleCloseTransaction} />}
      {showfav && <ShowFav onClose={handleShowFavClose} />}
      {multi && <MultiplesWallet onClose={handleCloseMultiwalletClick} />}
    </section>
  );
}
