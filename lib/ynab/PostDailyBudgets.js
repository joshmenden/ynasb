import SlackMessageBlock from '../util/SlackMessageBlock'
import YNAB from './YNAB'
import config from '../config'
import FormatDate from '../util/FormatDate'
import { formatBudgetString } from '../util/util'
import SlackerFactory from '../util/Slacker'
const Slacker = SlackerFactory({ slackApp: 'YNAB' })


export default class PostDailyBudgets {
  constructor() { }

  async execute () {
    let alertBlocks = await getCategoryAlerts()
    let uncategorizedBlocks = await getUncategorizedTransactionsMessage()
    let postBody = {
      blocks: alertBlocks.concat(uncategorizedBlocks)
    }
    let postStatus = await Slacker.post({ postBody: postBody })
    console.log(`Posted to Slack on: ${FormatDate()} with status: ${postStatus}`)
    return new Promise(resolve => resolve(postStatus))
  }
}

function budgetGrouping ({ groupTitle, groupEmoji, budgetNames, categories }) {
  let blocks = []
  blocks.push(new SlackMessageBlock({ type: 'section', text: `${groupEmoji}   *${groupTitle}*` }).serialize(),)
  let budgetsText = ''
  for (let budgetName of budgetNames) {
    budgetsText = budgetsText + `\n${formatBudgetString({ name: budgetName, balance: categories[budgetName].balance, budgeted: categories[budgetName].budgeted })}`
  }
  blocks.push(new SlackMessageBlock({ type: 'section', text: budgetsText}).serialize())
  return blocks
}

async function getUncategorizedTransactionsMessage () {
  const total = await totalUncategorizedTransactions()
  let blocks = []
  if (total > 0) {
    blocks.push(new SlackMessageBlock({ type: 'divider' }).serialize())
    blocks.push(new SlackMessageBlock({ type: 'section', text: `:mega:   *Alert!* These numbers might be off - we have ${total} unapproved transactions` }).serialize())
  }
  return new Promise(resolve => resolve(blocks))
}

async function getCategoryAlerts () {
  try {
    let messageBlocks = []
    let categories = await YNAB.getCategories({ flattenCategories: true })
    let alertCategories = config.alertCategories

    messageBlocks = messageBlocks.concat(budgetGrouping({ groupTitle: 'Frequently Used Categories', groupEmoji: ':moneybag:', budgetNames: alertCategories, categories: categories}))

    let negativeBudgets = []
    let nearlyOverBudgets = []
    Object.keys(categories).forEach(categoryName => {
      if(categories[categoryName].balance < 0) negativeBudgets.push(categoryName)
      if(categories[categoryName].balance > 0 && (categories[categoryName].balance / 1000) <= 30) nearlyOverBudgets.push(categoryName)
    })

    negativeBudgets = negativeBudgets.filter(budget => !alertCategories.includes(budget))
    nearlyOverBudgets = nearlyOverBudgets.filter(budget => !alertCategories.includes(budget) && !negativeBudgets.includes(budget) && categories[budget]['category_group_name'] !== 'Savings')

    if (negativeBudgets.length > 0) { messageBlocks = messageBlocks.concat(budgetGrouping({ groupTitle: 'Categories Overbudget', groupEmoji: ':exclamation:', budgetNames: negativeBudgets, categories: categories })) }
    if (nearlyOverBudgets.length > 0) { messageBlocks = messageBlocks.concat(budgetGrouping({ groupTitle: 'Categories with $30 or less', groupEmoji: ':see_no_evil:', budgetNames: nearlyOverBudgets, categories: categories })) }
    return new Promise(resolve => resolve(messageBlocks))
  } catch (error) {
    return new Promise((resolve, reject) => reject(error))
  }
}

async function getAccountIds () {
  const budgetId = await YNAB.getBudgetId()
  const { data: { accounts } } = await YNAB.client().accounts.getAccounts(budgetId)
  let accountIds = {}
  config.accountsToTrack.forEach(accountName => {
    let account = accounts.find(account => account.name === accountName)
    accountIds[accountName] = account.id
  })
  return new Promise(resolve => resolve(accountIds))
}

async function totalUncategorizedTransactions () {
  const accountIds = await getAccountIds()
  const budgetId = await YNAB.getBudgetId()
  const accountNames = Object.keys(accountIds)
  let total = 0
  for (let i = 0; i < accountNames.length; i++) {
    const { data: { transactions } } = await YNAB.client().transactions.getTransactionsByAccount(budgetId, accountIds[accountNames[i]], undefined, 'unapproved')
    total += transactions.length
  }
  return new Promise(resolve => resolve(total))
}
