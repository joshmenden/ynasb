require('dotenv').config()
import PostDailyBudgets from './PostDailyBudgets'
import schedule from 'node-schedule'

export default function () {
  if (process.env.NODE_ENV === "TEST") {
    console.log('STARTING YNAB SLACKBOT JOB! *** IN TEST ENV ***')
    new PostDailyBudgets().execute()
  } else {
    console.log('STARTING YNAB SLACKBOT JOB!')
    let dailyRule = new schedule.RecurrenceRule()
    dailyRule.hour = 14
    dailyRule.minute = 15

    schedule.scheduleJob(dailyRule, () => { new PostDailyBudgets().execute() })
  }
}