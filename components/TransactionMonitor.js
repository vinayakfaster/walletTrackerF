// export default TransactionMonitor;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from '../styles/TransactionMonitor.module.css';

import { useAccount } from "wagmi"; 

const TransactionMonitor = ({ onClose }) => {
  const [transactions, setTransactions] = useState([]);
  const [blockNumber, setBlockNumber] = useState(null);
  const [tokenSymbols, setTokenSymbols] = useState([]);
  const [showMore, setShowMore] = useState(false);
  const { address } = useAccount();
  const [walletAddresses, setWalletAddresses] = useState([]);
const [addressesSymbols, setAddressesSymbols] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpansion = () => {
    setIsExpanded(!isExpanded);
  };

  const getDisplayText = (text) => {
    if (isExpanded) {
      return text;
    }
    return text.slice(0, 4) + '...';
  }
  
  const toggleShowMore = () => {
    setShowMore((prevShowMore) => !prevShowMore);
  };
  const [monitorAddress, setMonitorAddress] = useState([]);


  useEffect(() => {
    const socket = new WebSocket('ws://wallettrackerb.onrender.com');
  
    socket.onopen = () => {
      console.log('WebSocket connected');
  
      // const userAddress = address;
  
      socket.send(JSON.stringify({ type: 'address', data: address }));
  
    };
  
    socket.onmessage = async (event) => {
      const data = JSON.parse(event.data);
  
      if (data.type === 'blockNumber') {
        setBlockNumber(data.blockNumber);
      } else if (data.type === 'transaction') {
        const txHash = data.transactionData.hash;
        const txInfo = data.transactionData;
        console.log(txHash);
        console.log(txInfo);
        setTransactions((prevTransactions) => [...prevTransactions, txInfo]);
      } else if (data.type === 'MonitorAddress') {
          setMonitorAddress(data.walletAddresses);
        }
      
    };
  
    console.log(monitorAddress);
  
    socket.onclose = () => {
      ws.send(JSON.stringify({ type: 'closeConnection' }));
      console.log('WebSocket closed');
    };
  
    return () => {
      socket.close();
    };
  }, []); 

  
  useEffect(() => {
    const uniqueTokenSymbols = Array.from(new Set(transactions.flatMap(tx => 
      (tx.transactionAction || []).map(action => action.detail)
    )));
    setTokenSymbols(uniqueTokenSymbols);
    
    
    const uniqueAddressesSymbols = Array.from(new Set(transactions.flatMap(tx => 
      (tx.transactionAction || []).flatMap(action => action.uniqueTokenAddressesSymbols)
    )));
    setAddressesSymbols(uniqueAddressesSymbols);

    
  }, [transactions]);
  



  console.log(addressesSymbols);
  return (
    <div className={styles.overlay}>
      <button className={styles.closeButton} onClick={onClose}>Close</button>
      <div className={styles.blockNumber}>
        {!blockNumber && 'Waiting for new block mine...'}
        {blockNumber && `Block Number: ${blockNumber}`}
      </div>
      <div className={styles.blockNumber}>
        {!blockNumber && '...'}
        {blockNumber && `Monitoring Addresses: ${monitorAddress}`}
      </div>
      <div className={styles.transactionBox}>
        <div className={styles.transactionGrid}>
          {transactions ? (
            transactions.length > 0 ? (
              transactions.map((tx, index) => (
                <div key={index} className={styles.transactionItem}>
                  <h2>Transaction</h2>
                  <div className={styles.transactionDetails}>
                    <div className={styles.transactionLabel}>Hash: </div>
                    <div className={styles.transactionValue}>{tx ? tx.hash : 'N/A'}</div>
                  </div>
                  <div className={styles.transactionDetails}>
                    <div className={styles.transactionLabel}>From: </div>
                    <div className={styles.transactionValue}>{tx ? tx.from : 'N/A'}</div>
                  </div>
                  <div className={styles.transactionDetails}>
                    <div className={styles.transactionLabel}>To: </div>
                    <div className={styles.transactionValue}>{tx ? tx.to : 'N/A'}</div>
                  </div>
                  <div className={styles.transactionDetails}>
                    <div className={styles.transactionLabel}>Value: </div>
                    <div className={styles.transactionValue}>{tx ? tx.value : 'N/A'}</div>
                  </div>
                  <div className={styles.transactionDetails}>
                    <div className={styles.transactionLabel}>Contract Symbol: </div>
                    <div className={styles.transactionValue}>{tx ? tx.tokenSymbol : 'N/A'}</div>
                  </div>
                  <div className={styles.transactionDetails}>
                    <div className={styles.transactionLabel}></div>
                    <div className={styles.transactionValue}>
                      {tokenSymbols && tokenSymbols.flat().map((symbol, index) => (
                        <div key={index}>
                          {showMore || index < 2 ? symbol : null}
                        </div>
                      ))}
                      {tokenSymbols && tokenSymbols.flat().length > 2 && (
                        <button className={styles.button} onClick={toggleShowMore}>
                          {showMore ? 'Show Less' : 'Show More'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p>No transactions available</p>
            )
          ) : (
            <p>Loading transactions...</p>
          )}
        </div>
      </div>
      <button className={styles.closeButton} onClick={onClose}>Close</button>
    </div>
  );
};

export default TransactionMonitor;
