# You Need a Slack Bot

YNAB, meet Slack. This repo contains the code for a simple server the posts daily budget updates and accepts budget requests on Slack.

## Functionality

### Daily Updates

The bot is set up automatically to post to Slack every morning at 9am to a specified channels. You tell this bot what budget categories you want to know about. You can get the summary at any time by running `/budget summary` in Slack.

### Budget Category Requests

You can use a Slack slash command to get the budget for a specific category. For example, `/budget Groceries` or `/budget Transportation`.

## Set Up

1. Clone the repo
2. Create a file `.env`
3. The `.env` file accepts two arguments, `SLACK_YNAB_WEBHOOK` and `YNAB_API_TOKEN`. (We'll go over how to get the Slack Webhook later, and for info in how to generate a YNAB api key, (click here)[https://api.youneedabudget.com/].)
4. Create a file `lib/config.js`
5. Fill it out with the following information:

```
export default {
  alertCategories: [
    "Groceries",
    "Transportation",
    ... any other budget you want to be alerted about daily
  ],
  accountsToTrack: [
    "Chase Credit Card",
    "Wells Fargo Checking",
    ... any other account for which you want to be notified of uncategorized transactions
  ]
}
```

6. You're going to have to set up your own Slack App for your own workplace. Follow the steps in setting it up.
7. Allow for "Incoming Webhooks" and copy the incoming URL to the channel you choose into the `.env` file.
8. In the "Slack Commands" permissions, add the domain that your server will be at. This bot listens at the `/slack/budget` path
9. In order to get this app working on your server, make sure you have the `.env` and the `/lib/config.js` files, and then run `npm start`, and bingo! You're good to go!