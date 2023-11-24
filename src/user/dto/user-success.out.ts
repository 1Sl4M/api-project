import { User } from '../entity/user.entity';

export class UserSuccessOut {
  declare user?: User;

  declare statusCode: number;

  declare message?: string;
}
