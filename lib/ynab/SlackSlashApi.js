import express from 'express'
const router = express.Router()
import SlackerFactory from '../util/Slacker'
const Slacker = SlackerFactory({ slackApp: 'YNAB' })
import YNAB from '../ynab/YNAB'
import { formatBudgetString } from '../util/util'
import PostDailyBudgets from './PostDailyBudgets'

router.get('/test', (req, res) => {
  res.json({ hello: 'world' }).send()
})

router.post('/budget', async (req, res) => {
  let categories = await YNAB.getCategories({ flattenCategories: true })
  if (req.body.text === "summary") {
    new PostDailyBudgets().execute()
    res.send('Posting daily summary now...')
  } else if (YNAB.budgetExists({ categoryKeys: Object.keys(categories), budget: req.body.text })) {
    postCategory(req.body.text)
    res.send('Looking up budget information now...')
  } else {
    res.send('Could not find the requested budget!')
  }
})

async function postCategory (name) {
  let [balance, budgeted, formattedName] = await YNAB.getBalanceBudgetAndName({ categoryName: name })
  if (balance !== undefined && budgeted !== undefined) {
    let budgetString = formatBudgetString({ name: formattedName, balance: balance, budgeted: budgeted })
    let slackResponse = await Slacker.postText({ text: budgetString })
    return new Promise(resolve => resolve(slackResponse))
  } else {
    return new Promise((resolve, reject) => reject())
  }
}

module.exports = router