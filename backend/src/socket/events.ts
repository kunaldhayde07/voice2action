export const ROOM_TYPES = {
  USER: 'user',
  ADMIN: 'admin',
  PUBLIC: 'public',
} as const;

export const buildUserRoom = (userId: string): string => `user:${userId}`;
export const buildAdminRoom = (): string => 'admin:room';
export const buildPublicRoom = (): string => 'public:room';