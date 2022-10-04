That's an interesting question - wonder how we go about it. There are a few interesting ways to sell, 

1. We could offer to buy up Stamps (like Sam suggested) upto some amount -- $10K perhaps -- using bAR. We could start with price of Stamps at 0.01 bAR and go up 0.01 bAR each time someone sells. This would be a total sale of 1413 STAMP coins. with the last one priced at 14.13 bAR (with $20k - this would be 2000 STAMPs). This would serve to bootstrap the economy and prop up the price of STAMPs, plus also reward creators with bAR and get some distribution in!

2. Educated guess on what people will pay: if we think that the true value of stamps is uniformly distributed between 0 and 0.5 AR, then the best place to price it would be about 0.25 AR each 

3. Let the market decide like you suggested. 

1 would be more involved but would be an interesting way to test out and bootstrap bar and Stamps 
one question I have though @tom-permapages - how many STAMPs do you think are currently in circulation?
and do we have periodic minting in place?

---

Can the buyer be the price setter in flex

create an order to exchange BAR for STAMPCOIN, for a price of .01 BAR, for a qty of 1000
then a seller creates an order to match the best prices

``` js
writeInteraction({
  function: 'allow',
  target: 'STAMPCOIN',
  qty: 1000
})
writeInteracion({
  function: 'createOrder',
  pair: [BAR, STAMP],
  transaction: 'allowTx',
  price: 100000,
  qty: 1000
})
```
