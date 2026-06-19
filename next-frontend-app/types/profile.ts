export interface ProfileContacts {
  email1: string;
  email2?: string;
  email3?: string;
  tel1: string;
  tel2?: string;
  tel3?: string;
}
export type ContactFieldKey = keyof ProfileContacts;
export type ContactErrors = Partial<Record<ContactFieldKey, string>>;
export type LoadingField = ContactFieldKey | null;
