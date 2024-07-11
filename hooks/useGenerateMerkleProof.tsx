import { useEffect, useState } from "react";
import { ApiSdk, SupportedUrl } from "@bandada/api-sdk"

const apiSdk = new ApiSdk(SupportedUrl.DEV)



const useGenerateMerkleProof = (groupId: string, memberId: string) => {
  const [proof, setProof] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProof = async () => {
      setLoading(true);
      setError(null);
      try {
        const proof = await apiSdk.generateMerkleProof(groupId, memberId);
        setProof(proof);
      } catch (err) {
        setError("Failed to generate proof");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (groupId && memberId) {
      fetchProof();
    }
  }, [groupId, memberId]);

  return { proof, loading, error };
};

export default useGenerateMerkleProof;
