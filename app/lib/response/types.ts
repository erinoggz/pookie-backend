import { LoggerService } from '../../service/logger.service';
import ResponseMessages from './response-messages';
import StatusCodes from './status-codes';

const logger = new LoggerService();

export function ok(data = null, message = null) {
  logger.log(`${message}, ${JSON.stringify(data)}`);
  this.status(StatusCodes.OK).json({
    status: ResponseMessages.STATUS_SUCCESS,
    data,
    message,
  });
}

export function serverError(
  data = null,
  message: string = ResponseMessages.SERVER_ERROR,
  code: number = StatusCodes.INTERNAL_SERVER_ERROR
) {
  logger.error(data);
  this.status(code).json({
    status: ResponseMessages.STATUS_FAILED,
    message,
  });
}
