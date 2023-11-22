import { HttpException, HttpStatus } from '@nestjs/common';

export class CustomHttpException extends HttpException {
  constructor(errorCode: number, errorMessage: string) {
    super({ code: errorCode, message: errorMessage }, HttpStatus.BAD_REQUEST);
  }
}
