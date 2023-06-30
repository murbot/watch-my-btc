import {ValidationErrors} from './validation-errors';

export class BwaError
{
  constructor(public message: string, public status: number)
  {

  }
}

export class ValidationError extends BwaError
{
  constructor(public validationErrors: ValidationErrors)
  {
    super("Validation error", 400);
  }
}

export class NotFoundError extends BwaError
{
  constructor()
  {
    super("The requested resource could not be found", 404);
  }
}
