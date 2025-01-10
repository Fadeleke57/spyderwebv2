export interface PublicUser {
  id: string;
  email: string;
  username: string;
  full_name: string;
  profile_picture_url?: string;
  bio: string;
  disabled: boolean;
  analytics: {};
  bucketsHidden: string[];
  bucketsSaved: string[];
}

export interface Search {
  query: string;
  timestamp: string;
}
export interface Analytics {
  searches: Search[];
}
