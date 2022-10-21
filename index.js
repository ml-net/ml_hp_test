const express = require('express')
const app = express()
const port = process.env.PORT || 3000

var transactions = [];

function getData() {
    try {
        const data = require('fs').readFileSync('./data.csv').toString().split('\n');
        let fields = data[0].replace(/"/g, '').split(';');
        data.shift();
        transactions = [];
        data.forEach(row => {
            if (row != '') {
                content = row.replace(/"/g, '').split(';');
                let t_row = {};
                fields.forEach((f, idx) => {
                    t_row[f] = content[idx];
                })
                transactions.push(t_row)
            }
        })
        return transactions.length;
    } catch (err) {
        console.log(err);
        return null;
    }
}

function getRate(currency) {
    let rateIdx = 0;
    switch (currency) {
        case 'EUR':
            rateIdx = 1;
            break;
        case 'USD':
            rateIdx = 0.97;
            break;
        case 'GBP':
            rateIdx = 0.88;
            break;
        case 'RND':
            rateIdx = Math.round(Math.random() * 1000) / 100;
            break;
        default:
            rateIdx = null;
            break;
    }
    return rateIdx;
}

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.get('/report/:customer', (req, res) => {
    if (getData() == null) {
        res.status(400).send("Unable to collect Transaction data");
    } else {
        if (transactions.length == 0) {
            res.status(400).send("No Transaction data found");
        } else {
            let total = null;
            let report = [];
            transactions.forEach(trans => {
                if (trans.customer == req.params.customer) {
                    if (total == null) {
                        total = 0;
                    }
                    let currency = '';
                    switch (trans.value[0]) {
                        case '$':
                            currency = 'USD';
                            break;
                        case '€':
                            currency = 'EUR';
                            break;
                        case '£':
                            currency = 'GBP';
                            break;
                        default:
                            currency = 'RND';
                            break;
                    }
                    let value = Math.round(trans.value.substr(1) * getRate(currency) * 100) / 100;
                    report.push({ date: trans.date, value: value });
                    total += value;
                }
            })
            if (total == null) {
                res.status(404).send("Customer not found");
            } else {
                report.push({ count: report.length, total: Math.round(total * 100) / 100 })
                res.send(report)
            }
        }
    }
})

app.get('/exchangerate/:currency', (req, res) => {
    let rate = getRate(req.params.currency);
    if (rate == null) {
        res.status(400).send("Currency not valid");
    } else {
        res.send({ "rate": rate })
    }
})

app.listen(port, () => {
    console.log(`ML Home Panda Dev Test listening on port ${port}`)
})