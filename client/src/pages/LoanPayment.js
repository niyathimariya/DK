import React, { useEffect, useState } from 'react';
import PSDashname from '../components/PSDashname';
import abi from "../contracts/DK.json";
import { ethers } from 'ethers';

export default function WeeklyPayment() {
  const [initialBalance, setInitialBalance] = useState(0);
  const [amt, setAmt] = useState('');
  const [balance, setBalance] = useState(initialBalance);
  const [account, setAccount] = useState("Not connected");
  const [contract, setContract] = useState(null);

  const template = async () => {
    try {
      const { ethereum } = window;
      const account = await ethereum.request({
        method: "eth_requestAccounts"
      });
      window.ethereum.on("accountsChanged", () => {
        window.location.reload()
      });
      setAccount(account);

      const contractAddress = abi.address;
      const contractABI = abi.abi;
      const provider = new ethers.providers.Web3Provider(ethereum); // read from blockchain
      const signer = provider.getSigner(); // write into blockchain
      const contract = new ethers.Contract(contractAddress, contractABI, signer);
      setContract(contract);

      const memdash = await contract.memdash();
      setInitialBalance(memdash[1].toNumber());
      console.log(initialBalance);
    } catch (err) {
      alert(`${err.data.message}`);
    }
  };

  useEffect(() => {
    template();
  }, []);

  const handleAmountChange = (e) => {
    const inputAmt = e.target.value;
    setAmt(inputAmt);
    const updatedBalance = inputAmt ? initialBalance - parseInt(inputAmt) : initialBalance;
    setBalance(updatedBalance);
  };

  const handlePay = async () => {
    try {
      const amountInWei = ethers.BigNumber.from(amt); // Accept amount directly in wei
      const transaction = await contract.loanPay({
        value: amountInWei // Specify the amount of wei to send
      });
      await transaction.wait(); // Wait for the transaction to be mined
      console.log("Payment successful!");
    } catch (err) {
      alert(`${err.data.message}`);
      console.error("Payment failed:", err);
    }
  };

  return (
    <>
      <PSDashname account={account} />
      <div className="text-white flex justify-center items-center h-screen">
        <div className="container text-center w-3/4">
          <div className="flex items-center mb-8 ">
            <label htmlFor="amt" className="block mb-2 ml-60 mr-5">
              Enter your amount:
            </label>
            <input
              type="number"
              id="amt"
              name="amt"
              placeholder="Enter amount"
              className="px-4 py-2 text-black bg-white rounded-md w-1/2"
              value={amt}
              onChange={handleAmountChange}
            />
          </div>
          {amt && <p className='text-red-500'>Your updated loan would be: {balance}</p>}
          <button className="bg-red-500 text-white px-6 py-3 text-lg rounded-md hover:bg-green-700 m-5 justify-normal" onClick={handlePay}>
            Pay Now
          </button>
        </div>
      </div>
    </>
  );
}
