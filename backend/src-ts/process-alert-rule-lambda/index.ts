import {AlertRuleService, EventBridgeRuleTargetInput} from '../common/alert-rule-service';


export const handler = async (input: EventBridgeRuleTargetInput): Promise<any> =>
{
  try
  {
    console.debug(`Processing input: ${JSON.stringify(input)}`);
    await AlertRuleService.processAlertRule(input.email);
    return {
      statusCode: 200
    };
  }
  catch (error)
  {
    console.error(`Error processing alert rule(${input.email}): ${error} / ${JSON.stringify(error)}`);
    return {
      statusCode: 500
    };
  }
}
