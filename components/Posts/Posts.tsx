import { Community } from "@/atoms/communitiesAtom";
import { Post } from "@/atoms/postsAtom";
import { firestore } from "@/firebase/clientApp";
import usePosts from "@/hooks/usePosts";
import { Stack } from "@chakra-ui/react";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import PostItem from "./PostItem";
import PostLoader from "../Loaders/PostLoader";
import useCustomToast from "@/hooks/useCustomToast";
import { useSemaphoreAuthState } from "@/hooks/useSemaphoreAuthState"; // Import the custom hook
import { Text as ChakraText } from "@chakra-ui/react"; // Rename the Text component to avoid conflict

/**
 * @param {Community} communityData - Community object from firebase
 */
type PostsProps = {
  communityData: Community;
};

/**
 * Displays all the posts in a community.
 * Displays a list of `PostItem` components.
 * While the posts are being fetched, displays a loading skeleton.
 * @param {Community} communityData - Community object from firebase
 *
 * @returns {React.FC<PostsProps>} - Posts component
 */
const Posts: React.FC<PostsProps> = ({ communityData }) => {
  const [user, userLoading, userError] = useSemaphoreAuthState(); // Use the custom hook
  const [loading, setLoading] = useState(false);
  const {
    postStateValue,
    setPostStateValue,
    onVote,
    onDeletePost,
    onSelectPost,
  } = usePosts();
  const showToast = useCustomToast();

  /**
   * Gets all posts in the community.
   *
   * @returns {Promise<void>} - void
   */
  const getPosts = async () => {
    try {
      setLoading(true);
      const postsQuery = query(
        collection(firestore, "posts"),
        where("communityId", "==", communityData.id),
        orderBy("createTime", "desc")
      ); // get all posts in community with certain requirements
      const postDocs = await getDocs(postsQuery); // get all posts in community
      const posts = postDocs.docs.map((doc) => ({ id: doc.id, ...doc.data() })); // get all posts in community
      setPostStateValue((prev) => ({
        ...prev,
        posts: posts as Post[],
      })); // set posts in state
    } catch (error: any) {
      console.log("Error: getPosts", error.message);
      showToast({
        title: "Posts not Loaded",
        description: "There was an error loading posts",
        status: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Gets all votes in the community when component mounts (page loads).
   */
  useEffect(() => {
    getPosts();
  }, [communityData]);

  if (userLoading) {
    return <ChakraText>Loading...</ChakraText>;
  }

  if (userError) {
    return <ChakraText>Error: {userError.message}</ChakraText>;
  }

  return (
    <>
      {/* If loading is true, display the post loader component */}
      {loading ? (
        <PostLoader />
      ) : (
        // If the posts are available, display the post item components
        <Stack spacing={3}>
          {/* For each post (item) iteratively create a post card component */}
          {postStateValue.posts.map((item) => (
            <PostItem
              key={item.id}
              post={item}
              userIsCreator={user?.uid === item.creatorId}
              userVoteValue={
                postStateValue.postVotes.find((vote) => vote.postId === item.id)
                  ?.voteValue
              }
              onVote={onVote}
              onSelectPost={onSelectPost}
              onDeletePost={onDeletePost}
            />
          ))}
        </Stack>
      )}
    </>
  );
};

export default Posts;
