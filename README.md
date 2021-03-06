# rotonde-choo
_a rotonde client written with choo, electron & dat_



![client](http://i.imgur.com/Gl9KfwE.jpg)


## Getting started
### [Currently OSX & Linux]
* Download the latest Rotonde build: [OSX](https://cblgh.org/dl/rotonde-mac.zip), [Linux](http://cblgh.org/dl/rotonde-linux.zip)
* Unzip & open Rotonde.app, copy the long id in the top right
* Set your basic profile information
    ```
    /set name your name
    /set color #24292E (or whatever color you want)
    /set location the internet
    ```
* Then create a [Hashbase](https://hashbase.io) account
  * Having created an account, click [Login](https://hashbase.io/login)
  * Click on [Upload archive](https://hashbase.io/new-archive)
  * In the URL box, give it the long id from before (This is called the archive key)
  * Write `rotonde` in the Name box
  * Right-click https:// (or press the little clipboard) to copy the Hashbase archive url
  
  
    The copied url will look like `https://rotonde-username.hashbase.io`   
    
    _if you filled in something else in the Name box above your url will reflect what you wrote instead_
  * Check back in a while to make sure that the progress bar has reached 100%. If it's still at 0% after 15-30 minutes (and you've kept your Rotonde client open) something might be wrong and you should tell [cblgh](https://twitter.com/cblgh) about it.
  
  You can continue to setup your Rotonde client according to the instructions below even if the progress bar is at 0%. Nothing will be lost.
 
 * Then do the following in Rotonde
 ```
    /endpoint https://rotonde-username.hashbase.io (this is the Hashbase archive url from before)
    /save /absolute/path/you/want/for/rotonde.json (you can skip this part, defaults to ~/.config/rotonde/rotonde.json)
    /set avatar https://link-to.picture 
         or
    /set avatar /path/to/picture
   ```
 * And you're done, time to start using it
 
## Tips
 * To refresh your feed, press the Rotonde logo
 * To write a message, click in the console > and write something. Enter to publish.
 * If you want people to follow you, share your archive url (if you set it with `/endpoint https://rotonde-username.hashbase.io` it will be in the top right corner of Rotonde, below the long id)
 * Click on @rotonde.domains within Rotonde to see the portals of others
 * Upload an avatar directly from your computer using `/set avatar /absolute/path/to/picture.png`
 * Be sure to always use /absolute/paths and not ./path or ~/path, at least for the current version
 * If something weird happens, let [cblgh](https://twitter.com/cblgh) know, and then do /home to clear it
 * Check out [this list](http://rotonde.cblgh.org/crawl) for feeds to follow

## Writing
When writing, you can add a url per the [Spec](https://github.com/Rotonde/Specs) using `--url https://your.link`:  
`> today i released the first version of choo rotonde --url https://github.com/cblgh/rotonde-choo`

You can also add media with `--media https://link.to.media` or `--media /absolute/path/to/media.png`:  
`> practicing illustration --media /Users/cblgh/illustration/123.png`

Finally, you can add the day's [focus rating](https://github.com/Rotonde/Specs#focusexample) with --focus:   
`> researched dat --focus 0.4` 
_(actually untested so maybe this doesn't work ehe)_


## Reference sheet
### Settings
The settings file is located at `~/.config/rotonde/.rotonde` and contains 
```json
{
    "rotonde location": "/path/to/rotonde.json",
    "dat endpoint": "http://subdomain-user.hashbase.io"
}
```
You may write your own client and read/update the settings file's `"rotonde location"`, allowing for [fungible](http://www.dictionary.com/browse/fungible) clients.

### Commands
#### `/save /your/path/to/rotonde.json`
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;set where your rotonde.json resides on your system, the default is ~/.config/rotonde/rotonde.json
  
#### `/endpoint https://yourarchive-username.hashbase.io`
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;set the hashbase url   
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;used mainly when uploading media from the local filesystem with 
    * /set avatar /path/to/png 
    * <message> --media /path/to/media

#### `/follow rotonde.portal.domain`
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;e.g. /follow rotonde.cblgh.org
#### `/unfollow rotonde.portal.domain`

#### `/set name your name`
#### `/set location Yajnevth`
#### `/set color #343434`
#### `/set avatar /absolute/path/to/picture.png`
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;or 
#### `/set avatar https://link/to/picture.png`

#### `/home`
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;go back to your portal, useful after you have been clicking around on the @portal.domains









 
 ## How it works
 Dat + Hashbase etcetc
 
 ## License
 MIT
