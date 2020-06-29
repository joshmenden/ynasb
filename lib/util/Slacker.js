import axios from 'axios'
import SlackMessageBlock from './SlackMessageBlock'
require('dotenv').config()

class Slacker {
  constructor ({ slackApp }) {
    this.slackApp = slackApp
    switch(this.slackApp) {
      case 'YNAB':
        this.postUrl = process.env.SLACK_YNAB_WEBHOOK
        this.testUrl = process.env.SLACK_YNAB_TESTING_WEBHOOK
        break
    }
  }

  async post ({ postBody }) {
    try {
      let response = await axios({
        method: 'post',
        url: this.urlForProcess(),
        headers: { 'Content-Type': 'application/json' },
        data: postBody
      })
      return new Promise(resolve => resolve(response.status))
    } catch (err) {
      return new Promise((resolve, reject) => reject(err))
    }
  }

  async postText ({ text }) {
    try {
      let slackBody = {
        blocks: []
      }
      slackBody.blocks.push(new SlackMessageBlock({ type: 'section', text: text}).serialize())
      let postResponse = await this.post({ postBody: slackBody })
      return new Promise(resolve => resolve(postResponse))
    } catch (err) {
      return new Promise((resolve, reject) => reject(err))
    }
  }

  urlForProcess () {
    if (process.env.NODE_ENV === 'TEST') return this.testUrl
    else return this.postUrl
  }
}

export default function ({ slackApp }) {
  return new Slacker({ slackApp: slackApp })
}