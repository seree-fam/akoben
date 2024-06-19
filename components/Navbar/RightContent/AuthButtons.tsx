import React from "react";
import { Button, Text } from "@chakra-ui/react";
import { useSemaphoreAuthState } from "@/hooks/useSemaphoreAuthState"; // Import the custom hook

const AuthButtons: React.FC = () => {
  const [user, loading, error] = useSemaphoreAuthState(); // Use the custom hook

  const handleLogin = () => {
    // Logic to connect wallet and authenticate user
    window.location.reload(); 
  };

  if (loading) {
    return <Text>Loading...</Text>;
  }

  if (error) {
    return <Text>Error: {error.message}</Text>;
  }

  return (
    <div>
      {!user ? (
        <Button
          variant="outline"
          height="28px"
          display={{ base: "none", md: "flex" }} // on mobile, this button is not displayed
          width={{ base: "70px", md: "110px" }} // on mobile the width is 70px, on desktop 110px
          mr={2}
          ml={2}
          onClick={handleLogin}
        >
          Sign in with Ethereum: Semaphore
        </Button>
      ) : (
        <Text textAlign="center" color="green" fontSize="10pt" fontWeight="800">
          Welcome to the site!
        </Text>
      )}
    </div>
  );
};

export default AuthButtons;
