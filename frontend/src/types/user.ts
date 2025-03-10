export interface PublicUser {
  id: string;
  email: string;
  username: string;
  full_name: string;
  profile_picture_url?: string;
  bio: string;
  disabled: boolean;
  analytics: {};
  websHidden: string[];
  websSaved: string[];
}

export type UpdateUser = {
  full_name?: string;
  username?: string;
  email?: string;
  password?: string;
  bio?: string;
};

export interface Search {
  query: string;
  timestamp: string;
}
export interface Analytics {
  searches: Search[];
}
