const puppeteer = require('puppeteer')
const logger = require('../../utils/logger')('hr-locker')
const ifttt = require('../../utils/ifttt')

const email = process.env.HRLOCKER_EMAIL
const password = process.env.HRLOCKER_PASSWORD

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function login() {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  const page = await browser.newPage()

  await page.goto('https://login.hrlocker.com/Account/SignIn')

  await page.waitForSelector("button[type='submit']")

  await page.$eval('#Email', (node, email) => (node.value = email), email)

  await page.$eval(
    '#Password',
    (node, password) => (node.value = password),
    password
  )

  await page.click("button[type='submit']")

  await sleep(2000)

  await page.goto('https://login.hrlocker.com/TimeOn?fromSignIn=True')

  return page
}

async function clockIn() {
  const page = await login()

  await page.waitForSelector('#clock-in', { visible: true })
  await page.click('#clock-in')

  return page.browser().close()
}

async function breakStart() {
  const page = await login()

  await page.waitForSelector('#break-on', { visible: true })
  await page.click('#break-on')

  return page.browser().close()
}

async function breakOver() {
  const page = await login()

  await page.waitForSelector('#break-over', { visible: true })
  await page.click('#break-over')

  return page.browser().close()
}

async function clockOut() {
  const page = await login()

  await page.waitForSelector('[href="#clockout-modal"]', { visible: true })
  await page.click('[href="#clockout-modal"]')

  await page.waitForSelector('#clock-out', { visible: true })
  await page.click('#clock-out')

  return page.browser().close()
}

module.exports = async function hrLocker(req, res) {
  const { action } = req.body

  res.sendStatus(204)

  logger.log(`${action}: start`)
  ifttt.pushNotification(`${action}: start`)

  try {
    switch (action) {
      case 'clock_in':
        await clockIn()
        break
      case 'break_start':
        await breakStart()
        break
      case 'break_over':
        await breakOver()
        break
      case 'clock_out':
        await clockOut()
        break
    }

    logger.log(`${action}: success`)
    ifttt.pushNotification(`${action}: success`)
  } catch (err) {
    logger.log(`${action}: failed`)
    logger.error(err)
    ifttt.reportError(`${action}: failed`, err)
  }
}
