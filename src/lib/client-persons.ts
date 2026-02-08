export type ClientPersonDto = {
  id: string;
  name: string;
  role: string;
  relationship: string;
  phone?: string | null;
  email?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateClientPersonDto = {
  name: string;
  role: string;
  relationship: string;
  phone?: string | null;
  email?: string | null;
};

export type UpdateClientPersonDto = {
  name?: string | null;
  role?: string | null;
  relationship?: string | null;
  phone?: string | null;
  email?: string | null;
};
