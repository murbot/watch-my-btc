import {APIGatewayProxyResultV2} from 'aws-lambda';
import {BwaError, ValidationError} from './error-types';
import {APIGatewayProxyEventQueryStringParameters} from 'aws-lambda/trigger/api-gateway-proxy';
import {ValidationErrors} from './validation-errors';

export class ErrorUtils
{
  public static async executeResponseless(
      action: () => Promise<void>,
      successStatusCode: number = 200): Promise<APIGatewayProxyResultV2>
  {
    return await ErrorUtils.execute(
        action,
        successStatusCode);
  }

  public static async execute(
      action: () => Promise<any>,
      successStatusCode: number = 200): Promise<APIGatewayProxyResultV2>
  {
    try
    {
      const actionResult = await action();

      return {
        statusCode: successStatusCode || 200,
        body: actionResult ? JSON.stringify(actionResult) : null,
        headers: actionResult ? {
          'Content-Type': 'application/json'
        } : null
      } as APIGatewayProxyResultV2
    } catch (err)
    {
      if (err instanceof ValidationError)
      {
        return {
          statusCode: err.status || 400,
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(err),
        } as APIGatewayProxyResultV2
      }
      else if (err instanceof BwaError)
      {
        return {
          statusCode: err.status || 500,
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(err),
        } as APIGatewayProxyResultV2
      }
      else
      {
        console.error(`Error executing action: ${err}`);
        return {
          statusCode: 500,
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            message: 'Internal server error',
          }),
        } as APIGatewayProxyResultV2
      }
    }
  }

  public static async validateRequiredQueryStringParameters(names: string[], queryStringParameters: APIGatewayProxyEventQueryStringParameters): Promise<void>
  {
    const validationErrors = new ValidationErrors();

    for (const name of names)
    {
      if (!queryStringParameters[name] || queryStringParameters[name]?.trim() === '')
      {
        validationErrors.addDetail(`Missing required query string parameter: ${name}`);
      }
    }

    if (validationErrors.hasErrors())
    {
      throw new ValidationError(validationErrors);
    }
  }
}
