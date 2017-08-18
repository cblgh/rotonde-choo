# rotonde-choo
_a rotonde client written with choo, electron & dat_

![client](http://i.imgur.com/Gl9KfwE.jpg)


## Getting started
### [Currently OSX only]
* [Download the latest Rotonde build](https://cblgh.org/dl/rotonde-mac.zip)
* Unzip & open Rotonde.app, copy the long id in the top right
* Then create a [Hashbase](https://hashbase.io) account
  * Having created an account, click [Login](https://hashbase.io/login)
  * Click on [*Upload archive*](https://hashbase.io/new-archive)
  * In the URL box, give it the long id from before. (This is called the archive key)
  * You can skip the Name box
  * Right-click https:// (or press the little clipboard) to copy the Hashbase archive url.
  
  
    The copied url will look like `https://yourarchive-username.hashbase.io`.
 
 * Then do the following in Rotonde
 ```
    /endpoint https://yourarchive-username.hashbase.io (this is the Hashbase archive url from before)
    /save /absolute/path/you/want/for/rotonde.json (you can skip this part, defaults to ~/.config/rotonde/rotonde.json)
    /set name your name
    /set color #24292E (or whatever color you want)
    /set location the internet
    /set avatar https://link-to.picture 
     or
     /set avatar /path/to/picture
   ```
 * And you're done, time to start using it
## Tips
 * To write a message, click in the console > and write something. Press enter to published to your portal.
 * If you want people to follow you, share your archive url (if you set it with /endpoint https://yourarchive-username.hashbase.io it will be in the top right corner of Rotonde, below the long id)
 * Click on @rotonde.domains within Rotonde to see the portals of others
 * Upload an avatar directly from your computer using `/set avatar /absolute/path/to/picture.png`
 * Be sure to always use /absolute/paths and not ./path or ~/path, at least for the current version
   
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
