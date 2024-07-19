import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import { groth16 } from 'snarkjs';
import apiSdk from '../../utils/bandada';
import { firestore } from "../../firebase/clientApp";
import { collection, getDocs, limit, orderBy, query, where } from '@firebase/firestore';


admin.initializeApp();
const db = admin.firestore();

/**
 * Creates a user document in Firestore when a new user account is created in Firebase Authentication.
 */
export const createUserDocument = functions.auth
  .user()
  .onCreate(async (user) => {
    db.collection("users")
      .doc(user.uid)
      .set(JSON.parse(JSON.stringify(user)));
  });

//! In case the above does not work
// export const createUserDocument = functions.auth
//   .user()
//   .onCreate(async (user) => {
//     const newUser = {
//       uid: user.uid,
//       email: user.email,
//       displayName: user.displayName,
//       providerData: user.providerData,
//     };
//     db.collection("users").doc(user.uid).set(newUser);
//   });

/**
 * Deletes the user document in Firestore when a user account is deleted in Firebase Authentication.
 */
export const deleteUserDocument = functions.auth
  .user()
  .onDelete(async (user) => {
    db.collection("users").doc(user.uid).delete();
  });

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
  
  function alphanumericToNumericString(alphanumeric: string): string {
    return alphanumeric.split('').map(char => char.charCodeAt(0).toString()).join('');
  }
  
  export const generateInviteCode = functions.https.onRequest(async (req, res) => {
    try {
      const apiKey = functions.config().bandada.api_key || " ";
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
          const inviteCode = invcode.code;
          const validCode = inviteCode;
  
          const numericInviteCode = alphanumericToNumericString(inviteCode);
          const numericValidCode = alphanumericToNumericString(validCode);
  
          console.log("Generated invite code:", inviteCode);
          console.log("Numeric invite code:", numericInviteCode);
          console.log("Numeric valid code:", numericValidCode);
  
          const { proof, publicSignals } = await groth16.fullProve(
            { inviteCode: numericInviteCode, validCode: numericValidCode },
            './InviteCode_js/InviteCode.wasm',
            './circuit_0001.zkey'
          );
  
          if (proof && publicSignals) {
            console.log("Proof:", proof);
            console.log("Public signals:", publicSignals);
            res.json({ inviteCode, proof, publicSignals });
            return;
          }
        } catch (error) {
          console.error(`Error generating proof for community ${community.id}:`, error);
        }
      }
  
      throw new Error("No valid proof generated for any community");
    } catch (error) {
      console.error("Error in generating invite code:", error);
      res.status(500).send(error);
    }
  });
  
  export const verifyInviteCode = functions.https.onRequest(async (req, res) => {
    try {
      const { proof, publicSignals } = req.body;
      const vKey = await fetch('https://akoben-83375.firebaseapp.com/verification_key.json').then(res => res.json());
      const isValid = await groth16.verify(vKey, publicSignals, proof);
      res.json({ isValid });
    } catch (error) {
      console.error("Error in verifying invite code:", error);
      res.status(500).send(error);
    }
  });