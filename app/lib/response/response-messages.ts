import { injectable } from 'tsyringe';

@injectable()
export default class ResponseMessages {
  public static STATUS_SUCCESS = 'success';
  public static STATUS_FAILED = 'failed';
  public static UNAUTHORIZED = 'UNAUTHORIZED-ACCESS';
  public static SERVER_ERROR = 'SERVER-ERROR';
}
