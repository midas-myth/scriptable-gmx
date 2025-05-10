// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: deep-blue; icon-glyph: chart-line;
// @ts-check

/**
 * @typedef {Object} Position
 * @property {string} id
 * @property {string} sizeInUsd
 * @property {string} market
 * @property {number} pnl
 * @property {boolean} isLong
 */

/**
 * @typedef {Object} Market
 * @property {string} name
 * @property {string} marketToken
 * @property {string} indexToken
 * @property {string} longToken
 * @property {string} shortToken
 */

const ALMOST_PRECISION = BigInt(10) ** BigInt(28);

const logo = Image.fromData(
  Data.fromBase64String(
    "iVBORw0KGgoAAAANSUhEUgAAAB4AAAAVCAYAAABR915hAAADwUlEQVRIS7WVW0hUQRjHZ+acXYs1NaIlL62aaVmbl1TsQuZDCRZIUZTSiwiaFtVDSTcoqdCCiii0yAdDI6IeIiMqgy4+WJQutbpewkspsVnodlsx3TPTd87Zs3t2zVyX8mVxzsz/913+3wxGfv4FmN7mOIgQLCQtr/NHAvtzKLDRNNfBcRbKYW6MHzOi1FTrdHX8AuseW+4zjmYxjiHGo+ejqxPW/XdwyF1LASXoKuMQAjCT4XjfSKaxajrwaWU8u9ZiwAGkFaA6RgAoQiEAxLFRrNEmfFsX1+sr3HcwY1hf09XIOLxSAcq/DFEpe2r63rJ0BSrD1Be4z+Dwi937Kc/OeEIRQFWZE3rMtmVp+T8DR5V3LRa0vAnKqvXMUi61soY45BA4lmbbFt86FXzKjFOKmjXD4XOaAWCUzeTMklAGphqHNWcwcgCIR+1BNpLWvTf219/gU4JjD74/CX094u6lUlp8ghJhBPG4Qm00sfQAPztYEHfIb/Dikg8pWEteghiRDeQqrdlA+tKeHc8UIk/3ugwn9xv2QTUEDmd8Lo59MRl80oyj8vtmBGq0ZhCKURsIshtDSEh+dy66UxRdUNZjYAS3wS2mc821NGK0f3xsZNlgaaL9T/BJwUl51krKo+IJo0NQaWdlxHm1WMzRD0Ww77Jqr+QFCLJ64EBMic/g1E3WTMqRJ3BQFnCODLi2yVwTmoEQZvG7BzZApvrOSxHXROG40v4HMG7yNeo8I7aHEpY9cHhBgzd8Qsbp2UNBiNEOKG+oGwrHCPuJGTW23A7rTynqCf4lzOwEiI5wjqTWy5G9C/dY53IaxztYCxLN5vIEj74IWhzffzjSpoZPAK9aM3QTgNuULBU4InTn6/p51eLh5FxrLQjvcH4ztUaGpos3Vvyuj9vh+rzh4QmpAvRWz6novEnBa1KHcxHBN7z7CvP66GXDnGzxYErOl41gnHuuRwKygxacfHM9tEz8biz8eAfAOepqSaOoQZu7Kwz1CtyV8fpF9jAH72iDTSHeh2DNDK61QeRivxPg+2x1cJAlFTgh483N8Kak/L4QigPA5Z6tgv1fMRKMHReipLfbDY7+8RQE13qX2DWbYsmI22hqAznPDIzPYkvMdfPsiTsGsxCmD5TgFA1oV0N71XypchI4W28vAaEqFZR5AFVOVbvc61KBd5nVvr6nzxc1l28dvAL/F0o66oAJLrZUh1XjTcGjMQ7ExBLPcGeh3ozkx94LPtFA8hhRnm5/9VB/OyHrk06jwxaAGpQ73qljFxgy/gZN22TBlCSCsAAAAABJRU5ErkJggg=="
  )
);
logo.size = new Size(16, 16);

const colors = {
  bg: "#08091b",
  green: config.runsInAccessoryWidget ? "#ffffff" : "#0fde8d",
  red: config.runsInAccessoryWidget ? "#ffffff" : "#ff506a",
  text: "#ffffff",
  secondaryText: config.runsInAccessoryWidget ? "#ffffff" : "#a0a3c4",
};

/**
 * @param {string} name
 * @returns {string}
 */
function reformatMarketName(name) {
  return name.split("[")[0].trim();
}

/**
 * @param {string} name
 * @returns {string}
 */
function getPoolNameFromMarketName(name) {
  return name.replace(/^.*\[/, "").replace(/\]$/, "");
}

/**
 * @param {string} name
 * @returns {string}
 */
function getIndexTokenFromMarketName(name) {
  return name.split("/")[0];
}

/**
 * @param {string} account
 * @returns {Promise<Position[]>}
 */
async function fetchPositionsForAccount(account) {
  const request = new Request(
    "https://gmx.squids.live/gmx-synthetics-arbitrum:prod/api/graphql"
  );

  const query = /* gql */ `
    query ($account: String!, $limit: Int!) {
      positions(
        where: {account_eq: $account, isSnapshot_eq: false},
        orderBy: unrealizedPnl_DESC,
        limit: $limit
      ) {
        id
        sizeInUsd
        market
        unrealizedPnl
        unrealizedFees
        isLong
      }
    }`;

  const bodyString = JSON.stringify({
    query,
    variables: {
      account,
      limit: isAccessoryCircular ? 1 : 7,
    },
  });

  request.headers = {
    "Content-Type": "application/json",
  };
  request.body = bodyString;
  request.method = "POST";

  console.log("Sending request...");
  const response = await request.loadJSON();

  // convert pnl

  const positions = response.data.positions.map((position) => ({
    ...position,
    pnl:
      Number(
        (BigInt(position.unrealizedPnl) - BigInt(position.unrealizedFees)) /
          ALMOST_PRECISION
      ) / 100,
  }));

  return positions;
}

/**
 * @returns {Promise<Market[]>}
 */
async function fetchMarets() {
  const request = new Request("https://arbitrum-api.gmxinfra.io/markets");
  const response = await request.loadJSON();
  return response.markets;
}

/**
 * @param {ListWidget} widget
 * @returns {Promise<ListWidget>}
 */
async function fetchData(widget) {
  try {
    const account =
      args.widgetParameter ?? "0x8918F029ce357837294D71B2270eD403aac0eEc8";

    if (!account) {
      throw new Error("No account provided");
    }

    const [positions, markets] = await Promise.all([
      fetchPositionsForAccount(account),
      fetchMarets(),
    ]);

    const vStack = widget.addStack();
    vStack.layoutVertically();

    for (const position of positions) {
      const horizontalStack = vStack.addStack();
      horizontalStack.layoutHorizontally();
      horizontalStack.centerAlignContent();
      const market = markets.find((m) => m.marketToken === position.market);

      horizontalStack.url = `https://metamask.app.link/dapp/https://app.gmx.io/#/trade/${
        position.isLong ? "long" : "short"
      }?pool=${getPoolNameFromMarketName(
        market.name
      )}&to=${getIndexTokenFromMarketName(market.name)}&mode=market`;

      const sign = position.pnl > 0 ? "+" : "-";
      const pnl = Math.abs(position.pnl);

      const string = `${sign}$${pnl.toFixed(2)} `;
      const pnlText = horizontalStack.addText(string);

      pnlText.font = Font.regularSystemFont(14);
      if (position.pnl > 0) {
        pnlText.textColor = new Color(colors.green);
      } else {
        pnlText.textColor = new Color(colors.red);
      }

      if (!isAccessoryCircular) {
        const marketText = horizontalStack.addText(
          reformatMarketName(market.name)
        );
        marketText.font = Font.lightSystemFont(12);
        marketText.textColor = new Color(colors.secondaryText);
      }
    }

    return widget;
  } catch (error) {
    console.error(`Error occurred: ${error.message}`);
    console.error(`Error stack: ${error.stack}`);

    // Create a new widget for the error

    const errorText = widget.addText("Error: " + error.message);
    errorText.font = Font.regularSystemFont(14);
    errorText.textColor = new Color(colors.red);
    errorText.centerAlignText();

    return widget;
  }
}

const widget = new ListWidget();
const isAccessory = config.runsInAccessoryWidget;
const isAccessoryCircular = config.widgetFamily === "accessoryCircular";
if (!isAccessory) {
  widget.setPadding(8, 10, 8, 10);
  widget.backgroundColor = new Color(colors.bg);
}

const image = widget.addImage(logo);
image.imageSize = new Size(16, 16);

// Execute the request
fetchData(widget).then((widget) => {
  if (!isAccessoryCircular) {
    widget.addSpacer();
  }
  if (config.runsInWidget) {
    Script.setWidget(widget);
  } else {
    widget.presentAccessoryCircular();
  }
  Script.complete();
});
