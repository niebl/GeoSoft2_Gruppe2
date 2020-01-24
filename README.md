<a><img src="https://github.com/Dingensen/GeoSoft2_Gruppe2/blob/master/GEOmergency.png" width="260" height="160"></a>

# TweetYourBeacon
GEOmergency is a server-based application used to get an overview of extreme weather events in Germany, including context-relevant posts by Twitter users in affected areas.

## Getting started
These instructions will guide you to get the application running on your local machine

### Prerequisites 
Necessary software including links, in case they are not installed yet

For usage only:

* <a href ="https://nodejs.org/en/download/"> Node.js</a>
* <a href ="https://www.mongodb.com/download-center/community"> MongoDB</a>

For testing:

* <a href ="https://jmeter.apache.org/download_jmeter.cgi">JMeter</a>

### Installing
Step by step instructions to get the application started

* Open the command line
> navigate to the folder where the repository/project is downloaded into and install the dependencies

```
cd "your project path"
npm install
```

* Open a second command line
> set the path of your mongod.exe and set your project folder as the database path

```
"your mongod.exe path" --dbpath="your project path"
```

* Open a third command line
> run mongo

```
mongo
```

* Go back to the first command line
> create a package.json file, install all dependencies and run the application

```
npm init    //press Enter until the file is created
npm install
npm start
```

* For the final step, open your browser
> access the application

```
localhost:3000/geomergency
```

### Example
Beispielbild der App


### Testing
Instructions to test the running application

* Once JMeter is installed, navigate to the bin folder of your JMeter path
and open the jmeter.bat file

* Within the JMeter application and open the .jmx file, accessible in the project folder

* Start the test and wait until it is finished or change the settings of the Thread Group as you like and start afterwards

* Click on some of the attached listeners to see the test results 

## Authors
* Felix
* Dorian
* Marius
* Rene
 