export default class SlackMessageBlock {
  constructor({type, text = undefined, emoji = undefined}) {
      this.type = type
      this.text = text
      this.emoji = emoji
  }

  serialize () {
    switch (this.type) {
      case 'section':
        return {
          type: this.type,
          text: {
            type: "mrkdwn",
            text: this.text
          }
        }
      case 'divider':
        return {
          type: this.type
        }
      case 'context':
        return {
          type: this.type,
          elements: [
            {
              type: 'mrkdwn',
              text: this.text
            }
          ]
        }
    }
  }
}

// function myFunction({ 
//   text = "", 
//   line = 0, 
//   truncate = 100 
// } = {}) {

//  // Even if the passed in object is missing a given key, the default is used!
// }