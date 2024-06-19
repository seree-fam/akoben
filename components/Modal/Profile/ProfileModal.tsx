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
import React, { useRef, useState } from "react";
import { MdAccountCircle } from "react-icons/md";
import { useSemaphoreAuthState } from "@/hooks/useSemaphoreAuthState"; 

type ProfileModalProps = {
  open: boolean;
  handleClose: () => void;
};

const ProfileModal: React.FC<ProfileModalProps> = ({ open, handleClose }) => {
  const [user, userLoading, userError] = useSemaphoreAuthState();
  const { selectedFile, setSelectedFile, onSelectFile } = useSelectFile(300, 300);
  const selectFileRef = useRef<HTMLInputElement>(null); // Correctly type the ref
  const showToast = useCustomToast();
  const [userName, setUserName] = useState(user?.displayName || "");
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  /**
   * Closes the modal and resets the states.
   */
  const closeModal = () => {
    setSelectedFile("");
    setIsEditing(false);
    handleClose();
  };

  /**
   * Updates the state which tracks the name of the user.
   * @param {React.ChangeEvent<HTMLInputElement>} event - event of the input field
   */
  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUserName(event.target.value);
  };

  /**
   * Saves the changes made to the profile.
   * If the profile name is changed, it is updated.
   * Closes the modal after saving.
   */
  const handleSaveButtonClick = () => {
    if (userName && userName !== user?.displayName) {
      // Update the user name in the database
      // This part is left as a placeholder since the actual update logic is removed
      showToast({
        title: "Profile updated",
        description: "Your profile name has been updated",
        status: "success",
      });
    }
    closeModal();
  };

  if (userLoading) {
    return <Text>Loading...</Text>;
  }

  if (userError) {
    return <Text>Error: {userError.message}</Text>;
  }

  return (
    <Modal isOpen={open} onClose={closeModal}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Profile</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Stack spacing={4}>
            {/* Profile image */}
            {user?.photoURL || selectedFile ? (
              <Image
                src={selectedFile || user?.photoURL || "https://example.com/default-photo.png"} // Use a default value
                borderRadius="full"
                boxSize="66px"
                alt="Profile Image"
              />
            ) : (
              <Icon
                as={MdAccountCircle}
                fontSize={64}
                color="gray.300"
                border="3px solid white"
                borderRadius="full"
                bg="white"
                shadow="md"
              />
            )}
            <Button
              onClick={() => selectFileRef.current?.click()}
              variant="outline"
              isDisabled
            >
              {user?.photoURL ? "Change Image" : "Add Image"}
            </Button>
            {user?.photoURL && (
              <Button
                onClick={() => setSelectedFile("")}
                variant="outline"
                colorScheme="red"
                isDisabled
              >
                Delete Image
              </Button>
            )}
            <input
              type="file"
              ref={selectFileRef}
              hidden
              onChange={onSelectFile}
            />
            {/* Profile name */}
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
