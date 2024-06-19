import { UserInfo } from "./UserInfo"; // Adjust the import path as needed

/**
 * A user account.
 *
 * @public
 */
export interface User extends UserInfo {
  /**
   * Whether the user is in the semaphore group.
   */
  readonly groupVerified: boolean;
  /**
   * Additional metadata around user creation and sign-in times.
   */
  readonly metadata: {
    creationTime: string;
    lastSignInTime: string;
  };
  /**
   * Additional per provider such as displayName and profile information.
   */
  readonly providerData: UserInfo[];
  /**
   * The user's unique Semaphore ID.
   */
  readonly semaphoreId: string;
  /**
   * Deletes and signs out the user.
   */
  delete(): Promise<void>;
  /**
   * Returns a JSON-serializable representation of this object.
   *
   * @returns A JSON-serializable representation of this object.
   */
  toJSON(): object;
}
