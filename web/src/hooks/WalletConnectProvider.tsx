"use client";

import { WalletContextProps } from "@/types/walletContext";
import detectEthereumProvider from "@metamask/detect-provider";
import React, { createContext, useState, useEffect } from "react";
import CAT_FACTORY_ABI from "../contractsABI/CatFactoryABI.js";
import CONTRIBUTION_ACCOUNTING_TOKEN_ABI from "../contractsABI/ContributionAccountingTokenABI.js";
import { CATS_FACTORY_ADDRESS } from "../constants.js";
import Web3 from "web3";

const WalletContext = createContext<WalletContextProps>({
  address: "",
  isLoading: false,
  balance: "",
  connect: () => {},
  disconnect: () => {},
  catsContractInstance: null,
  catsContractFactoryInstance: null,
});

export function WalletConnectProvider({
  children,
}: React.PropsWithChildren<{}>) {
  const [address, setAddress] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [balance, setBalance] = useState("");
  const [web3, setWeb3] = useState<Web3 | null>(null);
  const [catsContractInstance, setCatsContractInstance] = useState<any>(null);
  const [catsContractFactoryInstance, setCatsContractFactoryInstance] =
    useState<any>(null);

  const initContracts = async () => {
    if (!web3) return;
    const catsContractFactoryInstance = new web3.eth.Contract(
      CAT_FACTORY_ABI as any,
      CATS_FACTORY_ADDRESS
    );
    setCatsContractFactoryInstance(catsContractFactoryInstance);
  };

  useEffect(() => {
    if (!web3) return;
    initContracts();
  }, [isLoading]);

  useEffect(() => {
    const init = async () => {
      const provider = await detectEthereumProvider();
      if (provider) {
        const web3Instance = new Web3(provider as any);
        setWeb3(web3Instance);

        // Listen for account changes
        (provider as any).on("accountsChanged", async (accounts: string[]) => {
          if (accounts.length > 0) {
            setAddress(accounts[0]);
            const balance = await web3Instance.eth.getBalance(accounts[0]);
            setBalance(web3Instance.utils.fromWei(balance, "ether"));
          } else {
            setAddress("");
            setBalance("");
          }
        });
      } else {
        console.error("Please install MetaMask!");
      }
    };
    init();
  }, []);

  const connect = async () => {
    if (!web3) return;
    setIsLoading(true);
    try {
      const accounts = await (web3.currentProvider as any).request({
        method: "eth_requestAccounts",
      });
      setAddress(accounts[0]);
      const balance = await web3.eth.getBalance(accounts[0]);
      setBalance(web3.utils.fromWei(balance, "ether"));
    } catch (error) {
      console.error("Error connecting to MetaMask:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const disconnect = () => {
    setAddress("");
    setBalance("");
  };

  return (
    <WalletContext.Provider
      value={{
        address,
        isLoading,
        balance,
        connect,
        disconnect,
        catsContractInstance,
        catsContractFactoryInstance,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  try {
    return React.useContext(WalletContext);
  } catch (e) {
    throw new Error("useWallet must be used within a WalletConnectProvider");
  }
}
