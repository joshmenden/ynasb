function formatMoney (cents) {
  return `$${(cents / 1000).toFixed(2)}`.replace('$-', '-$')
}

function formatBudgetString ({ name, balance, budgeted }) {
  let budgetTitleString = `${name}`
  let budgetBalanceString = `*${formatMoney(balance)}* left of your *${formatMoney(budgeted)}* budget`
  return `${budgetTitleString}:  ${budgetBalanceString}`
}

module.exports.formatMoney = formatMoney
module.exports.formatBudgetString = formatBudgetString