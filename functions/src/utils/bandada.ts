// utils/bandada.ts
import { ApiSdk, SupportedUrl } from "@bandada/api-sdk";

const apiSdk = new ApiSdk(SupportedUrl.PROD);

export default apiSdk;