import { useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import { Identity } from "@semaphore-protocol/identity";
import { User } from "@/components/User/User";

export const useSemaphoreAuthState = () => {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("semaphoreUser");
      return storedUser ? JSON.parse(storedUser) : null;
    }
    return null;
  });
  const [loading, setLoading] = useState<boolean>(!user);
  const [error, setError] = useState<Error | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);

  const handleConnectWallet = useCallback(async () => {
    if (isConnecting) return;
    setIsConnecting(true);

    try {
      console.log("Connecting wallet...");

      if (!window.ethereum) {
        throw new Error("MetaMask is not installed");
      }

      const ethereum = window.ethereum;
      if (!ethereum.request) {
        throw new Error("MetaMask request method is not available");
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      if (accounts.length === 0) {
        throw new Error("No accounts found");
      }

      const web3Provider = new ethers.providers.Web3Provider(ethereum);
      const signer = web3Provider.getSigner();
      const message = "welcome to freedom";
      const signature = await signer.signMessage(message);
      const identity = new Identity(signature);

      const newUser: User = {
        displayName: null,
        photoURL: "https://example.com/default-photo.png",
        providerId: "semaphore",
        uid: identity.commitment.toString(),
        groupVerified: true,
        metadata: {
          creationTime: new Date().toISOString(),
          lastSignInTime: new Date().toISOString(),
        },
        providerData: [],
        semaphoreId: identity.commitment.toString(),
        delete: async () => {
          console.log("User deleted");
        },
      };

      setUser(newUser);
      localStorage.setItem("semaphoreUser", JSON.stringify(newUser));
      setLoading(false);
    } catch (err) {
      setError(err as Error);
      setLoading(false);
    } finally {
      setIsConnecting(false);
    }
  }, [isConnecting]);

  return [user, loading, error, handleConnectWallet, setUser] as const;
};
