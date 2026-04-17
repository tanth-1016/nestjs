export type UserSerializerType = 'BASIC_INFO' | 'PROFILE';

export type BasicInfoUser = {
  email: string;
  username: string;
  bio: string | null;
  image: string | null;
};

export type ProfileUser = {
  username: string;
  bio: string | null;
  image: string | null;
  following: boolean;
};

export type BasicInfoUserResponse = {
  user: BasicInfoUser;
};

export type LoginResponse = {
  user: BasicInfoUser;
  token: string;
};

type UserSerializerShapeMap = {
  BASIC_INFO: BasicInfoUser;
  PROFILE: ProfileUser;
};

const USER_FIELDS: {
  [K in UserSerializerType]: Array<keyof UserSerializerShapeMap[K]>;
} = {
  BASIC_INFO: ['email', 'username', 'bio', 'image'],
  PROFILE: ['username', 'bio', 'image', 'following'],
};

export class UserSerializer<T extends UserSerializerType> {
  constructor(
    private readonly user: Record<string, unknown>,
    private readonly options: { type: T },
  ) {}

  private get allowedFields(): Array<keyof UserSerializerShapeMap[T]> {
    return USER_FIELDS[this.options.type] ?? [];
  }

  serialize(): UserSerializerShapeMap[T] {
    const serialized: Partial<UserSerializerShapeMap[T]> = {};

    this.allowedFields.forEach((field) => {
      const value = this.user[field as string];
      if (value !== undefined) {
        (serialized as Record<string, unknown>)[field as string] = value;
      }
    });

    return serialized as UserSerializerShapeMap[T];
  }
}
