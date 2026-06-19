export interface Profile {
  user_id: number;
  email1: string;
  email2: string | null;
  email3: string | null;
  tel1: string;
  tel2: string | null;
  tel3: string | null;
}
export interface User {
  id: number;
  name: string;
  profile: Profile | null;
}
export interface Group{
    id: number;
    category: number;
    name: string;
    users: User[];
}