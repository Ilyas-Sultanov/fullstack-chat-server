import { Request } from 'express';
import { validationResult } from 'express-validator';

export function getValidationMessages(req: Request) {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const messages = errors.array().map((item) => {
      return item.msg;
    });
    return messages;
  }

  return null;
}
