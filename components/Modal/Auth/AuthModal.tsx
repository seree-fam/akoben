/* eslint-disable react-hooks/exhaustive-deps */
// AuthModal.tsx
import { authModalState } from "@/atoms/authModalAtom";
import {
  Flex,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
} from "@chakra-ui/react";
import React, { useEffect } from "react";
import { useRecoilState } from "recoil";
import { useSemaphoreAuthState } from "@/hooks/useSemaphoreAuthState"; 
import Login from "./Login"; 

/**
 * Displays an authentication modal while `open` is `true`.
 * If the `open` is `false`, then the modal is closed.
 * The modal has 1 view as described by `authModalAtom`:
 *  - `login`: displays the log in view
 *
 * If the user is trying to log in,
 *  sign up or log in forms are displayed.
 * @returns {React.FC} - authentication modal which has 1 view
 *
 * @requires ./Login - display login form
 *
 * @see https://chakra-ui.com/docs/components/modal/usage
 */
const AuthModal: React.FC = () => {
  const [modalState, setModalState] = useRecoilState(authModalState);
  const [user, loading, error, , ] = useSemaphoreAuthState();

  /**
   * If a user is authenticated, the modal will automatically close.
   * This is used after signing up or logging in as once the user is authenticated,
   * the modal does not need to be open.
   */
  useEffect(() => {
    if (user) handleClose();
  }, [user]);

  /**
   * Closes the authentication modal by setting its state to `open` state to false.
   */
  const handleClose = () => {
    setModalState((prev: any) => ({
      ...prev,
      open: false,
    }));
  };

  return (
    <>
      <Modal isOpen={modalState.open} onClose={handleClose}>
        <ModalOverlay
          bg="rgba(0, 0, 0, 0.4)"
          backdropFilter="auto"
          backdropBlur="5px"
        />
        <ModalContent borderRadius={10}>
          {/* Dynamically display header depending on the authentication state */}
          <ModalHeader textAlign="center">Login</ModalHeader>

          <ModalCloseButton />

          <ModalBody
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            pb={6}
          >
            <Flex
              direction="column"
              align="center"
              justify="center"
              width="75%"
            >
              <Login />
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};
export default AuthModal;
