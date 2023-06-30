import {SendEmailCommand, SendEmailCommandInput, SESv2Client} from '@aws-sdk/client-sesv2';

const client = new SESv2Client({});
const fromEmail = process.env.FROM_EMAIL;

export class SesService
{
  public static async sendMessage(
      recipient: string,
      subject: string,
      message: string): Promise<void>
  {
    const input = {
      FromEmailAddress: fromEmail,
      Destination: {
        ToAddresses: [ recipient ]
      },
      Content: {
        Simple: {
          Subject: {
            Data: subject
          },
          Body: {
            Text: {
              Data: message
            }
          }
        }
      }
    } as SendEmailCommandInput;
    const command = new SendEmailCommand(input);
    console.debug(`Sending email: ${JSON.stringify(input)}`);
    const commandOutput = await client.send(command);
    console.debug(`Email sent: ${JSON.stringify(commandOutput)}`);
  }
}
