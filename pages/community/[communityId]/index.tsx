import { Community, communityState } from "@/atoms/communitiesAtom";
import About from "@/components/Community/About";
import CreatePostLink from "@/components/Community/CreatePostLink";
import Header from "@/components/Community/Header";
import NotFound from "@/components/Community/NotFound";
import PageContent from "@/components/Layout/PageContent";
import Posts from "@/components/Posts/Posts";
import { firestore } from "@/firebase/clientApp";
import { doc, getDoc } from "@firebase/firestore";
import { GetServerSidePropsContext } from "next";
import React, { useEffect } from "react";
import { useSetRecoilState } from "recoil";
import safeJsonStringify from "safe-json-stringify";
import { useAuth } from "@/context/AuthContext";
import { Box, Spinner, Center } from "@chakra-ui/react";
import ErrorPage from "@/pages/ErrorPage"
import { useUser} from "@/components/User/UserContext"

/**
 * @param {Community} communityData - Community data for the current community
 */
type CommunityPageProps = {
  communityData: Community;
  error?: string;
};

/**
 * Displays the community page with the community's posts and information.
 * @param {Community} communityData - Community data for the current community
 * @returns {React.FC<CommunityPageProps>} - Community page component
 */
const CommunityPage: React.FC<CommunityPageProps> = ({ communityData, error, }) => {
  const setCommunityStateValue = useSetRecoilState(communityState);
  const {  user, userLoading } = useAuth();
  const { user: semaphoreUser } = useUser()


  // store the community data currently available into the state as soon as the component renders
  useEffect(() => {
    if (communityData) {
      setCommunityStateValue((prev) => ({
        ...prev,
        currentCommunity: communityData,
      }));
    }
  }, [communityData, setCommunityStateValue]);

  if (error) {
    return <ErrorPage message={error} />;
  }

  if (userLoading) {
    return (
      <Center height="100vh">
        <Spinner size="xl" />
      </Center>
    );
  }

  if (!user || !semaphoreUser) {
    // You can redirect the user to the login page or show a message
    return (
      <Center height="100vh">
        <Box textAlign="center">
          <p>You need to be logged in to view this community.</p>
        </Box>
      </Center>
    );
  }

  if (!communityData || Object.keys(communityData).length === 0) {
    //  if community data is not available or empty, return not found page
    return <NotFound />;
  }

  return (
    <>
      <Header communityData={communityData} />
      <PageContent>
        <>
          <CreatePostLink />
          <Posts communityData={communityData} />
        </>
        <>
          <About communityData={communityData} />
        </>
      </PageContent>
    </>
  );
};

/**
 * Gets the community data for the current community.
 * Returns the community data as props to the client.
 * @param {GetServerSidePropsContext} context - GetServerSidePropsContext object
 * @returns {Promise<{props: {communityData: Community}}>} - Community data for the current community
 */
export async function getServerSideProps(context: GetServerSidePropsContext) {
  // get the community data and pass it to the client
  try {
    const communityDocRef = doc(
      firestore,
      "communities",
      context.query.communityId as string
    );
    const communityDoc = await getDoc(communityDocRef);

    if (!communityDoc.exists()) {
      // if the document does not exist, return notFound property
      return { props: {} };
    }

    return {
      props: {
        communityData: JSON.parse(
          safeJsonStringify({ id: communityDoc.id, ...communityDoc.data() })
        ),
      },
    };
  } catch (error) {
    console.log("Error: getServerSideProps", error);
    return { props: {
      error: "There was an error loading the community. Please try again later.",
    } };
  }
}

export default CommunityPage;
