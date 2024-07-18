// utils/bandada.ts
import { ApiSdk, SupportedUrl } from "@bandada/api-sdk";

const apiSdk = new ApiSdk(SupportedUrl.PROD);

export default apiSdk;


const groupId = "67591417536886933870648838719950"
const memberId = "1"
const inviteCode = "UBQ8CE8V"

await apiSdk.addMemberByInviteCode(groupId, memberId, inviteCode)