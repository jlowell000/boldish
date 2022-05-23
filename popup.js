// Initialize butotn with users's prefered color
let changeColor = document.getElementById("Enable_Boldish");

// When the button is clicked, inject boldish into current page
changeColor.addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: boldish,
  });
});

// The body of this function will be execuetd as a content script inside the
// current page
function boldish() {
  let elements = ['SPAN', 'DIV', 'A', 'P', 'LI'];

  getAllNodes = () => {
    let getChildren = (node) => {
      if (!!node.childNodes) {
        let cNodes = Array.from(node.childNodes)
        return cNodes.concat(cNodes.flatMap(getChildren))
      }
    }
    return getChildren(document.body)
  }

  let splitUpTextNode = (textnode, splitor) => {
    return textnode.nodeValue.split(splitor)
      .map(w => w.replaceAll('\n', ''))
      .filter(w => w.length > 0)
      .flatMap(w => {
        let half = Math.floor(w.length / 2) + (w.length % 2 === 0 ? 0 : 1)
        let bold = document.createElement('strong')
        bold.innerText = w.substr(0, half)

        return [bold, w.substr(half) + splitor]
      });
  }

  getAllNodes()
    // make sure there are text nodes to work with  
    .filter(c => c.nodeType === Node.TEXT_NODE)
    // Limit to the defined tags
    .filter(n => elements.includes(n.parentElement.tagName))
    .forEach(n => n.replaceWith(...splitUpTextNode(n, ' ')))
}
