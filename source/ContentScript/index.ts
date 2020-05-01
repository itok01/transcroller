import { browser, Runtime } from "webextension-polyfill-ts";

// Recieve message
async function messageHandler(message: any, _: Runtime.MessageSender): Promise<any> {
  switch (message.type) {
    // Start to observe scroll in current page
    case "observe_scroll": {
      document.body.onscroll = (_: Event) => {
        if (document.scrollingElement) {
          // Send scroll event
          browser.runtime.sendMessage({
            type: "scroll_event",
            scrollTop: document.scrollingElement.scrollTop / document.scrollingElement.scrollHeight
          });
        }
      };
      break;
    }

    /*
    // Start to observe scroll in translate page
    case "observe_scroll_transrate": {
      if (location.href.includes("https://translate.googleusercontent.com/// translate_c")) {
        document.body.onscroll = (_: Event) => {
          if (document.scrollingElement) {
            // Send scroll event
            browser.runtime.sendMessage({
              type: "scroll_event",
              scrollTop: document.scrollingElement.scrollTop / document.scrollingElement.scrollHeight
            });
          }
        };
      }
      break;
    }
    */

    // Recieve scroll instruct
    case "scroll_instruct": {
      if (document.scrollingElement) {
        document.scrollingElement.scrollTop = message.scrollTop * document.scrollingElement.scrollHeight;
      }
      break;
    }
  }
}

// Recieve message
browser.runtime.onMessage.addListener(messageHandler);
