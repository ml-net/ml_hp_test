DEV CHALLENGE
================================

# Analisi
L'implementazione scelta è una semplice API REST che espone due metodi, più due funzioni interne per la gestione del codice.

# Metodi

### - GET /exchangerate/{currency}
Restituisce il tasso di cambio dalla valuta inserita all'Euro, le valute vanno inserite secondo la nomenclatura standard (*EUR* per Euro, *GBP* per Sterlina inglese, *USD* per Dollaro USA etc...), se la valuta non è conosciuta viene restituito **null**. Il tasso è cablato per comodità nel codice (ricavato circa alle 12 del 21/10/2022), è stata prevista una valuta fittizia (*RND*) che restituisce un tasso random
### - GET /report/{customer} 
Restituisce un report delle transazioni eseguite dal cliente indicato. Viene caricata la lista delle transazioni (per comodità letta da un file csv e riportata come un array di tuple, per simulare la lettura da un DB) e analizzando un record per volta, se l'id del cliente è uguale a quello passato in input, viene aggiunto un elemento all'oggetto JSON che comporrà la risposta del servizio, con data e valore della transazione (viene ricavata la valuta della singola transazione e applicato il tasso di conversione, per portare tutto in EUR), restituendo infine anche un'ultima riga con il totale delle transazioni e il conteggio delle stesse.

# Errori
Se viene richiesto un report per un cliente sconosciuto (non presente nella lista di dati) viene restituito un `HTTP 404` con messaggio `Customer not found`.
Se viene richiesto il tasso di cambio per una valuta non conosciuta viene restituito un `HTTP 400` con messaggio `Currency not valid`.
Se la richiesta della lista dati non va a buon fine viene restituito un `HTTP 400` con messaggio `Unable to collect Transaction data`, se inveve la lista è vuota viene restituito un `HTTP 404` con messaggio `No Transaction data found`.