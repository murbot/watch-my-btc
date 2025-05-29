import {
  DeleteItemCommand,
  DeleteItemCommandInput,
  DynamoDBClient,
  GetItemCommand,
  GetItemCommandInput,
  PutItemCommand,
  PutItemCommandInput
} from '@aws-sdk/client-dynamodb';
import {
  DeleteRuleCommand,
  DeleteRuleCommandInput,
  EventBridgeClient,
  PutRuleCommand,
  PutRuleCommandInput,
  PutTargetsCommand,
  PutTargetsCommandInput,
  RemoveTargetsCommand,
  RemoveTargetsCommandInput
} from '@aws-sdk/client-eventbridge';
import crypto from 'crypto';
import {ValidationErrors} from './validation-errors';
import {BwaError, NotFoundError, ValidationError} from './error-types';
import {SesService} from './ses-service';


const dynamoClient = new DynamoDBClient({region: 'us-west-2'});
const eventBridgeClient = new EventBridgeClient({region: 'us-west-2'});
const alertRuleTableName = process.env.ALERT_RULE_TABLE_NAME;
const processAlertRuleLambdaArn = process.env.PROCESS_ALERT_RULE_LAMBDA_ARN;

export class AlertRuleService
{
  /**
   * Creates a new alert rule with the given email, address, and label.
   *
   * @param email
   * @param address
   * @param label
   */
  static async createAlertRule(
    email: string,
    address: string,
    label: string): Promise<CreateAlertRuleOutput>
  {
    await AlertRuleService.validateBaseAlertRule(
      email,
      address,
      label);

    let alertRule = await AlertRuleService.getAlertRuleDynamoItem(email);
    let alertRuleAddress: AlertRuleAddress;
    if (alertRule != null)
    {
      if (alertRule.addresses.find((a) => a.address === address) != null)
      {
        throw new BwaError(
          'Already exists',
          409);
      }

      const balance = await AlertRuleService.retrieveBalances([address]);

      alertRuleAddress = {
        address,
        label,
        balance: balance[address].final_balance
      } as AlertRuleAddress;

      alertRule.addresses.push(alertRuleAddress);
      alertRule.version = alertRule.version + 1;

      await AlertRuleService.putAlertRuleDynamoItem(alertRule as AlertRule);
    } else
    {
      const balance = await AlertRuleService.retrieveBalances([address]);

      alertRuleAddress = {
        address,
        label,
        balance: balance[address].final_balance
      } as AlertRuleAddress;

      alertRule = {
        email,
        addresses: [
          alertRuleAddress
        ],
        eventBridgeRuleName: await AlertRuleService.generateEventBridgeRuleName(),
        version: 0
      } as AlertRule;

      await AlertRuleService.putAlertRuleDynamoItem(alertRule as AlertRule);
      await AlertRuleService.putEventBridgeRule(alertRule.eventBridgeRuleName);
      await AlertRuleService.putEventBridgeRuleTarget(alertRule);
    }

    return {
      address: alertRuleAddress.address,
      balance: alertRuleAddress.balance
    } as CreateAlertRuleOutput;
  }

  static async deleteAlertRule(
    email: string,
    address: string): Promise<void>
  {
    await AlertRuleService.validateDeleteAlertRule(
      email,
      address);

    const alertRule = await AlertRuleService.getAlertRuleDynamoItem(email);

    if (alertRule == null)
    {
      console.debug(`No alert rule found for email ${email} and address ${address}`);
      throw new NotFoundError()
    }

    const alertRuleAddress = alertRule.addresses.find((a) => a.address === address)

    if (alertRuleAddress == null)
    {
      console.debug(`No alert rule found for email ${email} and address ${address}`);
      throw new NotFoundError()
    }

    alertRule.addresses = alertRule.addresses.filter((a) => a.address !== address);

    if (alertRule.addresses == null || alertRule.addresses.length === 0)
    {
      console.debug(`Deleting alert rule for email ${email} since no addresses remain}`);
      await AlertRuleService.removeEventBridgeRuleTargets(alertRule.eventBridgeRuleName);
      await AlertRuleService.deleteEventBridgeRule(alertRule.eventBridgeRuleName);
      await AlertRuleService.deleteAlertRuleDynamoItem(email);
    } else
    {
      alertRule.version++;
      await AlertRuleService.putAlertRuleDynamoItem(alertRule);
    }
  }

  /**
   * Retrieves the addresses for the specified email address and then checks the balances for those addresses. If
   * any balances have changed, an email is sent to the specified email address.
   *
   * @param email
   */
  static async processAlertRule(email: string): Promise<void>
  {
    const alertRule = await AlertRuleService.getAlertRuleDynamoItem(email);

    if (alertRule == null)
    {
      console.error(`No alert rule item found for email ${email}`);
      throw new BwaError(`No alert rule item found for email ${email}`, 404);
    }

    const blockchainDotComBalanceResponse =
      await AlertRuleService.retrieveBalances(alertRule?.addresses.map(value => value.address) || []);
    let balancesChanged = false;
    const addressesWithBalancesThatHaveChanged = [] as AddressWithChangedBalance[];

    for (const address of alertRule?.addresses || [])
    {
      console.debug(`Processing balance for address ${address.address} under email ${email}`);
      const previousBalance = address.balance;
      const currentBalance = blockchainDotComBalanceResponse[address.address]?.final_balance;

      if (currentBalance != null && currentBalance !== previousBalance)
      {
        console.debug(`Balance for address ${address.address} has changed from ${previousBalance} to ${currentBalance}`);

        // track a list of changed balances for notification at end of process
        address.balance = currentBalance;
        balancesChanged = true;
        addressesWithBalancesThatHaveChanged.push({
          address: address.address,
          label: address.label,
          oldBalance: previousBalance,
          newBalance: currentBalance
        });
      }
      else if (currentBalance == null)
      {
        console.error(`Balance for address ${address.address} (${email}) could not be retrieved`);
      }
      else
      {
        console.debug(`Balance for address ${address.address} has not changed from ${currentBalance}`);
      }
    }

    // if balances have changed, send an email and update the alert rule
    if (balancesChanged === true)
    {
      console.debug(`Balances have changed for email ${email}`);
      (alertRule as AlertRule).version++;
      await AlertRuleService.putAlertRuleDynamoItem(alertRule as AlertRule);

      let message = `Balances have changed for email ${email}:\n\n`;
      for (const addressWithChangedBalance of addressesWithBalancesThatHaveChanged)
      {
        message += `Address: ${addressWithChangedBalance.address}\n`;
        message += `Address Label: ${addressWithChangedBalance.label}\n`;
        message += `Old Balance: ${addressWithChangedBalance.oldBalance}\n`;
        message += `New Balance: ${addressWithChangedBalance.newBalance}\n`;
        message += `Don't notify me about this address: https://watchmybtc.com/remove?email=${email}&address=${addressWithChangedBalance.address}\n\n`;
      }
      message += 'HODL on,\n\n';
      message += 'Watch My BTC';

      await SesService.sendMessage(
        email,
        `${addressesWithBalancesThatHaveChanged.length} BTC Address Balances have Changed`,
        message);
    } else
    {
      console.debug(`Balances for email ${email} have not changed`);
    }
  }

  /**
   * Retrieves the balances for the specified addresses, from the blockchain.com API.
   *
   * @param addresses
   */
  static async retrieveBalances(addresses: string[]): Promise<BlockchainDotComBalanceResponse>
  {
    const batchSize = 50;
    const balanceResponses: BlockchainDotComBalanceResponse = {};

    for (let i = 0; i < addresses.length; i += batchSize)
    {
      const batch = addresses.slice(i, i + batchSize);
      const addressesString = batch.join('|');
      const response = await fetch(`https://blockchain.info/balance?active=${addressesString}`);

      if (response.status === 400)
      {
        throw new ValidationError(
          new ValidationErrors().addDetail('The specified address is not valid', 'address')
        );
      }
      if (response.status !== 200)
      {
        throw new BwaError(
          'An error occurred while retrieving the balances: ' + (await response.json()),
          500);
      }

      const batchResponse: BlockchainDotComBalanceResponse = await response.json();
      Object.assign(balanceResponses, batchResponse);
      console.debug(`Balance response: ${JSON.stringify(batchResponse)} from response ${JSON.stringify(response)} for addresses ${addressesString}`);

      await new Promise(resolve => setTimeout(resolve, 500));
    }

    return balanceResponses;
  }

  static async retrieveBalancesFromLuna(addresses: string[]): Promise<LunaBalanceResponse>
  {
    const batchSize = 500;
    const balanceResponses: LunaBalanceResponse = {};

    for (let i = 0; i < addresses.length; i += batchSize)
    {
      const batch = addresses.slice(i, i + batchSize);
      const lunaRequest = {
        addresses: batch
      };
      // perform a post request
      const response = await fetch('https://luna.watchmybtc.com/api/v1/addresses/get-balances', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(lunaRequest)
      });

      if (response.status === 400)
      {
        throw new ValidationError(
          new ValidationErrors().addDetail('The specified address is not valid', 'address')
        );
      }

      const batchResponse: LunaBalanceResponse = await response.json();
      Object.assign(balanceResponses, batchResponse);
      console.debug(`Balance response: ${JSON.stringify(batchResponse)} from response ${JSON.stringify(response)} for addresses ${JSON.stringify(batch)}`);

      await new Promise(resolve => setTimeout(resolve, 500));
    }

    return balanceResponses;
  }


  static async putAlertRuleDynamoItem(alertRule: AlertRule): Promise<void>
  {
    // Insert a record into DynamoDB
    const putItemCommandInput = {
      TableName: alertRuleTableName,
      Item: {
        'email': {S: alertRule.email},
        'eventBridgeRuleName': {S: alertRule.eventBridgeRuleName},
        'addresses': {S: JSON.stringify(alertRule.addresses)},
        'version': {N: alertRule.version.toString()}
      },
      ConditionExpression: 'attribute_not_exists(email) OR version = :version',
      ExpressionAttributeValues: {
        ':version': {N: (alertRule.version - 1).toString()}
      }
    } as PutItemCommandInput;

    const putItemCommand = new PutItemCommand(putItemCommandInput);
    await dynamoClient.send(putItemCommand);

    console.debug(`Put item in DynamoDB: ${JSON.stringify(putItemCommandInput)}`);
  }

  static async getAlertRuleDynamoItem(email: string): Promise<AlertRule | null>
  {
    const getItemCommandInput = {
      TableName: alertRuleTableName,
      Key: {
        'email': {S: email}
      }
    } as GetItemCommandInput;
    const getItemCommand = new GetItemCommand(getItemCommandInput);
    const getItemCommandOutput = await dynamoClient.send(getItemCommand);

    if (getItemCommandOutput.Item != null)
    {
      try
      {
        return {
          email: getItemCommandOutput.Item?.email?.S || '',
          addresses: JSON.parse(getItemCommandOutput.Item?.addresses?.S || '[]'),
          eventBridgeRuleName: getItemCommandOutput.Item?.eventBridgeRuleName?.S || '',
          version: parseInt(getItemCommandOutput.Item?.version?.N || '0')
        };
      } catch (err)
      {
        console.error(`Error parsing DynamoDB item: ${JSON.stringify(getItemCommandOutput)}`);
        throw err;
      }
    } else
    {
      return null;
    }
  }

  static async deleteAlertRuleDynamoItem(email: string): Promise<void>
  {
    const deleteItemCommandInput = {
      TableName: alertRuleTableName,
      Key: {
        'email': {S: email}
      }
    } as DeleteItemCommandInput;
    const deleteItemCommand = new DeleteItemCommand(deleteItemCommandInput);
    console.debug(`Deleting item from DynamoDB: ${JSON.stringify(deleteItemCommand)}`);
    const deleteItemCommandOutput = await dynamoClient.send(deleteItemCommand);
    console.debug(`Deleted item from DynamoDB: ${JSON.stringify(deleteItemCommandOutput)}`);
  }

  static async putEventBridgeRule(eventBridgeRuleName: string): Promise<void>
  {
    // Create a new EventBridge rule
    const putRuleCommandInput = {
      Name: eventBridgeRuleName,
      ScheduleExpression: 'rate(20 minutes)'
    } as PutRuleCommandInput;
    const putRuleCommand = new PutRuleCommand(putRuleCommandInput);
    console.debug(`Creating EventBridge rule: ${JSON.stringify(putRuleCommand)}`);
    const putRuleResponse = await eventBridgeClient.send(putRuleCommand);
    console.debug(`Created EventBridge rule: ${JSON.stringify(putRuleResponse)}`);
  }

  static async deleteEventBridgeRule(eventBridgeRuleName: string): Promise<void>
  {
    const deleteRuleCommandInput = {
      Name: eventBridgeRuleName
    } as DeleteRuleCommandInput;
    let deleteRuleCommand = new DeleteRuleCommand(deleteRuleCommandInput);
    console.debug(`Deleting EventBridge rule: ${JSON.stringify(deleteRuleCommand)}`);
    let deleteRuleCommandOutput = await eventBridgeClient.send(deleteRuleCommand);
    console.debug(`Deleted EventBridge rule: ${JSON.stringify(deleteRuleCommandOutput)}`);
  }

  static async putEventBridgeRuleTarget(alertRuleItem: AlertRule): Promise<void>
  {
    const putTargetsCommandInput = {
      Rule: alertRuleItem.eventBridgeRuleName,
      Targets: [{
        Id: await AlertRuleService.generateEventBridgeRuleTargetId(alertRuleItem.eventBridgeRuleName),
        Arn: processAlertRuleLambdaArn,
        Input: JSON.stringify({email: alertRuleItem.email} as EventBridgeRuleTargetInput)
      }],
    } as PutTargetsCommandInput;
    console.debug(`Putting EventBridge rule targets: ${JSON.stringify(putTargetsCommandInput)}`);
    const putTargetsResponse = await eventBridgeClient.send(new PutTargetsCommand(putTargetsCommandInput));
    console.debug(`Put EventBridge rule targets: ${JSON.stringify(putTargetsResponse)}`);
  }

  static async removeEventBridgeRuleTargets(eventBridgeRuleName: string): Promise<void>
  {
    const removeTargetsCommandInput = {
      Rule: eventBridgeRuleName,
      Ids: [await AlertRuleService.generateEventBridgeRuleTargetId(eventBridgeRuleName)]
    } as RemoveTargetsCommandInput;
    const removeTargetsCommand = new RemoveTargetsCommand(removeTargetsCommandInput);
    console.debug(`Removing EventBridge rule targets: ${JSON.stringify(removeTargetsCommand)}`);
    const removeTargetsCommandOutput = await eventBridgeClient.send(removeTargetsCommand);
    console.debug(`Removed EventBridge rule targets: ${JSON.stringify(removeTargetsCommandOutput)}`);
  }

  static async generateEventBridgeRuleTargetId(id: string): Promise<string>
  {
    return `bwa-target-${id}`;
  }

  static async generateEventBridgeRuleName(): Promise<string>
  {
    return crypto.randomUUID();
  }

  static async validateBaseAlertRule(
    email: string,
    address: string,
    label: string): Promise<void>
  {
    const validationErrors = new ValidationErrors();

    if (email == null || email.length < 1)
    {
      validationErrors.addDetail(
        'email is required',
        'email');
    }
    if (address == null || address.length < 14 || address.length > 74)
    {
      validationErrors.addDetail(
        'address is required and must be between 27 and 34 characters long',
        'address');
    }
    if (label == null || label.length < 1 || label.length > 100)
    {
      validationErrors.addDetail(
        'label is required and must be between 1 and 100 characters long',
        'label');
    }

    if (validationErrors.hasErrors())
    {
      throw new ValidationError(validationErrors);
    }
  }

  static async validateDeleteAlertRule(
    email: string,
    address: string): Promise<void>
  {
    const validationErrors = new ValidationErrors();

    if (email == null || email.length < 1)
    {
      validationErrors.addDetail(
        'email is required',
        'email');
    }
    if (address == null || address.length < 14 || address.length > 74)
    {
      validationErrors.addDetail(
        'address is required and must be between 27 and 34 characters long',
        'address');
    }

    if (validationErrors.hasErrors())
    {
      throw new ValidationError(validationErrors);
    }
  }
}

export interface AlertRule
{
  email: string;
  addresses: AlertRuleAddress[];
  eventBridgeRuleName: string;
  version: number;
}

export interface AlertRuleAddress
{
  address: string;
  label: string;
  balance: number;
}

export interface BlockchainDotComBalanceResponse
{
  [address: string]: {
    final_balance: number;
  };
}

export interface LunaBalanceRequest
{
  addresses: string[];
}

export interface LunaBalanceResponse
{
  [address: string]: {
    confirmed: number;
    unconfirmed: number;
  };
}

interface AddressWithChangedBalance
{
  address: string;
  label: string;
  oldBalance: number;
  newBalance: number;
}

export interface EventBridgeRuleTargetInput
{
  email: string;
}

export interface CreateAlertRuleOutput
{
  address: string;
  balance: number;
}
