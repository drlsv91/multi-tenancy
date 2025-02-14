export type AuthUser = {
  userId: string;
  fullName?: string;
  tenantId: string;
  email: string;
};

export type User = {
  id: string;
  email: string;
};
