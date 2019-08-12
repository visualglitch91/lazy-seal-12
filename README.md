# Lazy Seal XII

![](https://repository-images.githubusercontent.com/201620778/86e17100-bb75-11e9-9450-e83d2fe4ffe0)

An application with workers and webhooks to make my life easier (and also to show off)

### Webhooks

- **instagram-to-twitter:** Foward photos from my instagram account to my twitter, including the alt text and changing the caption a bit (triggered by IFTT)
- **save-tweet:** Save tweets ids and creation dates to be further deleted with the delete-old-tweets worker (triggered by IFTT)

### Workers

- **twitter-mass-blocker:** Monitor and block followers that mactch certain filters from a target account
- **delete-old-tweets:** Delete 1-month old tweets
