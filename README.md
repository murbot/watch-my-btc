# Watch My BTC

Watch My BTC is a service that watches for changes in Bitcoin address balances and sends alerts
when a change is detected.

The project is in a very early stage. I've open sourced the code in the interest of
transparency and trust, and in the spirit of the Bitcoin community. My aim was not
to create a polished, turn-key solution, although I may do that as another project.
I've now implemented a new version of the service (see below).

## New Version!!! [luna.watchmybtc.com](https://luna.watchmybtc.com)

A completely new and separate version of Watch My BTC has been released. It employs
a completely different architecture in order to support a broader and more robust
set of features. Among the new features are:

* Account creation, login, management and dashboard
* XPUB monitoring
* Regualr address monitoring
* Configurable alerts (email, slack, discord, webhooks)
* More coming

You can access the new version at [luna.watchmybtc.com](https://luna.watchmybtc.com).

**Please use the new version instead of this one. This version will not be updated**. The source
code for the new version has not been open sourced yet, but it may be in the future.

## Hosted Version

A hosted version of the service is available in the cloud and can be found at
[watchmybtc.com](https://watchmybtc.com). The service is free to use.

The reason for a cloud/hosted deployment rather than local execution is so that you can be
alerted even when your computer/device is off.

## How It Works

The service revolves around two primary inputs: an email address and a Bitcoin address.
Every 20 minutes, the backend will check whether the balance for each address has changed.
If it has, an email will be sent to the email address provided. The email will contain the
old and new balance.

## Privacy

When someone provides an email address and a Bitcoin address, they are associating the two.
This should be taken into consideration in the context of privacy. If a user is does not want
their Bitcoin associated with their personal email address, they should use an email address
not tied to their personal identity.

Since the service is hosted in the cloud, it is possible that the service operator could see
the addresses you are watching. To avoid this, you can run the service yourself. The service
is open source and can be found at [github.com/murbot/watch-my-btc](https://github.com/murbot/watch-my-btc).

## Technology and Project Structure

The service consists of two subprojects: a backend and a frontend. They are located in
the following subdirectories:

* backend
* ui

### Backend

The backend is implemented in Node.js (tested with version 18.x). It provides a simple web service API
via HTTP. The API is used by the UI to create and manage alerts.

The backend is tightly coupled to AWS SDKs, as it utilizes AWS services for its functionality. A `terraform`
directory is included for the purpose of deploying the backend to AWS.

### UI

The UI is implemented in Angular (latest version at the time of writing). It is a simple single
page application that makes calls to the backend to create and manage alerts.
