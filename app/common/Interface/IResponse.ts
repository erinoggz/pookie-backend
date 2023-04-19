import { Request, Response, NextFunction } from 'express';

export interface IRequest extends Request {
  user: any;
}

export interface ErrnoException extends Error {
  errno?: number;
  code?: number;
  path?: string;
  data?: any;
  syscall?: string;
  stack?: string;
}

export interface ISuccess {
  message: string;
  data: object | Array<object>;
  status: string;
}

export interface IResponse extends Response {
  ok(data?: object | Array<object>, message?: string): void;
  serverError(data?: object | Array<object>, message?: string, code?: number): void;
}

export type INext = NextFunction;
