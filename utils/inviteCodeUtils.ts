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
     // Log the Firestore query details
     console.log("Fetching communities with query:", communityQuery);

    const communityDocs = await getDocs(communityQuery);
     // Log the retrieved community documents
     console.log("Retrieved community documents:", communityDocs.docs);
    const communities = communityDocs.docs.map((doc) => ({
      id: doc.id,
      bandadaGroupId: doc.data().bandadaGroupId,
    })) as Community[];

    // Log the mapped communities
    console.log("Mapped communities:", communities);

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

          // Flatten the proof and publicSignals to avoid nested arrays
          const flattenedProof = {
            pi_a: proof.pi_a.flat(),
            pi_b: proof.pi_b.flat(),
            pi_c: proof.pi_c.flat(),
          };
          const flattenedPublicSignals = publicSignals.flat();

         // Store the invite code and group ID in Firestore
         await addDoc(collection(firestore, "inviteCodes"), {
            inviteCode,
            groupId: community.bandadaGroupId,
            proof: flattenedProof,
            publicSignals: flattenedPublicSignals,
           createdAt: new Date()
          });
          console.log(`Invite code ${inviteCode} successfully stored in Firestore`);
          return { inviteCode,  proof: flattenedProof, publicSignals: flattenedPublicSignals };
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

function unflattenProof(flatProof: any) {
  return {
    protocol: "groth16",
    curve: "bn128",
    pi_a: flatProof.pi_a,
    pi_b: [
      [flatProof.pi_b[0], flatProof.pi_b[1]],
      [flatProof.pi_b[2], flatProof.pi_b[3]],
      [flatProof.pi_b[4], flatProof.pi_b[5]],
    ],
    pi_c: flatProof.pi_c,
  };
}

export async function verifyInviteCode(inviteCode: string): Promise<boolean> {
  try {
    console.log("Verifying invite code:", inviteCode);

    // Fetch proof and public signals from Firestore based on invite code
    const inviteCodeQuery = query(
      collection(firestore, "inviteCodes"),
      where("inviteCode", "==", inviteCode)
    );
    const inviteCodeDocs = await getDocs(inviteCodeQuery);

    if (inviteCodeDocs.empty) {
      console.log("No document found for invite code:", inviteCode);
      throw new Error("Invalid invite code. No matching document found.");
    }

    const inviteCodeDoc = inviteCodeDocs.docs[0];
    const { proof: flatProof, publicSignals } = inviteCodeDoc.data();
    console.log("Document found:", inviteCodeDoc.data());

    // Log public signals and proof
    console.log("Public signals:", publicSignals);
    console.log("Flat proof:", flatProof);

    const proof = unflattenProof(flatProof);
    console.log("Unflattened proof:", proof);

    const vKey = await fetch("/verification_key.json").then(res => res.json());
    console.log("Verification key:", vKey);

    const isValid = await groth16.verify(vKey, publicSignals, proof);
    console.log("Verification result:", isValid);

    return isValid;
  } catch (error) {
    console.error("Error in verifying invite code:", error);
    throw error;
  }
}
