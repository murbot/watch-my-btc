export class ValidationErrors
{
  details: Array<ErrorDetail> = [];

  public addDetail(message: string, field?: string): ValidationErrors
  {
    this.details.push({
      message: message,
      field: field
    });
    return this;
  }

  hasErrors(): boolean
  {
    return this.details.length > 0;
  }
}

export interface ErrorDetail
{
  field?: string;
  message: string;
}
