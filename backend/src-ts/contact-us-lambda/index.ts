import {APIGatewayProxyEventV2, APIGatewayProxyResultV2} from 'aws-lambda';
import {ValidationErrors} from '../common/validation-errors';
import {ValidationError} from '../common/error-types';
import {ErrorUtils} from '../common/error-utils';
import {SesService} from '../common/ses-service';

const recipientEmail = process.env.CONTACT_US_RECIPIENT_EMAIL;

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> =>
{
  return await ErrorUtils.execute(
      async () =>
      {
        if (recipientEmail == null || recipientEmail.length < 1)
        {
          throw new ValidationError(new ValidationErrors()
              .addDetail(
                  'recipientEmail is not configured'
              ));
        }

        let request;
        try
        {
          request = JSON.parse(event.body || '');
        } catch (err)
        {
          console.error(`Error parsing event body (${event.body}): ${err}`);
          request = null;
        }

        await validateRequest(
            request?.email,
            request?.message);

        const createAlertRuleOutput = await SesService.sendMessage(
            recipientEmail,
            'A Message Has Been Sent From The Contact Us Form',
            `From: ${request?.email}\n\n${request?.message}`);

        return createAlertRuleOutput;
      },
      201);
}

const validateRequest = async (
    email: string,
    message: string): Promise<void> =>
{
  const validationErrors = new ValidationErrors();

  if (email == null || email.length < 1)
  {
    validationErrors.addDetail(
        'email is required',
        'email');
  }
  if (message == null || message.length < 10 || message.length > 1000)
  {
    validationErrors.addDetail(
        'message is required and must be between 10 and 1000 characters long',
        'message');
  }

  if (validationErrors.hasErrors())
  {
    throw new ValidationError(validationErrors);
  }
}

interface Request
{
  email: string;
  message: string;
}
