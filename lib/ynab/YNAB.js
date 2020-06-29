require('dotenv').config()
import * as ynab from "ynab"
const accessToken = process.env.YNAB_API_TOKEN
const ynabAPI = new ynab.API(accessToken)
import assert from 'assert'
import _ from 'lodash'

class YNAB {
  constructor() {
    this.budgetId = undefined
    this.categories = undefined
  }

  client () {
    return ynabAPI
  }

  async getBudgetId () {
    try {
      if (this.budgetId) {
        return new Promise(resolve => resolve(this.budgetId))
      } else {
        const { data: { budgets } } = await ynabAPI.budgets.getBudgets()
        this.budgetId = budgets[0].id
        return new Promise(resolve => resolve(this.budgetId))
      }
    } catch (err) {
      console.log('Error getting YNAB budget!', err)
    }
  }

  flattenCategories (categories) {
    let grouped = _.flatten(categories.map(group => group.categories.map(category => Object.assign(category, { category_group_name: group.name }))))
    let flattened = grouped.reduce((obj, item) => {
      obj[item.name] = item
      return obj
    }, {})
    return flattened
  }

  async getBalanceBudgetAndName ({ categoryName }) {
    if (!this.categories) await this.getCategories()
    return new Promise(resolve => {
      const flattened = this.flattenCategories(this.categories)
      if (Object.keys(flattened).includes(categoryName)) resolve([flattened[categoryName].balance, flattened[categoryName].budgeted, categoryName])
      if (Object.keys(flattened).includes(categoryName.toLowerCase())) resolve([flattened[categoryName.toLowerCase()].balance, flattened[categoryName.toLowerCase()].budgeted, categoryName.toLowerCase()])
      let capitalized = categoryName.split(" ").map(word => _.capitalize(word)).join(" ")
      if (Object.keys(flattened).includes(capitalized)) resolve([flattened[capitalized].balance, flattened[capitalized].budgeted, capitalized])
      resolve([])
    })
  }

  budgetExists ({ categoryKeys, budget }) {
    if (categoryKeys.includes(budget)) return true
    if (categoryKeys.includes(budget.toLowerCase())) return true
    let capitalized = budget.split(" ").map(word => _.capitalize(word)).join(" ")
    if (categoryKeys.includes(capitalized)) return true
    return false
  }

  async getCategories ({ flattenCategories = false } = { flattenCategories: false }) {
    let budgetId = await this.getBudgetId()
    const { data: { category_groups } } = await ynabAPI.categories.getCategories(budgetId)
    this.categories = category_groups
    if (flattenCategories) return this.flattenCategories(this.categories)
    else return this.categories
  }
}

export default new YNAB
