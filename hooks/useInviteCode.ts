// hooks/useInviteCode.ts
import { useState } from "react";
import { generateInviteCode, verifyInviteCode } from "@/utils/inviteCodeUtils";

export function useInviteCode() {
  const [inviteCode, setInviteCode] = useState<string>("");
  const [proof, setProof] = useState<any>(null);
  const [publicSignals, setPublicSignals] = useState<any>(null);
  const [isValid, setIsValid] = useState<boolean>(false);

  const createInviteCode = async () => {
    try {
       const {  inviteCode, proof, publicSignals } = await generateInviteCode();

    setInviteCode(inviteCode);
    setProof(proof);
    setPublicSignals(publicSignals);
  }  catch (error) {
    console.error("Error creating invite code:", error);
  }
};

  const validateInviteCode = async () => {
    try {
    const isValid = await verifyInviteCode(inviteCode);

    console.log("Verified: ", isValid);
    return isValid;
  } catch (error) {
    console.error("Error validating invite code:", error);
  }
};

  return { inviteCode, setInviteCode, createInviteCode, validateInviteCode, isValid };
}
