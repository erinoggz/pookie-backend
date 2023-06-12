import { Document, Types } from 'mongoose';

export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  password: string;
  phoneNumber: string;
  current_subscription: Types.ObjectId;
  gender: 'MALE' | 'FEMALE' | 'NOT_SPECIFIED';
  profilePicture: string;
  userType: 'PARENT' | 'SITTER' | 'GRIND';
  firstName: string;
  referredBy: string;
  lastName: string;
  address: string;
  aboutMe: string;
  state: string;
  urlKey: string;
  age: string;
  dateOfBirth: string;
  training: boolean;
  smoker: boolean;
  gardaCheck: 'PENDING' | 'VERIFIED' | 'UN_VERIFIED';
  gardaCheckdoc: string;
  ownCar: boolean;
  country: string;
  noOfChildren: string;
  specialNeeds: string;
  experience: string;
  profileSetupComplete: boolean;
  pets: string;
  rate: string;
  device_token: string;
  language: string;
  firstAid: boolean;
  childcareCertification: string;
  cpr: string;
  ownTransport: boolean;
  availability: 'AVAILABLE' | 'BUSY' | 'NOT_AVAILABLE';
  job: 'SITTER' | 'AU_PAIR' | 'NANNY' | 'GRIND';
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
  childcareCertified: boolean;
  ratings: { reviewCount: number; averageRatings: number };
}
