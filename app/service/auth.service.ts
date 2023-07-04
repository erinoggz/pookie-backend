import { Types } from 'mongoose';
import { injectable } from 'tsyringe';
import { StatusType } from '../common/Enum/bookingStatus';
import { UserType } from '../common/Enum/userType';
import {
  ErrnoException,
  IRequest,
  IResponse,
  ISuccess,
} from '../common/Interface/IResponse';
import { IEmail } from '../common/Types/email';
import configuration from '../config/config';
import Helpers from '../lib/helpers';
import StatusCodes from '../lib/response/status-codes';
import AccountVerification from '../model/account_verification.model';
import PasswordReset from '../model/password-reset.model';
import Plan from '../model/plan.model';
import Subscription from '../model/subscription.model';
import User, { IUserModel } from '../model/user.model';
import plans from '../seeds/data/plan/plan';
import { EmailService } from './email.service';

@injectable()
export class AuthService {
  constructor(private emailService: EmailService) {}

  public registerUser = async (
    req: IRequest
  ): Promise<ISuccess | ErrnoException> => {
    const {
      email,
      address,
      password,
      firstName,
      lastName,
      userType,
      profilePicture,
      state,
      country,
      phoneNumber,
      gender,
      aboutMe,
      dateOfBirth,
      training,
      pets,
      language,
      smoker,
      rate,
      ownCar,
      experience,
    } = req.body;

    const isUserExist = await User.findOne({ email });

    // Validate email addresss
    if (isUserExist)
      return Helpers.CustomException(
        StatusCodes.BAD_REQUEST,
        `User with ${email} already exist. Please login!`
      );
    let user: IUserModel = new User({
      email,
      password,
      firstName,
      lastName,
      userType,
      address,
      profilePicture,
      state,
      phoneNumber,
      gender,
      aboutMe,
      country,
      language,
      dateOfBirth,
      training,
      smoker,
      pets,
      rate,
      ownCar,
      experience,
    });

    const input = Helpers.otpGenerator(email, userType);
    await AccountVerification.findOneAndUpdate(
      { email, userType },
      { ...input },
      { upsert: true, new: true }
    );

    const emailData: IEmail = {
      subject: 'Account Verification',
      template_name: 'verify',
      recipient_email: email,
      short_response_message:
        'verify your account :). The Otp will expire in 5 minutes',
      email_data: `${input.otp}`,
    };

    let plan_code = plans[0].plan_code;

    if (userType === UserType.sitter) {
      plan_code = plans[1].plan_code;
    }
    const plan = await Plan.findOne({ plan_code });
    const current_subscription = await Subscription.create({
      name: plan.name,
      user: user._id,
      plan: plan._id,
      amount: plan.amount,
      currency: plan.currency,
      status: StatusType.active,
    });
    user.current_subscription = current_subscription._id;
    user = await user.save();
    // Make response not to send user password
    user.password = undefined;
    await this.emailService.sendEmail(emailData);

    return Helpers.success(
      user,
      'An Email has been sent to ' +
        `${user.email}. Please follow the instructions to ${emailData.short_response_message}`
    );
  };

  public loginUser = async (
    req: IRequest,
    res: IResponse
  ): Promise<ISuccess | ErrnoException> => {
    const { email, password, device_token } = req.body;

    const user = await User.findOne({
      email,
    });
    // Validate email addresss
    if (!user)
      return Helpers.CustomException(
        StatusCodes.NOT_FOUND,
        'User with email does not exist'
      );

    // Validate password
    if (!(await user.comparePassword(password)))
      return Helpers.CustomException(
        StatusCodes.UNAUTHORIZED,
        'Invalid Email and Password provided'
      );

    // Check user account is verified
    if (!user.userVerifiedAt)
      return Helpers.CustomException(
        StatusCodes.FORBIDDEN,
        'Account not verified. Please verify account'
      );

    // Check user account is deactivated
    if (!user.status)
      return Helpers.CustomException(
        StatusCodes.UNAUTHORIZED,
        'Account is deactivated contact support for more information.'
      );

    // Set user last login
    user.lastLogin = new Date();
    if (device_token) user.device_token = device_token;
    await user.save();
    // Make response not to send user password
    user.password = undefined;

    const refreshToken = user.generateJWT(
      configuration.web.jwt_refresh_duration,
      configuration.web.jwt_refresh_secret
    );

    // Assigning refresh token in http-only cookie
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      maxAge: 24 * 60 * 60 * 1000,
    });

    return Helpers.success({
      token: user.generateJWT(
        configuration.web.jwt_duration,
        configuration.web.jwt_secret
      ),
      user: user,
    });
  };

  public verifyAccount = async (
    req: IRequest
  ): Promise<ISuccess | ErrnoException> => {
    const { email, code } = req.body;

    const user = await User.findOne({
      email,
    });

    if (!user)
      return Helpers.CustomException(
        StatusCodes.NOT_FOUND,
        'User with email does not exist'
      );

    if (user.userVerifiedAt)
      return Helpers.CustomException(
        StatusCodes.BAD_REQUEST,
        'Account already verified please login!'
      );

    const isUserExist = await AccountVerification.findOne({
      email,
      otp: code,
    });

    if (!isUserExist)
      return Helpers.CustomException(
        StatusCodes.BAD_REQUEST,
        'Invalid OTP. Please input valid OTP sent to your email'
      );

    if (isUserExist.expiresAt.getTime() < new Date().getTime()) {
      return Helpers.CustomException(
        StatusCodes.BAD_REQUEST,
        'OTP expired!. Please request a new one'
      );
    }

    const updatedFields = {
      userVerifiedAt: Date.now(),
    };

    await User.findByIdAndUpdate(
      user._id,
      { $set: updatedFields },
      { upsert: true, new: true }
    );
    return Helpers.success(null);
  };

  public resendOTP = async (req: IRequest): Promise<ISuccess | ErrnoException> => {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return Helpers.CustomException(
        StatusCodes.NOT_FOUND,
        'User with email does not exist'
      );
    }

    if (user.userVerifiedAt) {
      return Helpers.CustomException(
        StatusCodes.NOT_FOUND,
        'This account has already been verified. Please login'
      );
    }

    const input = Helpers.otpGenerator(email);
    await AccountVerification.findOneAndUpdate(
      { email },
      { ...input },
      { upsert: true, new: true }
    );

    const emailData: IEmail = {
      subject: 'Account Verification',
      template_name: 'verify',
      recipient_email: email,
      short_response_message:
        'verify your account :). The Otp will expire in 1 hour',
      email_data: `${input.otp}`,
    };
    await user.save();
    await this.emailService.sendEmail(emailData);
    return Helpers.success(
      null,
      'An Email has been sent to ' +
        `${user.email}. Please follow the instructions to ${emailData.short_response_message}`
    );
  };

  public forgotPassword = async (
    req: IRequest
  ): Promise<ISuccess | ErrnoException> => {
    const { email } = req.body;

    const user: IUserModel = await User.findOne({
      email,
    });

    if (!user)
      return Helpers.CustomException(
        StatusCodes.NOT_FOUND,
        'User does not exist. Please register!'
      );

    // 2.Check if user is verified
    if (!user.userVerifiedAt) {
      return Helpers.CustomException(
        StatusCodes.NOT_FOUND,
        "You are not verified, reset password email can't be sent for unverified accounts. Please verify your account and try again"
      );
    }

    const input = Helpers.otpGenerator(email);
    await PasswordReset.findOneAndUpdate(
      { email },
      { ...input },
      { upsert: true, new: true }
    );

    const emailData: IEmail = {
      subject: 'Password Reset OTP',
      template_name: 'reset',
      recipient_email: email,
      short_response_message: 'reset your password. The Otp will expire in 1 hour',
      email_data: `${input.otp}`,
    };

    await this.emailService.sendEmail(emailData);
    return Helpers.success(
      null,
      'An Email has been sent to ' +
        `${user.email}. Please follow the instructions to ${emailData.short_response_message}`
    );
  };

  public resetPassword = async (
    req: IRequest
  ): Promise<ISuccess | ErrnoException> => {
    const { email, newPassword, code } = req.body;

    const user = await User.findOne({
      email,
    });
    if (!user)
      return Helpers.CustomException(
        StatusCodes.NOT_FOUND,
        'User does not exist. Please register!'
      );

    const isUserExist = await PasswordReset.findOne({
      email,
      otp: Number(code),
    });

    if (!isUserExist)
      return Helpers.CustomException(
        StatusCodes.BAD_REQUEST,
        'Invalid OTP. Please input valid OTP sent to your email'
      );

    if (isUserExist.expiresAt.getTime() < new Date().getTime()) {
      return Helpers.CustomException(
        StatusCodes.BAD_REQUEST,
        'OTP expired!. Please request a new one'
      );
    }

    user.password = newPassword;
    await user.save();
    return Helpers.success(null);
  };

  public changePassword = async (
    req: IRequest
  ): Promise<ISuccess | ErrnoException> => {
    const { newPassword, oldPassword } = req.body;
    const user = await User.findById(new Types.ObjectId(req.user.id));
    // Validate password
    if (!(await user.comparePassword(oldPassword)))
      return Helpers.CustomException(
        StatusCodes.BAD_REQUEST,
        'Invalid password provided'
      );
    user.password = newPassword;
    await user.save();
    return Helpers.success(null);
  };

  public me = async (req: IRequest): Promise<ISuccess | ErrnoException> => {
    const user = await User.findById(new Types.ObjectId(req.user.id)).populate({
      path: 'current_subscription',
      populate: {
        path: 'plan',
        model: 'Plan',
      },
    });
    user.password = undefined;
    return Helpers.success(user);
  };

  public profileSetup = async (
    req: IRequest
  ): Promise<ISuccess | ErrnoException> => {
    const userData = {};
    let validateData = [];

    if (req.user.userType === UserType.parent) {
      validateData = [
        'meansOfVerification',
        'verificationData',
        'noOfChildren',
        'specialNeeds',
        'pets',
        'language',
        'lookingFor',
        'firstName',
        'lastName',
        'profilePicture',
        'phoneNumber',
        'firstName',
        'lastName',
        'gender',
        'aboutMe',
        'state',
        'country',
      ];
    }

    if (req.user.userType === UserType.sitter) {
      validateData = [
        'firstAid',
        'gardaCheck',
        'childcareCertified',
        'childcareCertification',
        'cpr',
        'rate',
        'language',
        'availability',
        'specialNeeds',
        'ownTransport',
        'job',
        'dateOfBirth',
        'smoker',
        'ownCar',
        'experience',
        'firstName',
        'lastName',
      ];
    }

    // Makes only data in validateData that can be updated
    Object.entries(req.body).forEach(([key, value]) => {
      if (validateData.includes(key)) userData[key] = value;
    });
    userData['profileSetupComplete'] = true;
    const user = await User.findByIdAndUpdate(req.user.id, { $set: userData });
    user.password = undefined;
    return Helpers.success(null);
  };

  public refreshToken = async (
    req: IRequest
  ): Promise<ISuccess | ErrnoException> => {
    const refresh_token = req?.cookies?.refresh_token;
    if (!refresh_token)
      return Helpers.CustomException(
        StatusCodes.FORBIDDEN,
        'Refresh token not provided in cookies'
      );

    const verifyToken: any = await Helpers.verifyJWT(
      refresh_token,
      configuration.web.jwt_refresh_secret
    );
    if (verifyToken) {
      const user = await User.findById(new Types.ObjectId(verifyToken.id));
      user.password = undefined;
      return Helpers.success({
        token: user.generateJWT(
          configuration.web.jwt_duration,
          configuration.web.jwt_secret
        ),
        user: user,
      });
    }
  };

  logout = (res: IResponse) => {
    res.cookie('refresh_token', '', { maxAge: 1 });
    return Helpers.success(null);
  };
}
