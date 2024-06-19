import React, { useState } from "react";
import { Button, Text } from "@chakra-ui/react";
import { ethers } from "ethers";
import { handleConnectWallet } from "@/components/Modal/Auth/Login";

const AuthButtons: React.FC = () => {
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | null>(null);
  const [userIdentity, setUserIdentity] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <div>
      <Button
        variant="outline"
        height="28px"
        display={{ base: "none", md: "flex" }} // on mobile, this button is not displayed
        width={{ base: "70px", md: "110px" }} // on mobile the width is 70px, on desktop 110px
        mr={2}
        ml={2}
        onClick={() => handleConnectWallet(setProvider, setUserIdentity, setIsAuthenticated)}
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

export default AuthButtons;