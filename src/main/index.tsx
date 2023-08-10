import "./Main.css";

import React, { useState, useEffect, useRef  } from 'react';

function useCountAnimation(targetCount: any, duration: any) {
  const [count, setCount] = useState(0);
  const prevCountRef = useRef(0);

  useEffect(() => {
    prevCountRef.current = count;
  }, [count]);

  useEffect(() => {
    let animationFrame: any;
    const increment = Math.ceil((targetCount - prevCountRef.current) / (duration / 1000)); // Increment value per second
    const startTime = Date.now();

    const animateCount = () => {
      const currentTime = Date.now();
      const elapsedTime = currentTime - startTime;
      const nextCount = prevCountRef.current + Math.min(Math.floor(increment * (elapsedTime / 1000)), targetCount - prevCountRef.current);

      setCount(nextCount);

      if (nextCount < targetCount) {
        animationFrame = requestAnimationFrame(animateCount);
      }
    };

    animateCount();

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [targetCount, duration]);

  return count;
}

const Main = () => {

 const [isMounted, setIsMounted] = useState(false);

  const [txCount, setTxCount] = useState(0);
  const animatedTxCount = useCountAnimation(txCount, 40000); // Animation duration

  useEffect(() => {
    setIsMounted(true); // Set isMounted to true after the component is mounted

    fetchTransactionCount();
    const intervalId = setInterval(fetchTransactionCount, 1000);

    return () => clearInterval(intervalId);
  }, []);

  // Function to fetch transaction count from the API
  const fetchTransactionCount = async () => {
    try {
      const response = await fetch('https://solana.coin.ledger.com/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: '7',
          method: 'getTransactionCount',
        }),
      });
      const data = await response.json();
      setTxCount(data.result);
    } catch (error) {
      console.error('Error fetching transaction count:', error);
    }
  };

  const formatNumberWithCommas = (number: any) => {
    return number.toLocaleString('en-US');
  };

  

  return (
    <div className="framer-body-b4_uBG7Lj" style={{
      display: 'flex',
      justifyContent: 'center',
      marginTop: isMounted ? '60px' : '-600px',
      borderRadius: '20px',
      transition: 'margin-center 1s ease',
    }}>
      <div className="framer-5Sml8 framer-dh842 framer-bkh27e framer-1cts8hy" style={{
        borderRadius: '1px',
        padding: '50px',
        textAlign: 'center',
        fontFamily: 'Inter, sans-serif',
        position: 'relative',
        marginBottom: '50px',
        width: '50%',
        opacity: isMounted ? 1 : 0,
        transform: isMounted ? 'translateY(0)' : 'translateY(-600px)',
        transition: 'opacity 1s ease, transform 1s ease',
      }}>
        <div className="mobile-version" style={{ display: 'block' }}>
          <img src="../home/solana.png" alt="solana" style={{
            alignSelf: 'center',
            width: '100px',
            marginBottom: '10px',
          }} />
          <h1 className="heading-main" style={{
            color: '#FFF',
            marginBottom: '100px',
            fontSize: '80px',
            lineHeight: '1',
            justifyContent: 'center',
            textAlign: 'center',
            zIndex: '1',
            background: 'radial-gradient(50% 50% at 50% 50%, rgb(0, 255, 198) 0%, rgb(78, 159, 255) 100%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontFamily: 'Bebas Neue, cursive',
          }}>
            Fast. CHEAP. Efficient. <br /> only Possible on Solana!
          </h1>
          <div>
            <div>
              {isMounted && (
                <h2 style={{
                  color: '#FFF',
                  fontSize: '20px',
                  textAlign: 'center',
                  marginBottom: '-10px',
                  padding: '20px',
                  fontFamily: 'Bebas Neue, cursive',
                }}>
                  Transactions: {formatNumberWithCommas(animatedTxCount)}
                </h2>
              )}
              {/* Rest of your main site content */}
            </div>
          </div>
          <a href="/speed" className="custom-btn" id="custom-btn">
            Get Started
          </a>
        </div>
      </div>
    </div>
  );
}

export default Main;
