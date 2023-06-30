export class ErrorUtils
{
  public static parseError(err: any): string
  {
    if (!err.status || (err.status !== 400 && err.status !== 409 && err.status !== 404))
    {
      return `Sorry, but an unexpected error has occurred. Please try again later.`;
    }
    else
    {
      if (err.status === 400)
      {
        console.debug(`Bad request response: ${err.error}`);
        return err.error?.validationErrors?.details[0]?.message || `Sorry, but an unexpected error has occurred. Please try again later.`;
      }
      if (err.status === 404)
      {
        return err.error?.message || `It looks like it doesn't exists.`;
      }
      if (err.status === 409)
      {
        return err.error?.message || `It looks like it already exists.`;
      }
      return `Sorry, but an unexpected error has occurred. Please try again later.`;
    }
  }
}
