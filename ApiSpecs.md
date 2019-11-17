# API specifications
## resource descriptions
 ### available methods
 * The API to retreive tweets `/TweetAPI`
  |method| path|
  |:----:|-----|
  |  GET | `/TweetAPI/search` |
  |  GET | `/TweetAPI/mostRecent` |
  | POST | `/TweetAPI`|
  | DELETE | `/TweetAPI`|
 * The endpoint to retreive radar data `/Radar`
  |method| path|
  |:----:|-----|
  |  GET | `/Radar/getCapabilities` |
  |  GET | `/Radar/raster` |
  |  GET | `/Radar/vector` |

 * The database containing the tweets `/tweetDB`  
 * The WMS and WFS source `/Geoserver`

## endpoints and methods


* **GET `/TweetAPI/search`**  
  Search the tweet-database for tweets containing certain strings in their text-field.  

  Allows to search for tweets that INCLUDE certain strings.  
  Allows to EXCLUDE tweets containing certain strings.  

  **Parameters**  
  `include` the string to be included  
  `exclude` the string to be excluded  
  `fields` specify which fields to return in the response JSON  
  `latest` if TRUE, return only the latest tweet
  <hr>

* **GET `/TweetAPI/search`**  
  Search the tweet-database for tweets containing certain strings in their text-field.  

  Allows to search for tweets that INCLUDE certain strings.  
  Allows to EXCLUDE tweets containing certain strings.  

  **Parameters**  
  `include` the string to be included  
  `exclude` the string to be excluded
<hr>

* **POST `/TweetAPI`**  
  Add a Tweet to the database  
  To be used by the server to add tweet data it downloaded

<hr>

* **DELETE `/TweetAPI`**  
  Add a Tweet to the database  
  To be used by the server to add tweet data it downloaded  

  **Parameters**  
  `ID` the ID of the tweet to be deleted  

<hr>
