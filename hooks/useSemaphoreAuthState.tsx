import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Identity } from "@semaphore-protocol/identity";
import { User } from "@/components/User/User";

export const useSemaphoreAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const handleConnectWallet = async () => {
    try {
      console.log("Connecting wallet...");

      if (!window.ethereum) {
        throw new Error("MetaMask is not installed");
      }

      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      if (accounts.length === 0) {
        throw new Error("No accounts found");
      }

      const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
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
      setLoading(false);
    } catch (err) {
      setError(err as Error);
      setLoading(false);
    }
  };

  useEffect(() => {
    handleConnectWallet();
  }, []);

  return [user, loading, error] as const;
};
