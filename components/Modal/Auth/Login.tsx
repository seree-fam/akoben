import React from "react";
import { Button, Text } from "@chakra-ui/react";
import { useSemaphoreAuthState } from "@/hooks/useSemaphoreAuthState";

const Login: React.FC = () => {
  const [user, loading, error] = useSemaphoreAuthState();

  if (loading) {
    return <Text>Loading...</Text>;
  }

  if (error) {
    return <Text>Error: {error.message}</Text>;
  }

  return (
    <div>
      {user ? (
        <Text textAlign="center" color="green" fontSize="10pt" fontWeight="800">
          Welcome to the site, {user.uid}!
        </Text>
      ) : (
        <Button
          width="100%"
          height="36px"
          mt={2}
          mb={2}
          onClick={() => window.location.reload()}
        >
          Sign in with Ethereum: Semaphore
        </Button>
      )}
    </div>
  );
};

export default Login;
