import { useState, useEffect } from "react";
import styles from "../styles/WalletSlider.module.css";
import axios from "axios";
import { useAccount } from "wagmi"; 

const WalletSlider = ({ onClose }) => {
 
  const { address } = useAccount();
  // const address = "0x4e6FB88e48711d9f692942304D48A3aFc843e99A"; 
  const [newWalletAddress, setNewWalletAddress] = useState("");
  const [walletAddresses, setWalletAddresses] = useState([]);

 
  useEffect(() => {
    const fetchWalletAddresses = async () => {
      if (!address) return; 
      try {
        const response = await axios.get('https://wallettrackerb.onrender.com/getWalletAddresses', {
            params: { address },
        });
        console.log(response.data);
        if (response.data.walletAddresses) {
          setWalletAddresses(response.data.walletAddresses);
        }
      } catch (error) {
          console.error('Error fetching wallet addresses:', error.response ? error.response.data : error.message);
      }
    };
    fetchWalletAddresses();
  }, [address]);

  const handleAddWallet = async () => {
    if (newWalletAddress.trim() === "") return;
    try {
      const response = await axios.get("https://wallettrackerb.onrender.com/addWalletAddress", {
        params: { address, newwallet: newWalletAddress.trim() },
      });
      console.log(response);
      setWalletAddresses(prev => [...prev, newWalletAddress.trim()]);
      setNewWalletAddress("");
    } catch (error) {
      console.error("Error adding wallet address:", error);
    }
  };

  const handleRemoveWallet = async (addressToRemove) => {
    try {
      await axios.get("https://wallettrackerb.onrender.com/removeAddress", {
        params: { address, addressToRemove },
      });
      setWalletAddresses(walletAddresses.filter(addr => addr !== addressToRemove));
    } catch (error) {
      console.error("Error removing wallet address:", error);
    }
  };

  console.log(walletAddresses)

  return (
    <div className={styles.overlay}>
      <div className={styles.slider}>
        <button className={styles.closeButton} onClick={onClose}>Close</button>
        <h2>Wallets To Track</h2>
        <div className={styles.walletList}>
          {walletAddresses.map((addr, index) => (
            <div key={index} className={styles.walletItem}>
              <span>{addr}</span>
              <button onClick={() => handleRemoveWallet(addr)}>Remove</button>
            </div>
          ))}
        </div>
        <input  className={styles.input}
          type="text"
          placeholder="ERC20/BRC20"
          value={newWalletAddress}
          onChange={(e) => setNewWalletAddress(e.target.value)}
        />
        <button className={styles.button}onClick={handleAddWallet}>Add Wallet</button>
      </div>
    </div>
  );
};

export default WalletSlider;
