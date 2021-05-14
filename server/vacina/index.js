const puppeteer = require('puppeteer')

module.exports = async function vacina(req, res) {
  const { age, state } = req.body

  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  const page = await browser.newPage()

  await page.goto('https://quandovouservacinado.com/')

  await page.waitForSelector('select#age')
  await page.select('select#age', String(age))

  await page.waitForSelector('select#state')
  await page.select('select#state', state.toLowerCase())

  const button = await page.$('button[type="submit"]')
  await button.evaluate((e) => e.click())

  await page.waitForNavigation()

  const result = await page.evaluate(() => {
    const h3 = Array.from(document.querySelectorAll('h3')).find((node) =>
      node.textContent.includes('Previsão de vacinação ')
    )

    if (h3) {
      return h3.textContent.substr(38).slice(0, -3)
    }

    return undefined
  })

  return res.send({ result })
}
