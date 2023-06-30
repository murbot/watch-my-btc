import {AlertRuleService, EventBridgeRuleTargetInput} from '../common/alert-rule-service';


export const handler = async (input: EventBridgeRuleTargetInput): Promise<any> =>
{
  console.debug(`Processing input: ${JSON.stringify(input)}`);
  await AlertRuleService.processAlertRule(input.email);
  return {
    statusCode: 200
  };
}
