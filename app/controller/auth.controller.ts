import { injectable } from 'tsyringe';
import { IRequest, IResponse } from '../common/Interface/IResponse';
import { AuthService } from '../service/auth.service';

@injectable()
class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * @route POST api/v1/auth/register.
   * @desc Register user and send verification email.
   * @access Public.
   */
  register = async (req: IRequest, res: IResponse) => {
    try {
      const result = await this.authService.registerUser(req);
      return res.ok(result?.data, result?.message || 'Registration successful');
    } catch (error) {
      return res.serverError(
        error,
        error?.message || 'An error occured while trying to login',
        error?.code
      );
    }
  };

  /**
   * @route POST api/v1/auth/login.
   * @desc Login user and return JWT token and user data.
   * @access Public.
   */
  login = async (req: IRequest, res: IResponse) => {
    try {
      const result = await this.authService.loginUser(req, res);
      return res.ok(result?.data, result?.message || 'Login successfully');
    } catch (error) {
      return res.serverError(
        error,
        error?.message || 'An error occured while trying to login',
        error?.code
      );
    }
  };

  /**
   * @route POST api/v1/auth/verify.
   * @desc Verify user account
   * @access Public.
   */
  verify = async (req: IRequest, res: IResponse) => {
    try {
      const result = await this.authService.verifyAccount(req);
      return res.ok(result?.data, result?.message || 'User verified successfully');
    } catch (error) {
      return res.serverError(
        error,
        error?.message || 'An error occured while trying to verify account',
        error?.code
      );
    }
  };

  /**
   * @route POST api/v1/auth/resend-otp.
   * @desc Resend Verification Email
   * @access Public.
   */
  resendOTP = async (req: IRequest, res: IResponse) => {
    try {
      const result = await this.authService.resendOTP(req);
      return res.ok(result?.data, result?.message);
    } catch (error) {
      return res.serverError(
        error,
        error?.message || 'An error occured while trying to login',
        error?.code
      );
    }
  };

  /**
   * @route PUT api/v1/auth/forgot-password.
   * @desc Forgot Password
   * @access Public.
   */
  forgot = async (req: IRequest, res: IResponse) => {
    try {
      const result = await this.authService.forgotPassword(req);
      return res.ok(result?.data, result?.message);
    } catch (error) {
      return res.serverError(
        error,
        error?.message ||
          'An error occured while trying to send forgot password Email',
        error?.code
      );
    }
  };

  /**
   * @route PUT api/v1/auth/reset-password.
   * @desc Reset Password
   * @access Public.
   */
  reset = async (req: IRequest, res: IResponse) => {
    try {
      const result = await this.authService.resetPassword(req);
      return res.ok(
        result?.data,
        result?.message || 'Password changed successfully. Please Login!'
      );
    } catch (error) {
      return res.serverError(
        error,
        error?.message || 'An error occured while trying to reset password',
        error?.code
      );
    }
  };

  /**
   * @route PUT api/v1/auth/change-password.
   * @desc Change Password
   * @access Public.
   */
  change = async (req: IRequest, res: IResponse) => {
    try {
      const result = await this.authService.changePassword(req);
      return res.ok(
        result?.data,
        result?.message || 'Password changed successfully!'
      );
    } catch (error) {
      return res.serverError(
        error,
        error?.message || 'An error occured while trying to change password',
        error?.code
      );
    }
  };

  /**
   * @route GET api/v1/auth/me.
   * @desc Get current User
   * @access Public.
   */
  me = async (req: IRequest, res: IResponse) => {
    try {
      const result = await this.authService.me(req);
      return res.ok(
        result?.data,
        result?.message || 'current user fetched successfully!'
      );
    } catch (error) {
      return res.serverError(
        error,
        error?.message || 'An error occured while trying to get current user',
        error?.code
      );
    }
  };

  /**
   * @route PUT api/v1/auth/profile-setup.
   * @desc Put profile setup
   * @access Public.
   */
  profileSetup = async (req: IRequest, res: IResponse) => {
    try {
      const result = await this.authService.profileSetup(req);
      return res.ok(result?.data, result?.message || 'Profile set up complete');
    } catch (error) {
      return res.serverError(
        error,
        error?.message || 'An error occured while trying to set up profile',
        error?.code
      );
    }
  };

  /**
   * @route POST api/v1/auth/refresh-token.
   * @desc Generates new access token.
   * @access Public.
   */
  refreshToken = async (req: IRequest, res: IResponse) => {
    try {
      const result = await this.authService.refreshToken(req);
      return res.ok(
        result?.data,
        result?.message || 'Access token generated successfully'
      );
    } catch (error) {
      return res.serverError(
        error,
        error?.message || 'An error occured while trying to refresh token',
        error?.code
      );
    }
  };

  /**
   * @route POST api/v1/auth/logout.
   * @desc Logout user.
   * @access Public.
   */
  logout = async (req: IRequest, res: IResponse) => {
    try {
      const result = await this.authService.logout(res);
      return res.ok(result?.data, result?.message || 'Logged out successfully');
    } catch (error) {
      return res.serverError(
        error,
        error?.message || 'An error occured while trying to logout',
        error?.code
      );
    }
  };
}

export default AuthController;
