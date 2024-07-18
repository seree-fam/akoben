import { groth16 } from "snarkjs";
import apiSdk from "@/utils/bandada";
import { collection, getDocs, limit, orderBy, query, where, addDoc } from "firebase/firestore";
import { firestore } from "@/firebase/clientApp";

const apiKey = process.env.NEXT_PUBLIC_BANDADA_API_KEY || " ";


// Define the Community type with bandadaGroupId
interface Community {
  id: string;
  bandadaGroupId: string;
  numberOfMembers: number;
  creatorId: string;
  privacyType?: string;
  imageURL?: string;
  createdAt?: {
    seconds: number;
    nanoseconds: number;
  };
}


// Helper function to convert alphanumeric code to a numeric string
function alphanumericToNumericString(alphanumeric: string): string {
  return alphanumeric.split('').map(char => char.charCodeAt(0).toString()).join('');
}


export async function generateInviteCode(): Promise<{ inviteCode: string; proof: any; publicSignals: any }> {
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
      bandadaGroupId: doc.data().bandadaGroupId,
    })) as Community[];

    for (const community of communities) {
      try {
        const invite = await apiSdk.createInvite(community.bandadaGroupId, apiKey);
        const invcode = await apiSdk.getInvite(invite.code);
        const inviteCode = invcode.code; // Extract the invite code from the response
        const validCode = inviteCode; // In a real scenario, this should come from a secure source

        const numericInviteCode = alphanumericToNumericString(inviteCode);
        const numericValidCode = alphanumericToNumericString(validCode);

        console.log("Generated invite code:", inviteCode);
        console.log("Numeric invite code:", numericInviteCode);
        console.log("Numeric valid code:", numericValidCode);



         const { proof, publicSignals } = await groth16.fullProve(
          { inviteCode: numericInviteCode, validCode: numericValidCode },
          "/InviteCode_js/InviteCode.wasm",
          "/circuit_0001.zkey"
        );

        if (proof && publicSignals) {
          console.log("Proof:", proof);
          console.log("Public signals:", publicSignals);

         // Store the invite code and group ID in Firestore
         await addDoc(collection(firestore, "inviteCodes"), {
            inviteCode,
            groupId: community.bandadaGroupId,
            proof,
            publicSignals,
           createdAt: new Date()
          });
          return { inviteCode, proof, publicSignals };
        }
      } catch (error) {
        console.error(`Error generating proof for community ${community.id}:`, error);
      }
    }

    throw new Error("No valid proof generated for any community");
  } catch (error) {
    console.error("Error in generating invite code:", error);
    throw error;
  }
}

export async function verifyInviteCode(inviteCode: string): Promise<boolean> {
  try {
    // Fetch proof and public signals from Firestore based on invite code
    const inviteCodeQuery = query(
      collection(firestore, "inviteCodes"),
      where("inviteCode", "==", inviteCode)
    );
    const inviteCodeDocs = await getDocs(inviteCodeQuery);

    if (inviteCodeDocs.empty) {
      throw new Error("Invalid invite code. No matching document found.");
    }

    const inviteCodeDoc = inviteCodeDocs.docs[0];
    const { proof, publicSignals } = inviteCodeDoc.data();

    const vKey = await fetch("/verification_key.json").then(res => res.json());
    const isValid = await groth16.verify(vKey, publicSignals, proof);
    console.log("Verified:", isValid);

    return isValid;
  } catch (error) {
    console.error("Error in verifying invite code:", error);
    throw error;
  }
}
