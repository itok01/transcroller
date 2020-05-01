import 'unicorn.log';
import { browser, Menus, Tabs, Runtime } from 'webextension-polyfill-ts';

// Context menu properties
const contextMenu: Menus.CreateCreatePropertiesType = {
  title: "Transcroller",
  id: "transcroller",
  type: "normal"
};

// Tab manegement
let activeTab: { [target: number]: number } = {};

// Generate translated page URL
function generateTransratedPageURL(targetURL: string, from: string, to: string): string {
  return "https://translate.google.com/translate?sl=" + from + "&tl=" + to + "&u=" + targetURL;
}

// Open translate window
async function openTranslateWindow(_: Menus.OnClickData, tab?: Tabs.Tab) {
  if (tab != undefined && tab.url != undefined && tab.id != undefined) {
    // Generate translated page URL
    const encodedCurrentPageURL = encodeURI(tab.url);
    const transratedPageURL = generateTransratedPageURL(encodedCurrentPageURL, "auto", "jp");

    // Open translate window
    const transrateWindow = await browser.windows.create({
      url: transratedPageURL,
      type: "normal"
    });

    // Link current tab and translate tab
    if (transrateWindow.tabs != undefined && transrateWindow.tabs[0].id != undefined) {
      activeTab[tab.id] = transrateWindow.tabs[0].id;
      activeTab[transrateWindow.tabs[0].id] = tab.id;
    }

    // Wait to load translate page
    let translatePageLoading = true;
    while (translatePageLoading) {
      // Sleep for 100 milliseconds
      await new Promise(r => setTimeout(r, 100));

      // Get current tab status
      const translateTab = await browser.tabs.get(activeTab[tab.id]);
      console.log(translateTab.status);
      if (translateTab.status === "complete") {
        translatePageLoading = false;
      }
    }

    // Observe current tab scroll
    await browser.tabs.sendMessage(tab.id, {
      type: "observe_scroll"
    });

    /*
    // Observe translate tab scroll
    await browser.tabs.sendMessage(activeTab[tab.id], {
      type: "observe_scroll_transrate"
    });
    */
  } else {
    alert("Invalid URL.");
  }
}

// Recieve scroll event
async function scrollEventHandler(message: any, sender: Runtime.MessageSender) {
  if (message.type === "scroll_event") {
    if (sender.tab != undefined && sender.tab.id != undefined) {
      console.log("[" + sender.tab.id + "]scroll: " + message.scrollTop);
      console.log(activeTab);
      browser.tabs.sendMessage(activeTab[sender.tab.id], {
        type: "scroll_instruct",
        scrollTop: message.scrollTop
      });
    }
  }
}

browser.runtime.onInstalled.addListener((): void => {
  // Add context menu
  browser.contextMenus.create(contextMenu);

  // Open translate window when clicked context menu
  browser.contextMenus.onClicked.addListener(openTranslateWindow);

  // Recieve scroll event
  browser.runtime.onMessage.addListener(scrollEventHandler);
});
