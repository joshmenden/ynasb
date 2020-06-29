import ScheduleDailyYNABAlert from './ynab/ScheduleDailyBudgetAlert'
import express from 'express'
import SlackSlashApi from './ynab/SlackSlashApi'
const bodyParser = require('body-parser')
const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

ScheduleDailyYNABAlert()

app.use('/slack', SlackSlashApi)
app.listen(3000, () => console.log('Server is now listening on port 3000!'))