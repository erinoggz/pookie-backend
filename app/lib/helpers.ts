import { ErrnoException, ISuccess } from '../common/Interface/IResponse';
import StatusCodes from './response/status-codes';
import moment from 'moment';
import ResponseMessages from './response/response-messages';
import * as jwt from 'jsonwebtoken';

/**
 * Class with methods to help your life... LOL
 */
export default class Helpers {
  /**
   * Checks if an object data is empty and returns.
   * @param  {object} obj - The object to check.
   * @return {boolean} - The result.
   */
  static isEmptyObject = (obj: object): boolean => {
    return (
      obj &&
      Object.keys(obj).length === 0 &&
      Object.getPrototypeOf(obj) === Object.prototype
    );
  };

  /**
   * returns random numbers.
   * @return {object} - The result.
   */
  static otpGenerator = (
    email: string,
    userType?: string
  ): { email: string; otp: number; userType: string; expiresAt: any } => {
    return {
      email,
      otp: Math.floor(100000 + Math.random() * 900000),
      userType,
      expiresAt: moment(Date.now() + 300000).format(),
    };
  };

  /**
   * returns success data.
   * @param  {object} obj - The data.
   * @param  {string} message - success message.
   */
  static success = (
    data: object | Array<object> | null,
    message?: string
  ): ISuccess => {
    return {
      message,
      data,
      status: ResponseMessages.STATUS_SUCCESS,
    };
  };

  /**
   * Creates custom Error with status codes.
   * @param  {object} obj - The object to check.
   * @return {object} - The result.
   */
  static CustomException(code?: number, message?: string): ErrnoException {
    const error: ErrnoException = new Error(message || '');
    error.code = code || StatusCodes.UNPROCESSABLE_ENTITY;
    throw error;
  }

  /**
   * Verify JWT token.
   */
  static verifyJWT = function (
    token: string,
    secret: string
  ): string | jwt.JwtPayload | object {
    return jwt.verify(token, secret);
  };
}
