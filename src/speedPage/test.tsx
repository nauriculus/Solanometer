
import styled from "styled-components";
import "./Speed.css";
import "../BlockList.css";
import * as anchor from "@project-serum/anchor";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { WalletDialogButton } from "@solana/wallet-adapter-material-ui";
import Nav from "../partials/Nav";
import Footer from "../partials/Footer";
import { shortenAddress } from "../candy-machine";
import Box from "@material-ui/core/Box";
import Modal from "@material-ui/core/Modal";
import Fade from "@material-ui/core/Fade";
import Backdrop from "@material-ui/core/Backdrop";
import TextField from "@material-ui/core/TextField";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import Snackbar from "@material-ui/core/Snackbar";
import ErrorOutline from "@material-ui/icons/ErrorOutline";
import CheckCircleOutline from "@material-ui/icons/CheckCircleOutline";
import { getProgram } from "../contracts/utils";


import { PROGRAM_ID, sendTestTransaction } from "../contracts/speed";
import { useState, useEffect } from 'react';

let transactionId: string | null = null;
let tSlot: any = null;
let fee:any = null;
let time:any = null;
let validators:any = null;
let transactionIdShort:any = null;
let solanaPrice:any = null;

const ConnectButton = styled(WalletDialogButton)`
/* Add your custom styles here */
padding: 0.5rem 1.25rem;
border-radius: 8px;
background-color: #007bff;
color: #fff;
font-size: 16px;
border: none;
cursor: pointer;
box-shadow: 6px 6px 0 rgba(0, 0, 0, 0.3);
transition: box-shadow 0.2s ease-in-out;

&:hover {
  animation: glow 1s ease-in-out infinite;
}

@keyframes glow {
  0% {
    box-shadow: 6px 6px 0 rgba(0, 0, 0, 0.3);
  }
  50% {
    box-shadow: 0 0 20px rgba(0, 0, 255, 0.8);
  }
  100% {
    box-shadow: 6px 6px 0 rgba(0, 0, 0, 0.3);
  }
}
`;


  const CenteredContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

export interface HomeProps {
  connection: anchor.web3.Connection;
}

export interface RedeemProps {
  connection: anchor.web3.Connection;
}


const useLoadingAnimation = () => {
  const loadingTexts = ['Awaiting Confirmation .', 'Awaiting Confirmation .', 'Awaiting Confirmation ..', 'Awaiting Confirmation ...'];
  const [currentTextIndex, setCurrentTextIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTextIndex((index) => (index + 1) % loadingTexts.length);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return loadingTexts[currentTextIndex];
};

const Speed = (props: RedeemProps) => {

  
  const connection = props.connection;
  const wallet = useAnchorWallet();
  const vertical = "top";
  const horizontal = "center";
  
  const [open, setOpen] = useState(false);
  const [hasRedeemed, setHasRedeemed] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isTransactionInfoOpen, setTransactionInfoOpen] = useState(false);
  const [isConfirmationInfoOpen, setConfirmationInfoOpen] = useState(false);
  const [isTransactionCostInfoOpen, setTransactionCostInfoOpen] = useState(false);


  const handleCloseErrorMessage = () => {
    setShowErrorMessage(false);
  };

  const handleCloseSuccessMessage = () => {
    setShowSuccessMessage(false);
  };

  const handleOpenRedeem = () => {
    setOpen(true);
  };
  const handleCloseRedeem = () => {
    setOpen(false);
  };

  function shortenTransactionId(transactionId: string | null): string {
    if (transactionId === null) {
      return "";
    }
    
    const shortenedId = transactionId.substr(0, 8) + "..." + transactionId.substr(-8);
    return shortenedId;
  }

  const [isLoading, setIsLoading] = useState(false);


  const getTransactionDetails = async (txid: any) => {
    try {
      const payload = {
        method: 'getTransaction',
        jsonrpc: '2.0',
        params: [
          txid.toString(),
          {
            encoding: 'jsonParsed',
            maxSupportedTransactionVersion: 0,
          },
        ],
        id: 'd1077efd-2c84-4e05-b6a3-ae7c26105b7b',
      };
  
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          accept: 'application/json, text/plain, */*',
          'accept-language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
          'user-agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36',
        },
        body: JSON.stringify(payload),
      };
  
      const response = await fetch('https://solana.coin.ledger.com/', options);
  
  
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
      }
  
      const data = await response.json();
      if (data.result === null) {
        // Repeat the API call
        await getTransactionDetails(txid); // Await the recursive call
      } else {
        setIsLoading(false);
        const timestamp = data.result.blockTime;
        const slot = data.result.slot;
        const currentTime = Math.floor(Date.now() / 1000);
        const elapsedTime = currentTime - timestamp;
  
        time = elapsedTime;
        const LAMPORTS_PER_SOL = 1000000000; // 1 SOL = 1,000,000,000 lamports
        const feeLamports = data.result.meta.fee;
        const feeInSol = feeLamports / LAMPORTS_PER_SOL;

        transactionId = txid;
        const transactionIdNew = shortenTransactionId(txid);
        transactionIdShort = transactionIdNew;
        tSlot = slot;
        fee = feeInSol;
      }
    } catch (error) {
      console.error('Error occurred:', error);
    }
  };
  

  const toggleInfoBox = (boxType: any) => {
    switch (boxType) {
      case "transaction":
        setTransactionInfoOpen(!isTransactionInfoOpen);
        break;
      case "confirmation":
        setConfirmationInfoOpen(!isConfirmationInfoOpen);
        break;
      case "transactionCost":
        setTransactionCostInfoOpen(!isTransactionCostInfoOpen);
        break;
      default:
        break;
    }
  };
  
  const resetInfoBoxes = () => {
    setTransactionInfoOpen(false);
    setConfirmationInfoOpen(false);
    setTransactionCostInfoOpen(false);
  };

  const onRedeemClick = async (event: any) => {
    try {
      
      const program = await getProgram(
        wallet as anchor.Wallet,
        PROGRAM_ID,
        connection
      );

      const transaction = await sendTestTransaction(
        program,
        connection,
        wallet!.publicKey
      );

      validators = await connection.getVoteAccounts();
      
      const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${"solana"}&vs_currencies=usd&include_24hr_change=true`);
      const json = await response.json();
    
      const solanaPriceObj = json["solana"];
      solanaPrice = solanaPriceObj.usd;
      
      getTransactionDetails(transaction);

      setShowErrorMessage(false);
      handleOpenRedeem();

      setIsLoading(true);
      

    } catch (e) {
      setIsLoading(false);
      console.error(e);
      setShowErrorMessage(true);
      setErrorMessage(`Error, ${e}`);
    }
  };

  const loadingText = useLoadingAnimation(); 

  const checkEligibility = () => {
    if (!wallet) {
      return (
        <CenteredContainer>
        <ConnectButton className="wallet-button">Connect Wallet</ConnectButton>
       </CenteredContainer>
      );
    }
   
   
    return (
      <div className="block-list__btn-container">
        <button
          type="button"
          className="block-list__btn custom-btn has-box-shadow-small is-uppercase"
          onClick={onRedeemClick}
        >
          START NOW
        </button>
      </div>
    );
    
   
  };

  const usdCost = fee * solanaPrice;

  return (

    
    <main>
      <section>

        <Snackbar
          autoHideDuration={60000}
          anchorOrigin={{ vertical, horizontal }}
          open={showSuccessMessage}
          onClose={handleCloseSuccessMessage}
        >
          <div className="notification is-success">
            <CheckCircleOutline className="m-r-sm" />
            {successMessage}
          </div>
        </Snackbar>
        <Snackbar
          autoHideDuration={60000}
          anchorOrigin={{ vertical, horizontal }}
          open={showErrorMessage}
          onClose={handleCloseErrorMessage}
        >
          <div className="notification is-error">
            <ErrorOutline className="m-r-sm" />
            {errorMessage}
          </div>
        </Snackbar>

     

        <header className="header">
          <Nav />
          <h1 className="heading-main is-flex-justify-center is-uppercase u-margin-top_large">
          <div className="heading-container">
            <img src="../speed.png" alt="Blitz" width="60" height="60" />
            <span className="heading-text">
            SOL Speedometer
            </span>
          </div>
        </h1>
          <div className="is-flex is-flex-justify-center">
            {!wallet ? (
              <p className="pb-5">No Wallet Connected</p>
            ) : (
              <p className="pb-5">
                Wallet {shortenAddress(wallet.publicKey.toBase58() || "")}
              </p>
            )}
          </div>
        </header>
        <div className="content-wrapper">
          <div className="row">
            <div className="col-sm">
              
              <div className="block-list-wrapper has-box-shadow">
                
              <div className="block-list mt-4 mb-4">
              <div className="centered-image">
                <img
                  src="../solana.png"
                  alt="Solana"
                  width="140"
                  height="140"
                />
              </div>
                 <div className="mt-3 mb-3 text-center">
                
                 Experience blazing-fast speeds and cost efficiency on Solana!
                
                 
                </div>
                  <div className="mb-1">
                    {checkEligibility()}
                  </div>
                  <div className="modal-container">
                  
  

        {open && (
        <Modal
          open={open}
          onClose={handleCloseRedeem}
          closeAfterTransition
          BackdropComponent={Backdrop}
          BackdropProps={{
            timeout: 500,
          }}
        >
          <Fade in={open}>
            <Box className="dashboard-modal has-box-shadow">
              <div>
                <h2 className="heading-main">TRANSACTION RESULTS</h2>
                
                {isLoading ? (
                    <div className="loading-animation">{loadingText}</div>
                  ) : (
                    <div className="dashboard-data">
                    
                    
                    <div className="data-box" onMouseLeave={() => resetInfoBoxes()}>
                      <div className="data-point">
                        <img
                          src="../transaction.png"
                          alt="Transaction ID Icon"
                          className="data-icon"
                        />
                        <p className="data-title">Transaction</p>
                        <p className="data-text">{transactionIdShort}</p>
                        <img
                          src="../dots.png"
                          alt="Settings"
                          className="settings-icon"
                          onClick={() => toggleInfoBox("transaction")}
                        />
                      </div>
                      {isTransactionInfoOpen && (
                        <div className="info-box">
                    <p>If you want to checkout the full transaction, click <a href={`https://solana.fm/tx/${transactionId}`} target="_blank" rel="noopener noreferrer">here</a>.</p>
                        </div>
                      )}
                      
                    </div>

                    <div className="data-box" onMouseLeave={() => resetInfoBoxes()}>
                      <div className="data-point">
                        <img
                          src="../confirmation.png"
                          alt="Confirmation Icon"
                          className="data-icon"
                        />
                        <p className="data-title">Full Confirmation Time</p>
                        <p className="data-text">{time}s / {validators.current.length} Nodes</p>
                        <p className="data-text">
                         ~98% faster than on Ethereum.
                        </p>
                        <img
                          src="../dots.png"
                          alt="Settings"
                          className="settings-icon"
                          onClick={() => toggleInfoBox("confirmation")}
                        />
                      </div>
                      {isConfirmationInfoOpen && (
                        <div className="info-box">
                          <p>This shows the required time for the transaction to be fully confirmed by all nodes.</p>
                        
                        </div>
                      )}
                    </div>

                    <div className="data-box" onMouseLeave={() => resetInfoBoxes()}>
                      <div className="data-point">
                        <img
                          src="../amount.png"
                          alt="Amount Icon"
                          className="data-icon"
                        />
                        <p className="data-title">Transaction Cost</p>
                      
                        <p className="data-text">
                          {fee} SOL (<span style={{ color: 'green' }}>{usdCost.toFixed(5)} USD</span>)
                        </p>
                        <p className="data-text">
                        ~99992% lower than on Ethereum ($1+).
                        </p>
                        <img
                          src="../dots.png"
                          alt="Settings"
                          className="settings-icon"
                          onClick={() => toggleInfoBox("transactionCost")}
                        />
                      </div>
                      {isTransactionCostInfoOpen && (
                        <div className="info-box">
                          <p>This is the transaction cost (fee) for a basic SOL transfer.</p>
                          <p>Please note that token transfer might be more expensive (~0.02-0.10$)</p>
                        </div>
                      )}
                    </div>

                    {/* Display more fetched data points as needed */}
                  </div>
                )}
              </div>
            </Box>
          </Fade>
        </Modal>
      )}
    </div>
    </div>
    </div>
    </div>
    </div>
    </div>
    </section>
    <Footer />
    </main>
  );
}

export default Speed;
