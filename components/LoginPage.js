
import React from 'react';
import styles from '../styles/LoginPage.module.css';
import { ConnectButton } from "@rainbow-me/rainbowkit";

const LoginPage = () => {
  const intro = "Keep track of your investments with real-time information!";
  const quote = "In the world of finance, patience is the key to success.";

  return (
    <div className={styles.container}>
      <div className={styles.intro}>{intro}</div>
      <div className={styles.connectMessage}>Please connect to your account to access portfolio.</div>
      <ConnectButton showBalance={false} accountStatus={"avatar"} />
    </div>
  );
}

export default LoginPage;
