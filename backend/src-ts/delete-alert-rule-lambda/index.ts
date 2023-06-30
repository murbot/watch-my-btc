import {APIGatewayProxyEventV2, APIGatewayProxyResultV2} from 'aws-lambda';
import {ErrorUtils} from '../common/error-utils';
import {AlertRuleService} from '../common/alert-rule-service';


export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> =>
{
  return await ErrorUtils.executeResponseless(
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

        await AlertRuleService.deleteAlertRule(
            request?.email,
            request?.address);
      },
      204);
}
