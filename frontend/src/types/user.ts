export interface PublicUser {
  id: string;
  email: string;
  full_name: string;
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
