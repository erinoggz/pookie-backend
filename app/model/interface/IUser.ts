import { Document, Types } from 'mongoose';

export interface IUser extends Document {
  _id: Types.ObjectId;
  email: string;
  password: string;
  phoneNumber: string;
  current_subscription: Types.ObjectId;
  gender: 'male' | 'female' | 'not_specified';
  profilePicture: string;
  userType: 'parent' | 'sitter' | 'tutor';
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
  gardaCheck: 'pending' | 'verified' | 'unverified';
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
  lessons: Array<string>;
  language: Array<string>;
  firstAid: boolean;
  childcareCertification: string;
  cpr: string;
  ownTransport: boolean;
  availability: 'available' | 'busy' | 'not_available';
  job: 'sitter' | 'au_pair' | 'nanny' | 'tutor';
  lookingFor: 'sitter' | 'au_pair' | 'nanny' | 'tutor';
  meansOfVerification:
    | 'international_passport'
    | 'drivers_license'
    | 'national_identity_card';
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
