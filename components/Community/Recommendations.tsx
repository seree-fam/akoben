//components/community/Recommendation
import { Community, communityState } from "@/atoms/communitiesAtom";
import { firestore } from "@/firebase/clientApp";
import useCommunityData from "@/hooks/useCommunityData";
import useCustomToast from "@/hooks/useCustomToast";
import {
  Flex,
  Icon,
  Skeleton,
  SkeletonCircle,
  Stack,
  Image,
  Text,
  Box,
  Button,
  useDisclosure,
} from "@chakra-ui/react";
import { collection, getDocs, limit, orderBy, query, where } from "firebase/firestore";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { IoPeopleCircleOutline } from "react-icons/io5";
import Link from "next/link";
import InviteCodeModal from "@/components/Modal/CommunitySettings/InviteCodeModal";
import apiSdk from "@/utils/bandada"; // Adjust the import path as necessary
import { useSemaphoreAuthState } from "@/hooks/useSemaphoreAuthState"; // Import the hook
import { doc, writeBatch } from 'firebase/firestore';

/**
 * Displays the top 5 communities with the most members.
 * For each community, displays the community name, number of members, and a button to join or leave the community.
 * Displays a button to view all communities.
 * @returns {React.FC} - Recommendations component
 *
 * @requires SuggestionsHeader - Displays the header for the Recommendations component.
 * @requires SuggestedCommunitiesList - Displays the top 5 communities with the most members.
 */
const Recommendations: React.FC = () => {
  return (
    <Flex
      direction="column"
      position="relative"
      bg="white"
      borderRadius={10}
      border="1px solid"
      borderColor="gray.300"
      shadow="md"
    >
      <SuggestionsHeader />

      <Flex direction="column" mb={2}>
        <SuggestedCommunitiesList />
      </Flex>
    </Flex>
  );
};
export default Recommendations;

/**
 * Displays the header for the Recommendations component.
 * Header includes the title "Top Communities" and a banner image with a gradient.
 * @returns {React.FC} - Recommendations header component
 */

const SuggestionsHeader: React.FC = () => {
  const bannerImage = "/images/banners/small.jpg";
  return (
    <Flex
      align="flex-end"
      color="white"
      p="6px 10px"
      height="70px"
      borderRadius="10px 10px 0px 0px"
      fontWeight={700}
      bgImage="url(/images/banners/small.jpg)"
      backgroundSize="cover"
      bgGradient="linear-gradient(to bottom, rgba(139, 0, 0, 0), rgba(139, 0, 0, 0.75)),
        url('/images/banners/small.jpg')"
    >
      Top Communities
    </Flex>
  );
};

interface FirestoreCommunity {
  id: string;
  bandadaGroupId?: string;
  numberOfMembers: number;
  creatorId: string;
  privacyType?: string;
  imageURL?: string;
  createdAt?: {
    seconds: number;
    nanoseconds: number;
  };
}

/**
 * Displays the top 5 communities with the most members.
 * @returns {React.FC} - Suggested communities list component
 */
const SuggestedCommunitiesList: React.FC = () => {
  const { communityStateValue, onJoinOrLeaveCommunity } = useCommunityData();
  const [loading, setLoading] = useState(false);
  const [communities, setCommunities] = useState<Community[]>([]);
  const router = useRouter();
  const showToast = useCustomToast();
  const [user, userLoading, userError] = useSemaphoreAuthState();
  const [selectedCommunity, setSelectedCommunity] = useState<Community | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [bandadaGroupId, setBandadaGroupId] = useState<string>("");

  /**
   * Gets the top 5 communities with the most members.
   */
  const getCommunityRecommendations = async () => {
    setLoading(true);
    try {
      const communityQuery = query(
        collection(firestore, "communities"),
        where("bandadaGroupId", "!=", ""),
        orderBy("numberOfMembers", "desc"),
        limit(5)
      );
      const communityDocs = await getDocs(communityQuery);
      const communities = communityDocs.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCommunities(communities as Community[]);
    } catch (error) {
      console.log("Error: getCommunityRecommendations", error);
      showToast({
        title: "Recommendations not Loaded",
        description: "There was an error loading recommendations",
        status: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  

  useEffect(() => {
    getCommunityRecommendations();
  // eslint-disable-next-line react-hooks/exhaustive-deps
    if(selectedCommunity){console.log(selectedCommunity.bandadaGroupId || "")} else {console.log("nana")}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubscribe = async (communityId: string) => {
    console.log("waiting for instructions...");
    if (communityId) {
      const group = await apiSdk.getGroup(communityId)
      const community: Community = {
        id: group.id,
        name: group.name,
        description: "",
        creatorId: "",
        numberOfMembers: 0,
        privacyType: "public"
      };
      console.log(community)
      setSelectedCommunity(community);
    } else {
      setSelectedCommunity(null);
    }
    onOpen();

  };

  useEffect(() => {
    if (selectedCommunity) {
      console.log(selectedCommunity.bandadaGroupId || "");
      setBandadaGroupId(selectedCommunity.bandadaGroupId || "");
    } else {
      console.log("nana");
      setBandadaGroupId("");
    }
  }, [selectedCommunity]);



  return (
    <Flex direction="column" mb={0}>
      {loading ? (
        <Stack mt={2} p={3}>
          {Array(5)
            .fill(0)
            .map((_, index) => (
              <Flex justify="space-between" align="center" key={index}>
                <SkeletonCircle size="10" />
                <Skeleton height="10px" width="70%" />
              </Flex>
            ))}
        </Stack>
      ) : (
        <>
          {communities.map((item, index) => {
            const isJoined = !!communityStateValue.mySnippets.find(
              (snippet) => snippet.communityId === item.id
            );
            return (
              <Link key={item.id} href={`/community/${item.id}`} passHref>
                <Flex
                  key={item.id}
                  align="center"
                  fontSize="10pt"
                  borderBottom="1px solid"
                  borderColor="gray.300"
                  p="10px 12px"
                >
                  <Flex width="80%" align="center">
                    <Flex width="15%">
                      <Text>{index + 1}</Text>
                    </Flex>
                    <Flex align="center" width="80%">
                      {item.imageURL ? (
                        <Image
                          src={item.imageURL}
                          borderRadius="full"
                          boxSize="28px"
                          mr={2}
                          alt="Community Icon"
                        />
                      ) : (
                        <Icon
                          as={IoPeopleCircleOutline}
                          fontSize={34}
                          color="green.500"
                          mr={1}
                        />
                      )}
                      {/* show dots when community name doesnt fit */}
                      <span
                        style={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {`${item.id}`}
                      </span>
                    </Flex>
                  </Flex>
                  <Box position="absolute" right="10px">
                    <Button
                      height="24px"
                      width="100px"
                      fontSize="8pt"
                      variant={isJoined ? "outline" : "solid"}
                      onClick={(event) => {
                        event.preventDefault();
                        onJoinOrLeaveCommunity(item, isJoined);
                        setSelectedCommunity(item);
                        onOpen();
                      }}
                    >
                      {isJoined ? "Unsubscribe" : "Subscribe"}
                    </Button>
                  </Box>
                </Flex>
              </Link>
            );
          })}
        </>
      )}
      <Box p="10px 20px">
        <Button
          height="30px"
          width="100%"
          onClick={() => {
            router.push(`/communities`);
          }}
        >
          View All
        </Button>
      </Box>
      {selectedCommunity && (
        <InviteCodeModal
          isOpen={isOpen}
          onClose={() => {
            setSelectedCommunity(null);
            onClose();
          }}
          communityId={bandadaGroupId}
          handleSubscribe={handleSubscribe}

        />
      )}
    </Flex>
  );
};
