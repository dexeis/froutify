//Some (most of) parts of this code are unshamely copied from
//the original Proutify extension (uncommited on github) https://addons.mozilla.org/fr/firefox/addon/proutify/
//and are so under whatever license

// Some parts of this code are unshamely copied from
// Mozilla's Bitch to Boss extension: https://addons.mozilla.org/fr/firefox/addon/b-itch-to-boss/
// and are so under MPL 2.0

// throttling global variables
let replaceWait = false;
let replaceWaitTime = 250; // quarter of a second
let replaceQueue = [];

// List of strings to froutify
const frouts = {
  "\\bministre": "minifrout", // Does not froutify other words than "ministre"
  "agnès pannier-runacher": "agnès froutier-runacher",
  "alain soral": "alain froutal",
  "amélie de montchalin": "amélie de froutalin",
  "barbara pompili": "barbara froutili",
  "bashar al-assad":"bashar al-asfrout",
  "boris": "beaufrout",
  "bruno le maire": "bruno le frout",
  "bruno lemaire": "bruno le frout",
  "castaner": "castafrout",
  "cedric o": "cédric frout",
  "cédric o": "cédric frout",
  "christian estrosi": "christian estrofrout",
  "confinement":"confifrout",
  "coronavirus":"coronafroutus",
  "covid":"cofrout",
  "d'olivier véran": "de froutivier véran",
  "darmanin": "darmafrout",
  "david rachline": "david froutline",
  "député": "défrouté",
  "edwige diaz": "edwige frout",
  "elisabeth borne": "élisabeth frout",
  "élisabeth borne": "élisabeth frout",
  "emmanuelle wargon": "emmanuelle frouton",
  "erdogan":"erdofrout",
  "erdoğan":"erdofrout",
  "éric ciotti": "éric froutti",
  "éric dupond-moretti": "éric dufrout-moretti",
  "finkielkraut": "finkielfrout",
  "florence parly": "florence froutly",
  "florian philippot": "floriant philifrout",
  "franck riester": "franck prouster",
  "frederique vidal": "frédérique froutal",
  "frédérique vidal": "frédérique froutal",
  "gabriel attal": "gabriel frouttal",
  "gazprom":"gazfrout",
  "geneviève darrieussecq": "geneviève dufroutsecq",
  "geoffroy roux de bézieux": "geoffroy frout de bézieux",
  "grégoire de fournas": "grégoire de fourfrout",
  "hélène laporte": "hélène lafrout",
  "jair bolsonaro": "jair bolsonafrout",
  "jean castex": "jean froutex",
  "jean yves le drian": "jean-frout le drian",
  "jean-baptiste djebbari": "jean-baptiste djefrouti",
  "jean-françois copé": "jean-françois frouté",
  "jean-luc melenchon": "jean-frout melenvulve",
  "jean-luc mélenchon": "jean-vulve mélenfrout",
  "jean-michel blanquer": "jean-michel blanc-frout",
  "jordan bardella": "jordan froutella",
  "julien sanchez": "julien sanfrout",
  "le pen": "le frout",
  "louis aliot": "louis froutiot",
  "macron": "mafrout",
  "marlène schiappa": "marlène schiafrout",
  "mélenchon": "mélenfrout",
  "nicolas sarkozy": "nicofrout sarkozy",
  "olivier dussopt": "olivier dufrout",
  "olivier véran": "froutivier véran",
  "plan de relance": "frout de relance",
  "poutine":"froutine",
  "président": "froutident",
  "protocole sanitaire": "froutocole sanitaire",
  "matignon": "froutignon",
  "roselyne bachelot": "froutelyne bachelot",
  "sébastien chenu": "sébastien chefrout",
  "sébastion lecornu": "sébastien lefroutu",
  "sénateur": "sénafrout",
  "sergueï lavrov":"sergueï lavfrout",
  "zemmour": "zefrout",
};

// Join frouts in a regex
let regexString = "";
for (let key in frouts) {
  regexString += key + '|';
}
regexString = regexString.slice(0, -1); // Remove trailing pipe

const regex = new RegExp(regexString, "gi");

// Use case insensitive replacer
const replacer = (match) => {
  const delimiter = /([\s-]+)/;
  const index = match.toLowerCase() !== "ministre" ? match.toLowerCase() : "\\bministre";
  let needleWords = match.split(delimiter);
  var haystackWords = frouts[index].split(delimiter);

  // Capitalize and transform to UpperCase when needed
  for (let i = 0; i < needleWords.length; i++) {
    if (needleWords[i] === needleWords[i].toUpperCase()) { // whole word in UpperCase
      haystackWords[i] = haystackWords[i].toUpperCase();
    } else if (needleWords[i][0] === needleWords[i][0].toUpperCase()) { // Capitalize
      haystackWords[i] = haystackWords[i][0].toUpperCase() + haystackWords[i].slice(1);
    }
  }

  return haystackWords.join("");
};

function processQueue() {
  // clone queue
  let queue = replaceQueue.slice(0);
  // empty queue
  replaceQueue = [];
  // loop through clone
  queue.forEach( (mutations) => {
    replaceNodes(mutations);
  });
}

function setWait() {
  replaceWait = true;
  setTimeout(function () {
    replaceWait = false;
    timerCallback();
  }, replaceWaitTime);
}

function timerCallback() {
  if(replaceQueue.length > 0) {
    // if there are queued items, process them
    processQueue();
    // then set wait to do next batch
    setWait();
  } else {
    // if the queue has been empty for a full timer cycle
    // remove the wait time to process the next action
    replaceWait = false;
  }
}

// The callback used for the document body and title observers
function observerCallback(mutations) {
  // add to queue
  replaceQueue.push(mutations);
  if(!replaceWait) {
    processQueue();
    setWait();
  } // else the queue will be processed when the timer finishes
}

const replaceText = (v) => {
  v = v.replace(regex, replacer)
  return v
}
const handleText = (textNode) => {
  textNode.nodeValue = replaceText(textNode.nodeValue);
}

// Returns true if a node should *not* be altered in any way
const forbiddenTagNames = ['textarea', 'input', 'script', 'noscript', 'template', 'style'];
function isForbiddenNode(node) {
  if (node.isContentEditable) {
    return true;
  } else if (node.parentNode && node.parentNode.isContentEditable) {
    return true;
  } else {
    return forbiddenTagNames.includes(node.tagName.toLowerCase());
  }
}

// The callback used for the document body and head observers
const replaceNodes = (mutations) => {
  let i, node;

  mutations.forEach(function(mutation) {
    for (i = 0; i < mutation.addedNodes.length; i++) {
      node = mutation.addedNodes[i];
      if (isForbiddenNode(node)) {
        // Should never operate on user-editable content
        continue;
      } else if (node.nodeType === 3) {
        // Replace the text for text nodes
        handleText(node);
      } else {
        // Otherwise, find text nodes within the given node and replace text
        walk(node);
      }
    }
  });
}

const walk = (rootNode) => {
  // Find all the text nodes in rootNode
  let walker = document.createTreeWalker(
          rootNode,
          NodeFilter.SHOW_TEXT,
          {
            acceptNode: function(node) {
              return /^(STYLE|SCRIPT)$/.test(node.parentElement.tagName) || /^\s*$/.test(node.data) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
            }
          },
          false
      ),
      node;

  // Modify each text node's value
  while (node = walker.nextNode()) {
    handleText(node);
  }
}

// Walk the doc (document) body, replace the title, and observe the body and head
const walkAndObserve = (doc) => {
  let docHead = doc.getElementsByTagName('head')[0]
  let observerConfig = {
    characterData: true,
    childList: true,
    subtree: true
  }
  let bodyObserver
  let headObserver

  // Do the initial text replacements in the document body and title
  walk(doc.body);
  doc.title = replaceText(doc.title);

  // Observe the body so that we replace text in any added/modified nodes
  bodyObserver = new MutationObserver(observerCallback);
  bodyObserver.observe(doc.body, observerConfig);

  // Observe the title so we can handle any modifications there
  if (docHead) {
    headObserver = new MutationObserver(observerCallback);
    headObserver.observe(docHead, observerConfig);
  }
}

walkAndObserve(document)
