import { Document, Types } from 'mongoose';

export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  password: string;
  phoneNumber: string;
  gender: 'MALE' | 'FEMALE' | 'NOT_SPECIFIED';
  profilePicture: string;
  userType: 'PARENT' | 'SITTER' | 'GRIND';
  firstName: string;
  lastName: string;
  address: string;
  aboutMe: string;
  state: string;
  country: string;
  noOfChildren: string;
  specialNeeds: string;
  profileSetupComplete: boolean;
  pets: boolean;
  rate: string;
  language: string;
  firstAid: string;
  childcareCertification: string;
  cpr: string;
  ownTransport: string;
  availability: 'AVAILABLE' | 'BUSY' | 'OTHERS';
  Job: 'SITTER' | 'AU_PAIR' | 'NANNY' | 'GRIND';
  lookingFor: 'SITTER' | 'AU_PAIR' | 'NANNY' | 'GRIND';
  meansOfVerification:
    | 'INTERNATIONAL_PASSPORT'
    | 'DRIVERS_LICENSE'
    | 'NATIONAL_IDENTITY_CARD';
  verificationData: string;
  socialCredentials: object;
  lastLogin: Date;
  status: boolean;
  googleId: string;
  facebookId: string;
  userVerifiedAt: Date;
}
