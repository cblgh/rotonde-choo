# rotonde-choo
_a rotonde client written with choo, electron & dat_

![client](http://i.imgur.com/Gl9KfwE.jpg)

## Getting started
### `npm install && npm start`

## Setup
### [Currently OSX only]
* [Download the latest Rotonde build](https://cblgh.org/dl/rotonde-mac.zip)
* Unzip & open Rotonde.app, copy the long id in the top right
* Creating a Hashbase account
  * Create a [Hashbase](https://hashbase.io) account
  * Create a new archive
  * Give it your archive key from the top right of Rotonde
  * Copy the Hashbase archive url which looks like `https://yourarchive-username.hashbase.io`
 
 * Then do the following in Rotonde
 ```
    /endpoint https://yourarchive-username.hashbase.io
    /save /absolute/path/you/want/for/rotonde.json 
     (otherwise just leave it, and it will default to ~/.config/rotonde/rotonde.json)
    /set name your name
    /set color #123123
    /set location the internet
    /set avatar https://link-to.picture 
     or
     /set avatar /path/to/picture
   ```
   
## Reference sheet
```
/save /path/to/rotonde.json
/endpoint https://yourarchive-username.hashbase.io

/follow rotonde.portal.domain
e.g. /follow rotonde.cblgh.org
/unfollow rotonde.portal.domain

/set name your name
/set location hell
/set color #343434
/set avatar /absolute/path/to/picture.png
  or 
/set avatar https://link/to/picture.png
/home 
  go back to your portal, useful after you have been clicking around on the @portal.domains
```



 
 ## How it works
 Dat + Hashbase etcetc
 
 ## License
 MIT
