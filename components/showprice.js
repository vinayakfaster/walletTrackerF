import React, { useState, useEffect } from 'react';
import styles from '../styles/ShowPrice.module.css'; // Ensure the correct import path
import Link from 'next/link';
import LoginPage from './LoginPage';
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import LoadingAnimation from './LoadingAnimation';
import axios from 'axios';
import TokenDetail from './TokenDetail';


const ShowPrice = ({ data, tokenPriceChange, bscdata, bsctokenPriceChange }) => {
  const { address } = useAccount();
  const [accountAddress, setAccountAddress] = useState('');

  
useEffect(() => {   
    setAccountAddress(address);
  }, []); 

  const [activeTab, setActiveTab] = useState('etherScan');
  const [searchQuery, setSearchQuery] = useState('');
  const { isConnected } = useAccount();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedToken, setSelectedToken] = useState(null);

  // console.log(bscdata)

  useEffect(() => {
    if (isConnected) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, [isConnected]);

  if (!isLoggedIn) {
    return (
      <div>
        <LoadingAnimation size={50} stroke={4} speed={2} color="black" />
      </div>
    );
  }

  if (!data || !tokenPriceChange) {
    return <div>Loading...</div>; 
  }

  // console.log(bsctokenPriceChange)
  // console.log(tokenPriceChange)

  const formatTokenBalanceinK = (balance, decimal) => {

    balance = Number(balance);
    const adjustedBalance = balance / Math.pow(10, decimal);
    if (adjustedBalance >= 1000) {
      return (adjustedBalance / 1000).toFixed(1) + 'k';
    } else {
      return adjustedBalance.toFixed(2);
    }
  };


  const mergedDataBSC = bscdata.map(token => {
    const matchingTokenPriceChange = bsctokenPriceChange.find(priceChange => priceChange.address === token.address);
    return {
      ...token,
      priceChange: matchingTokenPriceChange || null
    };
  });


  const mergedDataEtherScan = data.map(token => {
    const matchingTokenPriceChange = tokenPriceChange.find(priceChange => priceChange.address === token.address);
    return {
      ...token,
      priceChange: matchingTokenPriceChange || null
    };
  });

  const mergedData = [...mergedDataEtherScan, ...mergedDataBSC];


  // console.log(mergedData)
  // console.log(mergedDataBSC)
  const formatTokenBalance = (balance, decimal) => {
    balance = Number(balance);
    const adjustedBalance = balance / Math.pow(10, decimal);
    return adjustedBalance.toFixed(2); 
  };



  const filteredData = activeTab === 'etherScan' ? mergedDataEtherScan : mergedDataBSC;
  const filteredTokens = filteredData.filter(token => token.priceChange !== null && token.priceUsd !== null);

  const handleSearchInputChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const filteredTokensBySearch = filteredTokens.filter(token =>
    token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    token.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  ).map(token => ({
    ...token,
    holdingValue: formatTokenBalance(token.balance, token.decimals) * (Number(token.priceUsd) || 0)
  })).sort((a, b) => b.holdingValue - a.holdingValue);
  

  const totalHolding = filteredTokensBySearch.reduce((total, token) => total + Number(formatTokenBalance(token.balance, token.decimal)), 0);

  const totalPortfolioValue = filteredTokensBySearch.reduce((total, token) => {
    const tokenHolding = formatTokenBalance(token.balance, token.decimals) * (Number(token.priceUsd));
    return total + tokenHolding;
  }, 0);

  // const handleAddToFav = (tokenName) => {
  //   if (isTokenInWatchlist(tokenName)) {
  //     removeFromWatchlist(tokenName);
  //   } else {
  //     addToWatchlist(tokenName);
  //   }
  // };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };


  // console.log(filteredTokensBySearch);

  const handleAddToFav = async (tokenName, address) => {
    try {
      const response = await axios.get("https://wallettrackerb.onrender.com/addFavToken", {
        params: { userAddress: accountAddress, tokenName: tokenName, tokenAddress: address },
      });
      console.log(response);
      if (response.data.success) {
        
        alert('Token added to favorites successfully!');
      }
    } catch (error) {
      console.error("Error adding wallet address:", error);
    }
  };
  
  return (
    <section className={styles.main}>
   
      <header className={styles.header}>
        <h1>Portfolio Overview</h1>
      </header>
      
      <div className={styles.tabContainer}>
        <div
          className={`${styles.tab} ${activeTab === 'etherScan' ? styles.activeTab : ''}`}
          onClick={() => handleTabChange('etherScan')}
        >
          ETHERScan
        </div>
        <div
          className={`${styles.tab} ${activeTab === 'bscScan' ? styles.activeTab : ''}`}
          onClick={() => handleTabChange('bscScan')}
        >
          BSCscan
        </div>

        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="Search tokens..."
            value={searchQuery}
            onChange={handleSearchInputChange}
            className={styles.searchInput}
          />
      
        </div>
        <div className={styles.totalPortfolioValue}>Portfolio Value ${totalPortfolioValue.toFixed(2)}</div>
      </div>


      <section className={styles.result}>
        <table className={styles.tokenTable}>
          <thead>
            <tr>
              <th className={styles.name}>Token Name</th>
              <th className={styles.amount}>Price USD</th>
              <th className={styles.amount}>Holding(value)</th>
              <th className={styles.amount}>Holder Count</th>
              <th className={styles.amount}>5m</th>
              <th className={styles.amount}>1h</th>
              <th className={styles.amount}>6h</th>
              <th className={styles.amount}>24h</th>
              <th className={styles.amount}>7d</th>
              <th className={styles.amount}>Action</th>
            </tr>
          </thead>
          <tbody>
  {filteredTokensBySearch.map((token, index) => (
    <tr className={styles.tokenContainer} key={index}>
      <td>
        <p
          className={styles.name}
          onClick={() => {
            setSelectedToken(token.address);
            setShowPopup(true);
          }}
        >
          {token.name || token.symbol || 'Unknown'}
        </p>
        <span className={styles.balance}>{formatTokenBalanceinK(token.balance, token.decimals)}</span>
      </td>
      <td className={styles.amount}>${Number(token.priceUsd || 'N/A').toFixed(4)}</td>
      <td>${token.holdingValue.toFixed(2)}</td>
                <td className={styles.amount}>{token.holdersCount || 'N/A'}</td>
                <td className={`${styles.amount} ${token.priceChange?.priceChange?.m5 < 0 ? styles.negativeChange : (token.priceChange?.priceChange?.m5 > 0 ? styles.positiveChange : '')}`}>{token.priceChange?.priceChange?.m5 || '  '}</td>
                <td className={`${styles.amount} ${token.priceChange?.priceChange?.h1 < 0 ? styles.negativeChange : (token.priceChange?.priceChange?.h1 > 0 ? styles.positiveChange : '')}`}>{token.priceChange?.priceChange?.h1 || '  '}</td>
                <td className={`${styles.amount} ${token.priceChange?.priceChange?.h6 < 0 ? styles.negativeChange : (token.priceChange?.priceChange?.h6 > 0 ? styles.positiveChange : '')}`}>{token.priceChange?.priceChange?.h6 || '  '}</td>
                <td className={`${styles.amount} ${token.price.diff < 0 ? styles.negativeChange : (token.price.diff > 0 ? styles.positiveChange : '')}`}>{token.price.diff || '  '}</td>
                <td className={`${styles.amount} ${token.price.diff7d < 0 ? styles.negativeChange : (token.price.diff7d > 0 ? styles.positiveChange : '')}`}>{token.price.diff7d || '  '}</td>
                <td className={styles.amount}>{token.priceChange?.pair?.pairAddress || '  '}</td>
                <td>
                  <button className={styles.favoriteButton} onClick={() => handleAddToFav( token.name, token.address)} >
                   {'Fav'}
                  </button>
                </td>
           
              </tr>
            ))}
            {showPopup && selectedToken && (
              <div className={styles.popup}>
                <div className={styles.popupContent}>
                  <TokenDetail
                    baseTokenAddress={selectedToken}
                    activeTab={activeTab}
                    onClose={() => setShowPopup(false)}
                  />
                </div>
              </div>
            )}


          </tbody>

        </table>
      </section>
    </section>
  );
}

export default ShowPrice;
