export interface UserInfo {
    /**
     * The display name of the user (will be their semaphore id)
     */
    readonly displayName: string | null;
    /**
     * The profile photo URL of the user (will be static).
     */
    readonly photoURL: string | null;
    /**
     * The provider used to authenticate the user.
     */
    readonly providerId: string;
    /**
     * The user's semaphore ID.
     */
    readonly uid: string;
  }
  