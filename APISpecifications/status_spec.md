# API specifications `status`

[Based on](https://idratherbewriting.com/learnapidoc/docapis_resource_descriptions.html)

## Resource Descriptions
 ### Available Methods

 * The API to handle status indicator communication `/status`:

|**method**|**path**|
 |------|-----|
 |  GET | `/status/currentprocesses` |
 |  POST| `/status/newprocess` |

<hr>

## Endpoints and Methods

* #### GET `/status/currentprocesses`
  Retreive information about current running processes on the server side  
  **Parameters**
  * `older_than` string, UNIX-timestamp indicating the maximum age of the processes
  * `remove` boolean, if false indicated processes won't be cleared after call

* #### POST `/status/newprocess`
  Allows a server component to tell the API what it is currently doing
  **Parameters**

<hr>

## Parameters
### __end-point: status__
#### Request
| **Name** | **Method** | **Description**|
|----------|------------|----------------|
|`statuses/currentprocesses`| GET |Get the list of processes that are currently in progress, according to the status-API|

#### General Search Parameters

| **Name** | **Data Type** |**Required / Optional**| **Description**|
|----------|---------------|-----------------------|----------------|
|older_than|number|optional|UNIX-timestamp (in milliseconds) minimum allowed age of the messages|
|remove|Boolean|optional|Whether or not to remove all statuses from the API after they were called. Defaults to TRUE if not used. |

#### Request
| **Name** | **Method** | **Description**|
|----------|------------|----------------|
|`statuses/newprocess`| POST |Post a status indicator message to the Status API|  

#### Body Parameters  
Requires the body to be composed in x-www-form-urlencoded!

| **Name** | **Data Type** |**Required / Optional**| **Description**|
|----------|---------------|-----------------------|----------------|
|created_at|number|required|UNIX-timestamp (in milliseconds) of the time the message was posted|
|message|String|required|The String containing the message part of the message. this will be displayed on site in the progress-indicator|  

<hr>

## examples

### GET `/status/currentprocesses`
#### request example
`
localhost:3000/status/currentprocesses?remove=true&older_than=0
`

### response example
```JS
[
    {
        "_id": "5e11adf3af423d42300e8519",
        "created_at": 1578215915,
        "message": "this is a message",
        "__v": 0
    }
]
```
