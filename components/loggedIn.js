import { useEffect, useState } from "react";
import axios from 'axios';
import Price from "./Price"; 
import LoginPage from "./LoginPage";
import { useAccount } from "wagmi";  

export default function LoggedIn() {
  const address = "0x4e6FB88e48711d9f692942304D48A3aFc843e99A";
  // const {address } = useAccount();
  const [showResult, setShowResult] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [eth, setEth] = useState([]);
  const [bsc, setBsc] = useState([]);

  const { isConnected } = useAccount();

  useEffect(() => {
    if (isConnected) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }
  }, [isConnected]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "https://wallettrackerb.onrender.com/getwalletbalance",
          {
            params: { address },
          }
        );

        setEth(response.data)
  
        const BSCresponse = await axios.get(
          "https://wallettrackerb.onrender.com/getBscWalletBalance",
          {
            params: { address },
          }
        );

        setBsc(BSCresponse.data)

        setShowResult(true);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
  
    fetchData();
  }, [address]);
  
  return (
    <>
      {isLoggedIn ? (
        <section>
          {showResult && bsc.length > 0 && <Price balances={eth} bscData={bsc} />}
        </section>
      ) : (
        <LoginPage />
      )}
    </>
  );
}
