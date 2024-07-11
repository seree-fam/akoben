import { Box, Button, Text } from "@chakra-ui/react";
import { useRouter } from "next/router";
import React from "react";

const ErrorPage: React.FC<{ message: string }> = ({ message }) => {
  const router = useRouter();

  return (
    <Box textAlign="center" py={10} px={6}>
      <Text fontSize="xl" mt={3} mb={2}>
        Oops! Something went wrong.
      </Text>
      <Text color="gray.500" mb={6}>
        {message}
      </Text>
      <Button
        colorScheme="teal"
        onClick={() => router.push("/")}
      >
        Go back to Home
      </Button>
    </Box>
  );
};

export default ErrorPage;
