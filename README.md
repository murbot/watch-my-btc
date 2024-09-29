# Watch My BTC

Watch My BTC is a service that watches for changes in Bitcoin address balances and sends alerts
when a change is detected.

The project is in a very early stage. I've open sourced the code in the interest of
transparency and trust, and in the spirit of the Bitcoin community. My aim was not
to create a polished, turn-key solution, although I may do that as another project. 
I may implement the same functionality, but as an application that can run locally 
or on any infrastructure, rather than specific to AWS.

## Big Changes/Improvements Coming

Proof of concept has been completed and I am in the early stages of rewriting this service. It has proven to be
popular and so I will be completing a full rewrite, which will be far more robust and efficient. It will also bring
a number of new features, such as:

* xpub monitoring
* Ability to view and manage all alerts and balances in a single dashboard
* System health (a system status dashboard and api)
* webhook support (and potentially other integrations: slack, telegram, etc)
* Still thinking of others (feel free to suggest enhancements)

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
