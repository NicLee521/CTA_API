export default interface PassportUser {
    gId: string;
    email: string;
    refreshToken: string;
    expiresAt: Date;
    profilePhoto?: string;
}
  