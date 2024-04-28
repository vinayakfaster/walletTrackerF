import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Chart from 'chart.js/auto';
import styles from '../styles/TokenDetail.module.css';

const TokenDetail = ({ tokenName, activeTab, onClose, baseTokenAddress }) => {
  const [tokenDetail, setTokenDetail] = useState(null);
  const [myPosition, setMyPosition] = useState(null);
  const [firstTransfer, setFirstTransfer] = useState('');
  const [lastTransfer, setLastTransfer] = useState('');
  const [holderData, setHolderData] = useState(null);
  const [chart, setChart] = useState(null);
  const walletAddress = "0x4e6FB88e48711d9f692942304D48A3aFc843e99A";  

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!baseTokenAddress) return;

      
        const transferResponse = await axios.get("https://wallettrackerb.onrender.com/transfers", {
          params: { tokenAddress: baseTokenAddress, walletAddress: "0x4e6FB88e48711d9f692942304D48A3aFc843e99A" }
        });

        const { firstTransfer, lastTransfer } = transferResponse.data;
        setFirstTransfer(firstTransfer.timestamp);
        setLastTransfer(lastTransfer.timestamp);

        const geckoTerminalUrl = `https://api.geckoterminal.com/api/v2/networks/eth/tokens/${baseTokenAddress}`;
        const tokenDetailResponse = await axios.get(geckoTerminalUrl);
        setTokenDetail(tokenDetailResponse.data.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [baseTokenAddress]);

  useEffect(() => {
    const handleResize = () => {
      const chartContainer = document.querySelector('.' + styles.chartContainer);
      if (chartContainer) {
        const chartCanvas = document.getElementById('pie-chart');
        chartCanvas.style.width = '100%';
        chartCanvas.style.height = chartContainer.offsetHeight + 'px';
      }
    };
  
    window.addEventListener('resize', handleResize);
    handleResize(); 
  
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  

  useEffect(() => {
    const fetchHolderData = async () => {
      if (!baseTokenAddress || !tokenDetail) return;
      try {
        const holdersResponse = await axios.get("https://wallettrackerb.onrender.com/holders", {
          params: { contractAddress: baseTokenAddress }
        });

        const holderData = holdersResponse.data.map(holder => ({
          address: holder.address,
          balance: parseFloat(holder.balance),
          holdingValue: parseFloat(holder.balance) * parseFloat(tokenDetail.attributes.price_usd)
        }));

        setHolderData(holderData);
        const index = holderData.findIndex(holder => holder.address.toLowerCase() === walletAddress.toLowerCase());
        if (index !== -1) {
          const myPositionDetail = holderData[index];
          
          setMyPosition(`${index + 1}`);
        } else {
          setMyPosition("You do not hold any tokens of this type.");
        }
      } catch (error) {
        console.error('Error fetching holder data:', error);
      }
    };
    fetchHolderData();
  }, [baseTokenAddress, tokenDetail]);

  useEffect(() => {
    if (holderData && holderData.length > 0) {
      const categories = {
        '1$ - 10$': 0,
        '10$ - 100$': 0,
        '100$ - 1K$': 0,
        '1K$ - 10K$': 0,
        '10K$ - 100K$': 0,
        '100K$ - 1M$': 0,
        '1M$+': 0
      };

      holderData.forEach(holder => {
        const value = holder.holdingValue;
        if (value < 10) categories['1$ - 10$'] += value;
        else if (value < 100) categories['10$ - 100$'] += value;
        else if (value < 1000) categories['100$ - 1K$'] += value;
        else if (value < 10000) categories['1K$ - 10K$'] += value;
        else if (value < 100000) categories['10K$ - 100K$'] += value;
        else if (value < 1000000) categories['100K$ - 1M$'] += value;
        else categories['1M$+'] += value;
      });

      const ctx = document.getElementById('pie-chart').getContext('2d');
      if (chart) chart.destroy();
      const newChart = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: Object.keys(categories),
          datasets: [{
            data: Object.values(categories),
            backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#72a8d1', '#91c4c8', '#f09ae9', '#e9c8f0', '#8e9aaf', '#a0c0cf', '#ddd6f3']
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              position: 'top',
            },
            tooltip: {
              mode: 'index',
              intersect: false,
            }
          }
        }
      });
      setChart(newChart);
    }
  }, [holderData]);


  return (
    <div className={styles.overlay}>
      <div className={styles.slider}>
        <button className={styles.closeButton} onClick={onClose}>Close</button>
        <h2>Token Details</h2>
        {tokenDetail ? (
          <div>
            <h2>{tokenDetail.attributes.name} ({tokenDetail.attributes.symbol})</h2>
            <img src={tokenDetail.attributes.image_url} alt={tokenDetail.attributes.name} />
            <table className={styles.tokenTable}>
              <tbody>
                <tr>
                  <td>Price:</td>
                  <td>${tokenDetail.attributes.price_usd}</td>
                </tr>
                <tr>
                  <td>Address:</td>
                  <td>{tokenDetail.attributes.address}</td>
                </tr>
                <tr>
                  <td>Fully Diluted Valuation (FDV):</td>
                  <td>${tokenDetail.attributes.fdv_usd}</td>
                </tr>
                <tr>
                  <td>Total Supply:</td>
                  <td>{parseFloat(tokenDetail.attributes.total_supply).toLocaleString()} {tokenDetail.attributes.symbol}</td>
                </tr>
                <tr>
                  <td>Total Reserve in USD:</td>
                  <td>${parseFloat(tokenDetail.attributes.total_reserve_in_usd).toLocaleString()}</td>
                </tr>
                <tr>
                  <td>24h Volume USD:</td>
                  <td>${parseFloat(tokenDetail.attributes.volume_usd.h24).toLocaleString()}</td>
                </tr>
                <tr>
                  <td>Market Cap:</td>
                  <td>${tokenDetail.attributes.market_cap_usd ? tokenDetail.attributes.market_cap_usd : 'Unavailable'}</td>
                </tr>
              </tbody>
            </table>
            <div>
              <h3>Top Pools</h3>
              <ul>
                <td>
                {tokenDetail.relationships.top_pools.data.map(pool => (
                  <li key={pool.id}>{pool.id}</li>
                ))}
                </td>
              </ul>
            </div>
          </div>
        ) : (
          <p>Loading token details...</p>
        )}


        <div>
          <h2>Transfer</h2>
          <table className={styles.positionTable}>
            <tbody>
            <tr>
                <td>MyPosition:</td>
                <td>{myPosition}</td>
              </tr>
              <tr>
                <td>LastTransfer:</td>
                <td>{lastTransfer}</td>
              </tr>
              <tr>
                <td>firstTransfer:</td>
                <td>{firstTransfer}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className={styles.chartContainer}>
  <h2>Token Holding Distribution in USD</h2>
  <canvas id="pie-chart"></canvas>
</div>

      </div>
    </div>
  );
};

export default TokenDetail;
