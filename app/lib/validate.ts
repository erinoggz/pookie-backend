import { validationResult } from 'express-validator';
import { INext, IRequest, IResponse } from '../common/Interface/IResponse';
import StatusCodes from './response/status-codes';

const validate =
  (validations) => async (req: IRequest, res: IResponse, next: INext) => {
    await Promise.all(validations.map((validation) => validation.run(req)));
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const errorMsg = errors.array();
    return res.serverError(null, errorMsg[0].msg, StatusCodes.BAD_REQUEST);
  };

export default validate;
