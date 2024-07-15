// utils/inviteCodeUtils.ts
import { groth16 } from "snarkjs";
import apiSdk from "@/utils/bandada";

const apiKey = process.env.NEXT_PUBLIC_BANDADA_API_KEY || " ";

// Helper function to convert alphanumeric code to a numeric string
function alphanumericToNumericString(alphanumeric: string): string {
  return alphanumeric.split('').map(char => char.charCodeAt(0).toString()).join('');
}

export async function generateInviteCode(communityId: string): Promise<{ inviteCode: string; proof: any; publicSignals: any }> {
  try {
    const invite = await apiSdk.createInvite(communityId, apiKey);
    const inviteCode = invite.code; // Extract the invite code from the response
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

    if (!proof || !publicSignals) {
      throw new Error("Proof or public signals not generated");
    }

    console.log("Proof:", proof);
    console.log("Public signals:", publicSignals);

    return { inviteCode, proof, publicSignals };
  } catch (error) {
    console.error("Error in generating invite code:", error);
    throw error;
  }
}

export async function verifyInviteCode(proof: any, publicSignals: any): Promise<boolean> {
  try {
    const vKey = await fetch("/verification_key.json").then(res => res.json());
    const isValid = await groth16.verify(vKey, publicSignals, proof);

    return isValid;
  } catch (error) {
    console.error("Error in verifying invite code:", error);
    throw error;
  }
}
