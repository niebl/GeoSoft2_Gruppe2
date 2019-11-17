# API specifications
## Resource Descriptions
 ### Available Methods
 * The API to retreive tweets `/TweetAPI`  
    accesses the tweetdb resource  
  |**method**|**path**|
  |------|-----|
  |  GET | `/TweetAPI/search` |
  | POST | `/TweetAPI`|
  | DELETE | `/TweetAPI`|

 * The endpoint to retreive radar data `/Radar`  
    accesses the geoserver resource   
   ####TODO: add the following to following chapters as well####  
  |**method**|**path**|
  |------|-----|
  |  GET | `/Radar/getCapabilities` |
  |  GET | `/Radar/raster` |
  |  GET | `/Radar/vector` |

 * The database containing the tweets `/tweetDB`  
 * The WMS and WFS source `/Geoserver`

## Endpoints and Methods


* #### GET `/TweetAPI/search`  
  Search the tweet-database for tweets containing certain strings in their text-field.  

  Allows to search for tweets that INCLUDE certain strings.  
  Allows to EXCLUDE tweets containing certain strings.  

  **Parameters**  
  * `bbox` the geographical boundaries in which the tweets are located (WGS84)  
  * `include` the string to be included  
  * `exclude` the string to be excluded  
  * `fields` specify which fields to return in the response JSON  
  * `latest` if TRUE, return only the latest tweet


  <hr>

* #### GET `/TweetAPI/search`  
  Search the tweet-database for tweets containing certain strings in their text-field.  

  Allows to search for tweets that INCLUDE certain strings.  
  Allows to EXCLUDE tweets containing certain strings.  

  **Parameters**  
  * `include` the string to be included  
  * `exclude` the string to be excluded  


  <hr>

* #### POST `/TweetAPI`
  Add a Tweet to the database  
  To be used by the server to add tweet data it downloaded


  <hr>

* #### DELETE `/TweetAPI`  
  Add a Tweet to the database  
  To be used by the server to add tweet data it downloaded  

  **Parameters**  
  * `TweetID` the ID of the tweet to be deleted  



## Parameters
### Tweet-Search
#### Request
| **Name** | **Method** | **Description**|
|----------|------------|----------------|
|`tweetAPI/search`| GET |Search for tweets within a location, optionally containing strings

#### General Search Parameters
| **Name** | **Data Type** |**Required / Optional**| **Description**|
|----------|---------------|-----------------------|----------------|
|bbox|number array|required|bounding box of 2 coordinates in the WGS84 format, represented as an array of four numbers: `bbox={lat northwest corner},{lon northwest corner},{lat southeast corner},{lon southeast corner}`|
|include|string|optional|a string that is to be included in the returned tweets' texts. may contain a regular expression|
|exclude|string|optional|a string that is not to be contained within the returned tweets' texts. may contain a regular expression|
|fields|string array|optional|The fields that are to be included in the returned tweets' JSON. formatted as an array of strings: `fields=field1,field2,...,fieldN`|
|latest|Boolean|optional|If true, only the latest tweet that meets all the queries will be returned|

<hr>

### Tweet-POST
#### Request
| **Name** | **Method** | **Description**|
|----------|------------|----------------|
|`/TweetAPI`|POST|POST request to add a tweet to the database|

####TODO: convey that body contains all of tweets information

#### General Search Parameters
| **Name** | **Data Type** |**Required / Optional**| **Description**|
|----------|---------------|-----------------------|----------------|

<hr>

### Tweet-DELETE
#### Request
| **Name** | **Method** | **Description**|
|----------|------------|----------------|
|`/TweetAPI` |DELETE  	  |Delete request  |

#### General Search Parameters
| **Name** | **Data Type** |**Required / Optional**| **Description**|
|----------|---------------|-----------------------|----------------|
|TweetID|String|required|the id of the tweet, as it is contained in the "id"-field|

## Request example

## Response example and schema
