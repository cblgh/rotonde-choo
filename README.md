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
  * Write `rotonde` in the Name box
  * Right-click https:// (or press the little clipboard) to copy the Hashbase archive url.
  
  
    The copied url will look like `https://rotonde-username.hashbase.io`.   
    
    _if you filled in something else in the Name box above your url will reflect what you wrote instead_
  * Wait until the progress bar has reached 100%. _(if it takes more than a minute and it's still at 0%, something is wrong)_ 
 
 * Then do the following in Rotonde
 ```
    /endpoint https://rotonde-username.hashbase.io (this is the Hashbase archive url from before)
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
 * To write a message, click in the console > and write something. Press enter to publish to your portal.
 * If you want people to follow you, share your archive url (if you set it with `/endpoint https://rotonde-username.hashbase.io` it will be in the top right corner of Rotonde, below the long id)
 * Click on @rotonde.domains within Rotonde to see the portals of others
 * Upload an avatar directly from your computer using `/set avatar /absolute/path/to/picture.png`
 * Be sure to always use /absolute/paths and not ./path or ~/path, at least for the current version
 * If something weird happens, let [cblgh](https://twitter.com/cblgh) know, and then do /home to clear it

## Writing
When writing, you can add a url per the [Spec](https://github.com/Rotonde/Specs) using `--url https://your.link`  
`> today i released the first version of choo rotonde --url https://github.com/cblgh/rotonde-choo`

You can also add media with `--media https://link.to.media` or `--media /absolute/path/to/media.png`  
`> practicing illustration --media /Users/cblgh/illustration/123.png`

## Reference sheet
```
/save /path/to/rotonde.json
  set where your rotonde.json resides on your system, the default is ~/.config/rotonde/rotonde.json
  
/endpoint https://yourarchive-username.hashbase.io
  set the hashbase url
  used mainly when uploading media from the local filesystem with 
    * /set avatar /path/to/png 
    * <message> --media /path/to/media

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
