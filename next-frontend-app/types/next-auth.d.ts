import "next-auth";

declare module "next-auth" {
  interface Session {
    role?: "staff" | "parent";
    accessToken?: string;
    user: {
      id?: string;
      name?: string | null;
    };
  }

  interface User {
    accessToken?: string;
    role: "parent" | "staff";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken: string;
    role: "parent" | "staff";
    id: string;
  }
}
