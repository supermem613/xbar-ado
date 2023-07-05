# xbar-ado
xbar plug-ins for Azure DevOps.

This repo contains plug-ins for the absolutely awesome [xbar](https://github.com/matryer/xbar#get-started) tool.

The theme for these plug-ins are around Azure DevOps (ADO). My personal workflow involves being aware of bugs on my plate and their flow, so this helps me keep tabs on what's going on. Hopefully this will be useful to you too!

## Plug-ins Available

* __xbar-ado-assigned-to-me.15m.js__. This plug-in shows the number of active and new bugs assigned to @me in the menu bar. When you hit the drop down, you get a clickable list of the bugs, sorted descending from changed date. Note that it is using a custom field - remove it if it doesn't apply to you.
* __xbar-ado-query-by-id.15m.js__. This plug-in shows the number of bugs for the given query in the menu bar. When you hit the drop down, you get a clickable list of the bugs, sorted descending from changed date. To get the query ID for your query, just navigate in ADO to it and look at the address bar. It'll be the GUID at the end of the address.


## Deploy.sh

This is a simple script that copies the plug-ins from the place you cloned this repo to the right location that xbar looks for it. Totally optional.

## Reporting issues

GitHub issues are the way to go.

## How to use them

  * Just drop the plug-ins into your xbar plugins folder;
  * Make sure it's executable (in Terminal, do `chmod +x plugin.sh`);
  * Then choose `Refresh all` from the xbar menus;
