import React, { useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Input,
  FormControl,
  FormLabel,
  FormErrorMessage,
  useToast,
} from "@chakra-ui/react";
import { useInviteCode } from "@/hooks/useInviteCode";
import apiSdk from "@/utils/bandada";
import { useSemaphoreAuthState } from "@/hooks/useSemaphoreAuthState";
import useCustomToast from "@/hooks/useCustomToast";

interface InviteCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  communityId: string;
  handleSubscribe: (communityId: string, inviteCode: string) => Promise<void>;
}

const InviteCodeModal: React.FC<InviteCodeModalProps> = ({ isOpen, onClose, communityId }) => {
  const { inviteCode, validateInviteCode, isValid } = useInviteCode();
  const [inputInviteCode, setInputInviteCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const showToast = useCustomToast();
  const toast = useToast();
  const [user, userLoading, userError] = useSemaphoreAuthState();

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError("");

    try {
      await apiSdk.addMemberByInviteCode(communityId, user!.uid, inputInviteCode);
    } catch (error) {
      setError("Failed to join the community. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Enter Invite Code</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <FormControl isInvalid={!!error}>
            <FormLabel>Invite Code</FormLabel>
            <Input
              value={inputInviteCode}
              onChange={(e) => setInputInviteCode(e.target.value)}
              placeholder="Enter invite code"
            />
            {error && <FormErrorMessage>{error}</FormErrorMessage>}
          </FormControl>
        </ModalBody>
        <ModalFooter>
          <Button
            colorScheme="blue"
            mr={3}
            onClick={handleSubmit}
            isLoading={isSubmitting}
          >
            Submit
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default InviteCodeModal;
