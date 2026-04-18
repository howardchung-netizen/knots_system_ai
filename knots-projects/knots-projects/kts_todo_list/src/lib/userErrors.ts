import { UserError } from '../modules/common/userError.type';
import { ValidationError } from 'class-validator';

export const getUserValidationErrors = (
  errors: ValidationError[],
): UserError[] =>
  errors.map(e => ({
    message: e.constraints ? Object.keys(e.constraints)
      .map(k => e.constraints![k])
      .join(', ') : 'Invalid data',
    field: [e.property],
  }));
