import { Community, communityState } from "@/atoms/communitiesAtom";
import { firestore, storage } from "@/firebase/clientApp";
import useCustomToast from "@/hooks/useCustomToast";
import useSelectFile from "@/hooks/useSelectFile";
import {
  Box,
  Button,
  Divider,
  Flex,
  Icon,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Stack,
  Text,
} from "@chakra-ui/react";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
} from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadString,
} from "firebase/storage";
import React, { useRef, useState } from "react";
import { BsFillPeopleFill } from "react-icons/bs";
import { useRecoilState } from "recoil";
import { useSemaphoreAuthState } from "@/hooks/useSemaphoreAuthState"; 

/**
 * @param {boolean} open - boolean to determine if the modal is open or not
 * @param {function} handleClose - function to close the modal
 * @param {Community} communityData - data required to be displayed
 */
type CommunitySettingsModalProps = {
  open: boolean;
  handleClose: () => void;
  communityData: Community;
};

/**
 * Allows the admin to change the settings of the community.
 * The following settings can be changed:
 * - Community image
 * - Visibility of the community
 * @param {open} - boolean to determine if the modal is open or not
 * @param {handleClose} - function to close the modal
 * @param {communityData} - data required to be displayed
 * @returns {React.FC} - CommunitySettingsModal component
 */
const CommunitySettingsModal: React.FC<CommunitySettingsModalProps> = ({
  open,
  handleClose,
  communityData,
}) => {
  const [user, userLoading, userError] = useSemaphoreAuthState();
  const { selectedFile, setSelectedFile, onSelectFile } = useSelectFile(300, 300);
  const selectFileRef = useRef<HTMLInputElement | null>(null);
  const [communityStateValue, setCommunityStateValue] = useRecoilState(communityState);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [deleteImage, setDeleteImage] = useState(false);
  const showToast = useCustomToast();
  const [selectedPrivacyType, setSelectedPrivacyType] = useState("");

  /**
   * Allows admin to change the image of the community.
   */
  const onUpdateImage = async () => {
    if (!selectedFile) {
      // if no file is selected, do nothing
      return;
    }

    setUploadingImage(true); // set uploading image to true
    try {
      // update image in the community collection
      const imageRef = ref(storage, `communities/${communityData.id}/image`); // create reference to image in storage
      await uploadString(imageRef, selectedFile, "data_url"); // upload image to storage
      const downloadURL = await getDownloadURL(imageRef); // get download url of image
      await updateDoc(doc(firestore, "communities", communityData.id), {
        imageURL: downloadURL,
      }); // update imageURL in firestore

      // update imageURL in all users communitySnippets
      // todo: refactor this to get all the semaphore id's from the blockchain rather than firestore
      const usersSnapshot = await getDocs(collection(firestore, "users")); // get all users
      usersSnapshot.forEach(async (userDoc) => {
        // loop through all users
        const communitySnippetDoc = await getDoc(
          doc(firestore, "users", userDoc.id, "communitySnippets", communityData.id)
        ); // get communitySnippet of the community
        if (communitySnippetDoc.exists()) {
          // if the communitySnippet exists, update the imageURL
          await updateDoc(
            doc(firestore, "users", userDoc.id, "communitySnippets", communityData.id),
            {
              imageURL: downloadURL,
            }
          );
        }
      });

      // update imageURL in current community recoil state
      setCommunityStateValue((prev) => ({
        ...prev,
        currentCommunity: {
          ...prev.currentCommunity,
          imageURL: downloadURL,
        } as Community,
      }));

      // update mySnippet imageURL in recoil state
      setCommunityStateValue((prev) => ({
        ...prev,
        mySnippets: prev.mySnippets.map((snippet) => {
          if (snippet.communityId === communityData.id) {
            return {
              ...snippet,
              imageURL: downloadURL,
            };
          }
          return snippet;
        }),
      }));
    } catch (error) {
      console.log("Error: onUploadImage", error);
      showToast({
        title: "Image not Updated",
        description: "There was an error updating the image",
        status: "error",
      });
    } finally {
      setUploadingImage(false); // set uploading image to false
      setSelectedFile(""); // clear selected file
    }
  };

  /**
   * Deletes the image of the community.
   * @param {string} communityId - id of the community
   */
  const onDeleteImage = async (communityId: string) => {
    try {
      const imageRef = ref(storage, `communities/${communityId}/image`); // create reference to image in storage
      await deleteObject(imageRef);
      await updateDoc(doc(firestore, "communities", communityId), {
        imageURL: "",
      }); // update imageURL in firestore

      // delete imageURL in communitySnippets for all users
      const usersSnapshot = await getDocs(collection(firestore, "users")); // get all users
      usersSnapshot.forEach(async (userDoc) => {
        const communitySnippetDoc = await getDoc(
          doc(firestore, "users", userDoc.id, "communitySnippets", communityId)
        ); // get communitySnippet of the community
        if (communitySnippetDoc.exists()) {
          // if the communitySnippet exists, update the imageURL
          await updateDoc(
            doc(firestore, "users", userDoc.id, "communitySnippets", communityId),
            {
              imageURL: "",
            }
          );
        }
      });

      // update imageURL in current community recoil state
      setCommunityStateValue((prev) => ({
        ...prev,
        currentCommunity: {
          ...prev.currentCommunity,
          imageURL: "",
        } as Community,
      }));

      // update mySnippet imageURL in recoil state
      setCommunityStateValue((prev) => ({
        ...prev,
        mySnippets: prev.mySnippets.map((snippet) => {
          if (snippet.communityId === communityId) {
            return {
              ...snippet,
              imageURL: "",
            };
          }
          return snippet;
        }),
      }));
    } catch (error) {
      console.log("Error: onDeleteImage", error);
      showToast({
        title: "Image not Deleted",
        description: "There was an error deleting the image",
        status: "error",
      });
    }
  };

  /**
   * Changes the privacy type of the current community.
   * @param {string} privacyType - privacy type to be changed to
   */
  const onUpdateCommunityPrivacyType = async (privacyType: string) => {
    try {
      await updateDoc(doc(firestore, "communities", communityData.id), {
        privacyType,
      });

      // update privacyType in current community recoil state
      setCommunityStateValue((prev) => ({
        ...prev,
        currentCommunity: {
          ...prev.currentCommunity,
          privacyType: privacyType,
        } as Community,
      }));
    } catch (error) {
      console.log("Error: onUpdateCommunityPrivacyType", error);
      showToast({
        title: "Privacy Type not Updated",
        description: "There was an error updating the community privacy type",
        status: "error",
      });
    }
  };

  /**
   * Handles changes to the privacy type select input.
   * @param {React.ChangeEvent} event - event when user selects a file
   */
  const handlePrivacyTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedPrivacyType(event.target.value); // set selected privacy type
  };

  /**
   * Handles applying changes to the community settings.
   * Changes can be:
   * - Changing the privacy type
   * - Changing the community image
   * - Deleting the community image
   */
  const handleSaveButtonClick = () => {
    // Save privacy type change
    if (selectedPrivacyType) {
      onUpdateCommunityPrivacyType(selectedPrivacyType);
    }

    if (selectedFile) {
      onUpdateImage();
    }

    if (deleteImage) {
      onDeleteImage(communityData.id);
    }

    showToast({
      title: "Settings Updated",
      description: "Your settings have been updated",
      status: "success",
    });

    closeModal();
  };

  /**
   * Closes the modal and resets the state.
   */
  const closeModal = () => {
    setSelectedFile("");
    setSelectedPrivacyType("");
    setDeleteImage(false);
    handleClose();
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
        <ModalHeader>Community Settings</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Stack spacing={4}>
            {/* community image */}
            {communityStateValue.currentCommunity?.imageURL || selectedFile ? (
              <Image
                src={selectedFile || communityStateValue.currentCommunity?.imageURL}
                borderRadius="full"
                boxSize="66px"
                alt="Community Image"
              />
            ) : (
              <Icon
                as={BsFillPeopleFill}
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
              isDisabled={uploadingImage}
            >
              {communityStateValue.currentCommunity?.imageURL ? "Change Image" : "Add Image"}
            </Button>
            {communityStateValue.currentCommunity?.imageURL && (
              <Button
                onClick={() => setDeleteImage(true)}
                variant="outline"
                colorScheme="red"
                isDisabled={deleteImage}
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
            <Divider />
            {/* Change community privacy type */}
            <Text fontWeight={600}>Community Type</Text>
            <Select
              value={selectedPrivacyType}
              onChange={handlePrivacyTypeChange}
              placeholder={`Currently ${communityStateValue.currentCommunity?.privacyType}`}
            >
              <option value="public">Public</option>
              <option value="restricted">Restricted</option>
              <option value="private">Private</option>
            </Select>
          </Stack>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" mr={3} onClick={closeModal}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveButtonClick}
            isLoading={uploadingImage}
            colorScheme="blue"
          >
            Save
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CommunitySettingsModal;
