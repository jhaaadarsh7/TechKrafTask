export type User = {
  id: number;
  name: string;
  email: string;
  role: string;
};

export type Property = {
  id: number;
  title: string;
  location: string;
  price: number;
  imageUrl?: string | null;
};

export type Favourite = {
  id: number;
  userId: number;
  propertyId: number;
  createdAt: string;
  property: Property;
};

export type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
};

export type AuthPayload = {
  token: string;
  user: User;
};
