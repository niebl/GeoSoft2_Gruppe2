<a><img src="https://github.com/Dingensen/GeoSoft2_Gruppe2/blob/master/GEOmergency.png" width="260" height="160"></a>

# TweetYourBeacon
Server-based application used to get an overview of extreme weather events in Germany, including context-relevant posts by Twitter users in affected areas.

## provisional tweet-API
requests to localhost:3000/tweets will return a JSON of an example tweets
using the parameter fields the tweet-JSON can be restricted to certain fields.
example: localhost:3000/tweets?fields=id,text
