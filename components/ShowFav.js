import { useState, useEffect } from "react";
import styles from "../styles/ShowFav.module.css";
import axios from "axios";
import { useAccount } from "wagmi";
import TokenDetail from './TokenDetail';

const ShowFav = ({ onClose }) => {
  const { address } = useAccount();
  const [tokenDetail, setTokenDetail] = useState(null);
  const [bscTokenDetail, setBscTokenDetail] = useState(null);
  const { isConnected } = useAccount();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [walletAddresses, setWalletAddresses] = useState([]);
  const [activeTab, setActiveTab] = useState('eth');
  const [selectedToken, setSelectedToken] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  
  useEffect(() => {
    if (isConnected) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, [isConnected]);
  
  useEffect(() => {
    const fetchWalletAddresses = async () => {
      if (!address) return;
      try {
        const response = await axios.get('http://localhost:5003/getFav', {
          params: { address },
        });
        const favTokens = response.data.tokens;
        const favTokensString = favTokens.map(token => token.address).join(',');
        setWalletAddresses(favTokensString.split(','));
      } catch (error) {
        console.error('Error fetching wallet addresses:', error.response ? error.response.data : error.message);
      }
    };
    fetchWalletAddresses();
  }, [address]); 
  
  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const ethGeckoTerminalUrl = `https://api.geckoterminal.com/api/v2/networks/eth/tokens/multi/${walletAddresses}`;
        const ethResponse = await axios.get(ethGeckoTerminalUrl);
        setTokenDetail(ethResponse.data.data);
    
        const bscGeckoTerminalUrl = `https://api.geckoterminal.com/api/v2/networks/bsc/tokens/multi/${walletAddresses}`;
        const bscResponse = await axios.get(bscGeckoTerminalUrl);
        setBscTokenDetail(bscResponse.data.data);
      } catch (error) {
        console.error("Error fetching token prices:", error);
      }
    };
  
    fetchPrices();
  }, [walletAddresses]);

  const handleRemoveWallet = async (addressToRemove) => {
    try {
      await axios.get("http://localhost:5003/removeFavAddress", {
        params: { address, addressToRemove },
      });
      // Update the token array after successful removal
      setWalletAddresses(prevAddresses => prevAddresses.filter(addr => addr !== addressToRemove));
    } catch (error) {
      console.error("Error removing wallet address:", error);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.slider}>
        <button className={styles.closeButton} onClick={onClose}>Close</button>
        <h2>Wallets To Track</h2>
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${activeTab === 'eth' ? styles.active : ''}`}
            onClick={() => setActiveTab('eth')}
          >
            Ethereum
          </button>
          <button
            className={`${styles.tab} ${activeTab === 'bsc' ? styles.active : ''}`}
            onClick={() => setActiveTab('bsc')}
          >
            BSC
          </button>
        </div>
        <div className={`${styles.tableContainer} ${activeTab === 'eth' ? '' : styles.hidden}`}>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Symbol</th>
                <th>Price (USD)</th>
                <th>Market Cap (USD)</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {tokenDetail && tokenDetail.map((token, index) => (
                <tr key={index}>
                  <td className={styles.name} onClick={() => {
                    setSelectedToken(token.attributes.address);
                    setShowPopup(true);
                  }}>
                    {token.attributes.name || token.attributes.symbol || 'Unknown'}
                  </td>
                  <td>{token.attributes.symbol}</td>
                  <td>{token.attributes.price_usd}</td>
                  <td>{(token.attributes.market_cap_usd / 1000000).toFixed(2)}M</td>
                  <td>
                    <button  className={styles.button}  onClick={() => handleRemoveWallet(token.attributes.address)}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className={`${styles.tableContainer} ${activeTab === 'bsc' ? '' : styles.hidden}`}>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Symbol</th>
                <th>Price (USD)</th>
                <th>Market Cap (USD)</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {bscTokenDetail && bscTokenDetail.map((token, index) => (
                <tr key={index}>
                  <td className={styles.name} onClick={() => {
                    setSelectedToken(token.attributes.address);
                    setShowPopup(true);
                  }}>
                    {token.attributes.name || token.attributes.symbol || 'Unknown'}
                  </td>
                  <td>{token.attributes.symbol}</td>
                  <td>{token.attributes.price_usd}</td>
                  <td>{(token.attributes.market_cap_usd / 1000000).toFixed(2)}M</td>
                  
                    <button  className={styles.button} onClick={() => handleRemoveWallet(token.attributes.address)}>Remove</button>
                  
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {showPopup && selectedToken && (
          <div className={styles.popup}>
            <div className={styles.popupContent}>
              <TokenDetail
                baseTokenAddress={selectedToken}
                activeTab={activeTab}
                onClose={() => {
                  setShowPopup(false);
                  setSelectedToken(null);
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
  
};


export default ShowFav;
