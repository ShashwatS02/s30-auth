export type User = {
  id: string;
  email: string;
  createdAt: string;
};

export type RegisterResponse = {
  user: User;
};

export type LoginResponse = {
  accessToken: string;
  sessionId: string;
};

export type RefreshResponse = {
  accessToken: string;
};

export type MeResponse = {
  user: User;
};

export type ApiErrorResponse = {
  error:
    | string
    | {
        code?: string;
        message?: string;
      };
};
