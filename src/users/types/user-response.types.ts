export type UserView = {
  email: string;
  token: string;
  username: string;
  bio: string | null;
  image: string | null;
};

export type UserResponse = {
  user: UserView;
};
