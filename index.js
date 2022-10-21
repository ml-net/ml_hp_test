const express = require('express')
const app = express()
const port = process.env.PORT || 3000

var transactions = [];

/**
 * Funzione che recupera le informazioni relative alle transazioni.
 * La funzione può interrogare API, eseguire query su DB, in questo caso viene
 * semplicemente letto un file csv
 * Viene popolato l'array transactions che contiene oggetti JSON che rappresentano tuple
 * relative alle transazioni, con 
 * - customer_id
 * - data della transazione
 * - valore della transazione, con prefisso pari al simbolo della valuta
 * @returns integer numero di righe, null in caso di errore
 */
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

/**
 * Funzione che restituisce il tasso di cambio in EUR della valuta passata in input
 * Non viene interrogata una API in questo caso ma il tasso è fisso, tranne per la valuta
 * fittizia RND che restituisce un tasso random
 * @param {string} currency indica la sigla standard della valuta 
 * @returns float valore del tasso di cambio, null in caso di errore
 */

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

/**
 * Endpoint /report/{customer} - GET
 * Recupera (genera) la lista delle transazioni, dopo di che cicla l'array e per ogni tupla
 * che corrisponde al customer_id isola la valuta, ottiene il tasso di cambio, converte la valuta in EUR 
 * e aggiorna l'array che conterrà il report, calcolando anche il totale delle transazioni
 */
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

/**
 * Endpoint /exchangerate/{currency} - GET
 * Espone come API anche il metodo per ottenere il tasso di cambio della valuta desiderata
 */
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