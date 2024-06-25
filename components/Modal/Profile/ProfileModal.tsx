import { firestore, storage } from "@/firebase/clientApp";
import useCustomToast from "@/hooks/useCustomToast";
import useSelectFile from "@/hooks/useSelectFile";
import {
  Box,
  Button,
  Flex,
  Icon,
  Image,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import React, { useRef, useState, useEffect } from "react";
import { MdAccountCircle } from "react-icons/md";
import { useSemaphoreAuthState } from "@/hooks/useSemaphoreAuthState"; 


type ProfileModalProps = {
  open: boolean;
  handleClose: () => void;
};

const ProfileModal: React.FC<ProfileModalProps> = ({ open, handleClose }) => {
  const [user, userLoading, userError] = useSemaphoreAuthState();
  const showToast = useCustomToast();
  const [userName, setUserName] = useState(user?.displayName || "");
  const [isEditing, setIsEditing] = useState(false);

  const closeModal = () => {
    setIsEditing(false);
    handleClose();
  };

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUserName(event.target.value);
  };

  const handleSaveButtonClick = () => {
    if (userName && userName !== user?.displayName) {
      showToast({
        title: "Profile updated",
        description: "Your profile name has been updated",
        status: "success",
      });
    }
    closeModal();
  };

  if (userLoading) {
    return <Text></Text>;
  }

  if (userError) {
    return <Text>Error: {userError.message}</Text>;
  }

  return (
    <Modal isOpen={open} onClose={closeModal}>
      <ModalOverlay />
      <ModalContent>
        
        <ModalCloseButton />
        <ModalBody>
          <Stack spacing={4}>
            <Image
              src={`https://robohash.org/${user?.uid}.png?set=set5`} // Random image based on user UID
              borderRadius="full"
              boxSize="66px"
              alt="Profile Image"
            />
            {!isEditing && (
              <>
                <Text>Semaphore id: {user?.uid}</Text>
                <Text>User Name: {user?.displayName || ""}</Text>
              </>
            )}
            {isEditing && (
              <Input
                value={userName}
                onChange={handleNameChange}
                placeholder="User Name"
                size="sm"
              />
            )}
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" mr={3} onClick={closeModal}>
            Cancel
          </Button>
          {isEditing ? (
            <Button onClick={handleSaveButtonClick} colorScheme="blue">
              Save
            </Button>
          ) : (
            <Button onClick={() => setIsEditing(true)} colorScheme="blue">
              Edit
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
export default ProfileModal;
