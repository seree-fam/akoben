// utils/inviteCodeUtils.ts
import { groth16 } from "snarkjs";

// Helper function to convert alphanumeric code to a numeric string
function alphanumericToNumericString(alphanumeric: string): string {
  return alphanumeric.split('').map(char => char.charCodeAt(0).toString()).join('');
}

export async function generateInviteCode(): Promise<{ inviteCode: string; proof: any; publicSignals: any }> {
  const inviteCode = Math.random().toString(36).substring(2, 10).toUpperCase();
  const validCode = inviteCode; // In a real scenario, this should come from a secure source

  const numericInviteCode = alphanumericToNumericString(inviteCode);
  const numericValidCode = alphanumericToNumericString(validCode);

  console.log("Generated invite code:", inviteCode);
  console.log("Numeric invite code:", numericInviteCode);
  console.log("Numeric valid code:", numericValidCode);

  try {
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

