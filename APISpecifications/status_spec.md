# API specifications `status`

specification formatting based on [idratherbewriting.com/learnapidoc/docapis_resource_descriptions.html](https://idratherbewriting.com/learnapidoc/docapis_resource_descriptions.html)

specification of the API that handles messages of currently running processes and error statuses.
This endpoint is used by the client side to display the processes that are currently running on the server side

## Resource Descriptions
 ### Available Methods

 * The API to handle status indicator communication `/status`:

|**method**|**path**|
 |------|-----|
 |  GET | `/statuses` |
 |  POST| `/statuses` |


 ### Endpoints

* #### GET `/statuses`
  Retreive information about current running processes on the server side  
  **Parameters**
  * `older_than` string, UNIX-timestamp indicating the maximum age of the processes
  * `remove` boolean, if false indicated processes won't be cleared after call. defaults to true if empty

* #### POST `/statuses`
  Allows a server component to tell the API what it is currently doing
  **Parameters**


## Parameters
### __end-point: status__
#### Request
| **Name** | **Method** | **Description**|
|----------|------------|----------------|
|`/statuses`| GET |Get the list of processes that are currently in progress, according to the status-API|

#### General Search Parameters

| **Name** | **Data Type** |**Required / Optional**| **Description**|
|----------|---------------|-----------------------|----------------|
|older_than|number|optional|UNIX-timestamp (in milliseconds) minimum allowed age of the messages|
|remove|Boolean|optional|Whether or not to remove all statuses from the API after they were called. Defaults to TRUE if not used. |

#### Request
| **Name** | **Method** | **Description**|
|----------|------------|----------------|
|`/statuses`| POST |Post a status indicator message to the Status API|  

#### Body Parameters  
Requires the body to be composed in x-www-form-urlencoded!

| **Name** | **Data Type** |**Required / Optional**| **Description**|
|----------|---------------|-----------------------|----------------|
|created_at|number|required|UNIX-timestamp (in milliseconds) of the time the message was posted|
|message|String|required|The String containing the message part of the message. this will be displayed on site in the progress-indicator|  

<hr>

## examples

### GET `/statuses`
#### request example
`
localhost:3000/statuses?remove=true&older_than=0
`

#### response example
response type: JSON
```JS
Status: 200 OK

[
    {
        "created_at": 1578215915,
        "message": "this is a message"
    }
]
```

### POST `/statuses`
#### request example
```
curl --location --request POST 'localhost:3000/statuses' \
--header 'Content-Type: application/x-www-form-urlencoded' \
--data-urlencode 'created_at=1578215915' \
--data-urlencode 'message=this is a message'
```

#### response example
```
Status: 200 OK

Status successfully posted
```
