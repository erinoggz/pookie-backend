import _ from 'lodash';
import { INext, IRequest, IResponse } from '../../common/Interface/IResponse';
import {
  ok,
  serverError,
} from './types';

export default (_req: IRequest, res: IResponse, next: INext) => {
  const responseTypes = {
    ok,
    serverError,
  };

  _.extend(res, responseTypes);
  next();
};
