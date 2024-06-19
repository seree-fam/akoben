import React, { useState } from "react";
import { Button, Text } from "@chakra-ui/react";
import { ethers } from "ethers";
import { SemaphoreSubgraph } from "@semaphore-protocol/data";
import { Identity } from "@semaphore-protocol/identity";
import { Group } from "@semaphore-protocol/group";

const ALCHEMY_API_KEY = "lyWjJAFsJ3u1e1h91qZyz683KLct-Rr6";

const Login: React.FC = () => {
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [userIdentity, setUserIdentity] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleConnectWallet = async () => {
    try {
      console.log("Connecting wallet...");

      if (!window.ethereum) {
        console.error("MetaMask is not installed");
        return;
      }

      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      if (accounts.length === 0) {
        console.error("No accounts found");
        return;
      }

      const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
      setProvider(web3Provider);

      console.log("Wallet connected");

      const signer = web3Provider.getSigner();
      const message = "welcome to freedom";
      console.log("Signing message...");
      const signature = await signer.signMessage(message);
      console.log("Message signed:", signature);
      const identity = new Identity(signature);
      console.log("Identity commitment:", identity.commitment.toString());
      setUserIdentity(identity.commitment.toString());

      const alchemyProvider = new ethers.providers.AlchemyProvider("homestead", ALCHEMY_API_KEY);

      const semaphoreSubgraph = new SemaphoreSubgraph("sepolia");
      console.log("Fetching group data...");
      const groupData = await semaphoreSubgraph.getGroup("42", { members: true });
      const members = groupData?.members;
      console.log("Group members:", members);

      if (members && members.includes(identity.commitment.toString())) {
        setIsAuthenticated(true);
        console.log("User is authenticated");
      } else {
        const code = prompt("Enter your invite code:");
        if (code) {
          const group = new Group(members || []);
          group.addMember(identity.commitment);
          setIsAuthenticated(true);
          console.log("User added to the group and authenticated");
        }
      }
    } catch (error) {
      console.error("Error connecting wallet or during sign message or group check:", error);
    }
  };

  return (
    <div>
      <Button
        width="100%"
        height="36px"
        mt={2}
        mb={2}
        onClick={handleConnectWallet}
      >
        Sign in with Ethereum: Semaphore
      </Button>

      {isAuthenticated && (
        <Text textAlign="center" color="green" fontSize="10pt" fontWeight="800">
          Welcome to the site!
        </Text>
      )}
    </div>
  );
};

export default Login;
