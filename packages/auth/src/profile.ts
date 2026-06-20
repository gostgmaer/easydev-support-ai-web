import type { User, UserProfileUpdate } from '@easydev/types';
import type { IamClient } from './iam-client';

/** Thin façade over profile-management calls, kept separate so UI code can mock it in isolation. */
export class ProfileManager {
  constructor(private readonly iamClient: IamClient) {}

  update(update: UserProfileUpdate): Promise<User> {
    return this.iamClient.updateProfile(update);
  }
}
