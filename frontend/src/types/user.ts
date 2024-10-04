export interface PublicUser {
  id: string;
  email: string;
  full_name: string;
  profile_picture_url?: string;
  disabled?: boolean;
  analytics?: {
    searches: string[];
  };
}

export interface Search {
  query: string;
  timestamp: string;
}
export interface Analytics {
  searches: Search[];
}
