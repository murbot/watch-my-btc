import {APIGatewayProxyEventV2, APIGatewayProxyResultV2} from 'aws-lambda';
import {AlertRuleService} from '../common/alert-rule-service';
import {ErrorUtils} from '../common/error-utils';

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> =>
{
  return await ErrorUtils.execute(
      async () =>
      {
        let request;
        try
        {
          request = JSON.parse(event.body || '');
        } catch (err)
        {
          console.error(`Error parsing event body (${event.body}): ${err}`);
          request = null;
        }

        const createAlertRuleOutput = await AlertRuleService.createAlertRule(
            request?.email,
            request?.address,
            request?.label);

        return createAlertRuleOutput;
      },
      201);
}

interface Request
{
  email: string;
  address: string;
  label: string;
}
