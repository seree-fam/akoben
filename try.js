const { groth16 } = require("snarkjs");
const fs = require("fs");

// Helper function to convert alphanumeric code to a numeric string
function alphanumericToNumericString(alphanumeric) {
  return alphanumeric.split('').map(char => char.charCodeAt(0).toString()).join('');
}

async function generateInviteCode() {
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
      "./public/InviteCode_js/InviteCode.wasm",
      "./public/circuit_0001.zkey"
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

async function verifyInviteCode(proof, publicSignals) {
  try {
    const vKey = JSON.parse(fs.readFileSync("./public/verification_key.json"));
    const isValid = await groth16.verify(vKey, publicSignals, proof);

    return isValid;
  } catch (error) {
    console.error("Error in verifying invite code:", error);
    throw error;
  }
}

async function test() {
  try {
    const { inviteCode, proof, publicSignals } = await generateInviteCode();
    const isValid = await verifyInviteCode(proof, publicSignals);
    console.log(`Invite code ${inviteCode} is valid: ${isValid}`);
  } catch (error) {
    console.error("Test failed:", error);
  }
}

test();
