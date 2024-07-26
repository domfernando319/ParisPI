const express = require('express')
const { generateApiKey } = require('generate-api-key')
const app = express()
const PORT = 1337
require('dotenv').config()

// Variables
const STRIPE_SECRET_KEY = process.env.STRIPE_SK
const stripe = require('stripe')(STRIPE_SECRET_KEY)
const DOMAIN = 'http://localhost:1337'


// middleware
app.use(express.static('public'))


// routes

app.post('/create-checkout-session/:product', async (req,res) => {
    const { product } = req.params
    let mode, price_ID, line_items 

    if (product === 'pre') {
        price_ID = 'price_1Pgf9GDNBc3Yltxa8WLj39WF'
        mode = 'payment'
        line_items = [
            {
                price: price_ID,
                quantity: 1
            }
        ]
    } else {
        return res.sendStatus(403)
    }

    const newAPIKEY = generateApiKey()
    const customer = await stripe.customers.create({
        metadata: {
            APIkey: newAPIKEY

        }

    })

    const stripeCustomerID = customer.id
    const session = await stripe.checkout.sessions.create({
        customer: stripeCustomerID,
        metadata: {
            APIkey: newAPIKEY
        },

        line_items : line_items,
        mode: mode,
        success_url: `${DOMAIN}/success.html?api_key=${newAPIKEY}`,
        cancel_url: `${DOMAIN}/cancel.html`,
    })

    // create a firebase record

    // use webhook to access hte firebase entry for that api key and ensure that billing info is updated accordingly

    res.redirect(303, session.url)

})


app.listen(PORT, () => console.log(`Server has started on port: ${PORT}`))


