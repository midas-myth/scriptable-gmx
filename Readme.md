# GMX iOS widget

## Preview

In the home screen:

![Home screen](home-screen.jpg)

In the lock screen:

![Lock screen](lock-screen.jpg)

You can also add the widget on Mac

![Mac widget](mac-widget.jpg)

## Prerequisites

- Scriptable - [Site](https://scriptable.app), [App Store](https://apps.apple.com/us/app/scriptable/id1405459188)
- MetaMask - [Site](https://metamask.io) (optional)

## Installation

1. Download the [Scriptable GMX.scriptable](<./Scriptable GMX.scriptable>) or send it to your iPhone in any messaging app
2. Open a share sheet (Activity View) and select Scriptable app. If there is no such option, try scolling to the right and tap on "more".
3. Tap on "Add to My Scripts"

## Configuration

1. Add a Scriptable widget to the place where you want it to be.
2. Long press on the widget and select "Change widget"
3. In "Script" section, select "Scriptable GMX"
4. (Optional) In "When Interacting" section, select "Open URL" and set `https://metamask.app.link/dapp/https://app.gmx.io/#/trade/long`.
5. In "Parameter" section, set account address `0x1234...4567`.

![Configuration](widget-configuration.jpg)

## Notes

- The refresh rate is controlled by iOS. So it is usually lagging behind the actual positions by minutes.

## Development

To speed up the development, link the script file from iCloud Scriptable folder to the one on your computer by running:

```bash
npm run link
# or
ln -s ~/Library/Mobile\\ Documents/iCloud~dk~simonbs~Scriptable/Documents/Scriptable\\ GMX.js index-linked.js
```

This should create an `index-linked.js` file in the root of the project where you can edit the script. Changes to this file will update the script in real time and you can reran the script on iOS by just refreshing the widget after a few seconds.

To export scriptable object (`.scriptable` file), run:

```bash
npm run export
```

You can then send the `Scriptable GMX.scriptable` file to your iPhone in any messaging app.
