// components/Modal/CommunitySettings/inviteCodeModal.tsx
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
import apiSdk from "@/utils/bandada";
import { useSemaphoreAuthState } from "@/hooks/useSemaphoreAuthState";
import useCustomToast from "@/hooks/useCustomToast";
import { firestore } from "@/firebase/clientApp";
import { collection, query, where, getDocs } from "firebase/firestore";
import { useInviteCode } from "@/hooks/useInviteCode";

interface InviteCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  communityId: string;
  handleSubscribe: (communityId: string) => Promise<void>;
}

const InviteCodeModal: React.FC<InviteCodeModalProps> = ({ isOpen, onClose, communityId }) => {
  const [inputInviteCode, setInputInviteCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const showToast = useCustomToast();
  const [user, userLoading, userError] = useSemaphoreAuthState();
  const { validateInviteCode } = useInviteCode();

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError("");

    try {
      

      // Query all invite codes from Firestore
      const inviteCodeQuery = query(
        collection(firestore, "inviteCodes"),
        where("inviteCode", "==", inputInviteCode)
      );
      const inviteCodeDocs = await getDocs(inviteCodeQuery);

      if (inviteCodeDocs.empty) {
        setError("Invalid invite code. Please try again.");
        console.log("No document found for invite code:", inputInviteCode);
        setIsSubmitting(false);
        return;
      }

      // Iterate through each invite code document
      let success = false;
      for (const inviteCodeDoc of inviteCodeDocs.docs) {
        const groupId = inviteCodeDoc.data().groupId;

        // Validate the invite code with proof verification
        const isValid = await validateInviteCode(inputInviteCode);
        if (isValid) {
          console.log("Invite code verified successfully. Adding member to group...");
          try {

            // Attempt to add member to group
            await apiSdk.addMemberByInviteCode(communityId, user!.uid, inputInviteCode);
            success = true; // Mark success if addition is successful
            break; // Exit loop if successfully added to a group
          } catch (apiError) {
            console.error("API error:", apiError);
            setError(`Failed to join the community. Error: ${apiError}`);
            // Continue to next invite code if adding member fails
          }
        } else {
          setError("Invalid invite code. Verification failed.");
        }
      }

      if (success) {
        showToast({
          title: "Success",
          description: "You have successfully joined the community",
          status: "success",
        });
        onClose();
      } else {
        setError("Failed to join the community. Please try again.");
      }
    } catch (error) {
      console.error("Error:", error);
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
