// content.js - Finds and toggles nearby <img>/<video>/<svg> elements relative to the right-click target.
// If the right-click target itself is an <img>, <video>, or inline <svg>, only that element is toggled.

(() => { 
  // CSS declaration and style segment used to identify the invert filter in inline styles.
  const INVERT_FILTER_DECLARATION = "filter:invert(1) hue-rotate(180deg);";
  const INVERT_FILTER_STYLE_SEGMENT = ";" + INVERT_FILTER_DECLARATION;
  
  // The last node that was right-clicked on (contextmenu event).
  let lastRightClickedNode = null;

  // Listen for messages from the background script.
  chrome.runtime.onMessage.addListener((message) => {
    if (!message || message.command !== "toggle-invert") return;
    if (!lastRightClickedNode || !document.contains(lastRightClickedNode)) return;

    const mediaElements = findNearbyMediaElements(lastRightClickedNode);
    if (mediaElements.length > 0) {
      toggleMediaElements(mediaElements);
    }
  });

  // Capture the last right-clicked node using the contextmenu event.
  window.addEventListener(
    "contextmenu",
    (event) => {
      lastRightClickedNode = event.target;
    },
    { capture: true }
  );

  // Observe DOM changes to clear out the lastRightClickedNode if it gets removed from the document.
  const domMutationObserver = new MutationObserver(() => {
    if (lastRightClickedNode && !document.contains(lastRightClickedNode)) {
      lastRightClickedNode = null;
    }
  });
  domMutationObserver.observe(document.documentElement, { childList: true, subtree: true });

  // Toggles the invert filter on each element in the array.  
  function toggleMediaElements(mediaElements) {
    mediaElements.forEach(el => {
      const style = el.getAttribute("style") || "";
      if (style.includes(INVERT_FILTER_STYLE_SEGMENT)) {
        removeInvertFilter(el);
      } else {
        addInvertFilter(el);
      }
    });
  }

  // Adds the invert filter to the element's inline style.
  function addInvertFilter(el) {
    if (!el) return;
    let style = el.getAttribute("style") || "";
    if (!style.trim().endsWith(";") && style.trim().length > 0) {
      style = style.trim() + ";";
    }
    if (!style.includes(INVERT_FILTER_STYLE_SEGMENT)) {
      style += INVERT_FILTER_STYLE_SEGMENT;
      el.setAttribute("style", style);
    }
  }

  // Removes the invert filter from the element's inline style.
  function removeInvertFilter(el) {
    if (!el) return;
    let style = el.getAttribute("style") || "";
    if (style.includes(INVERT_FILTER_STYLE_SEGMENT)) {
      style = style.replace(INVERT_FILTER_STYLE_SEGMENT, "");
      style = style.replace(/;;+/g, ";").trim();
      style = style.replace(/^;|;$/g, "");
      if (style) {
        if (!style.endsWith(";")) style += ";";
        el.setAttribute("style", style);
      } else {
        el.removeAttribute("style");
      }
    }
  }

  /**
   * Returns nearby <img>/<video>/<svg> elements relative to the start node.
   * Behavior:
   *  - If the start node is media, return it as a single-element array.
   *  - Otherwise, at each level (start node, then each ancestor up to a limit),
   *    perform a depth-limited BFS over descendants and return the first set
   *    of media elements found.
   *  - Returns an empty array if none are found.
   */
  function findNearbyMediaElements(startNode, options = {}) {
    const {
      minAncestorLevelsBeforeSearch = 2, // How many ancestor levels to ascend before searching.
      maxAncestorLevels = 5,             // How many levels of ancestors to traverse up.
      maxDescendantDepth = 15,           // How deep to search for descendants.
      maxNodesVisited = 2500,            // Maximum number of nodes to visit.
      maxMediaPerResult = 20,            // Maximum media elements to return.
    } = options;

    // Helper to identify media elements.
    const mediaTagNames = new Set(["IMG", "VIDEO", "SVG"]);
    const isMedia = (n) => {
      if (!(n instanceof Element)) return false;
      const name = (n.tagName || n.nodeName || "").toUpperCase();
      return mediaTagNames.has(name);
    };
    
    // Helper to perform BFS (breadth-first search) on descendants, to a given depth limit.
    function bfsDescendants(root, depthLimit) {
      const found = [];
      if (!(root instanceof Element)) return found;
      const queue = [{ node: root, depth: 0 }];
      while (queue.length) {
        const { node, depth } = queue.shift();
        if (nodesVisited++ > maxNodesVisited) break;
        if (!(node instanceof Element)) continue;

        if (node !== root && isMedia(node)) {
          found.push(node);
            if (found.length >= maxMediaPerResult) break;
            continue; // Don't traverse into media nodes.
        }

        if (depth < depthLimit) {
          for (const child of node.children) {
            queue.push({ node: child, depth: depth + 1 });
          }
        }
      }
      return found;
    }

    // If the start node is itself media, return it immediately.
    if (isMedia(startNode)) {
      return [startNode];
    }  

    // Otherwise, traverse up ancestors, performing BFS at each level starting at the configured
    //  minimum ancestor level.
    let current = startNode;
    let level = 0;
    let nodesVisited = 0;

    const effectiveMaxAncestorLevels = Math.max(maxAncestorLevels, minAncestorLevelsBeforeSearch);

    while (current && level <= effectiveMaxAncestorLevels && nodesVisited <= maxNodesVisited) {
      // Start searching once we've reached the minimum ancestor level, or earlier if we hit the
      //  document root element.
      const atDocumentRoot = !current.parentElement;
      if (level >= minAncestorLevelsBeforeSearch || atDocumentRoot) {
        const media = bfsDescendants(current, maxDescendantDepth);
        if (media.length > 0) {
          const unique = [];
          const seen = new Set();
          for (const el of media) {
            if (!seen.has(el)) {
              unique.push(el);
              seen.add(el);
              if (unique.length >= maxMediaPerResult) break;
            }
          }
          return unique;
        }
      }
      current = current.parentElement;
      level++;
      // If we come across a media element while going up the ancestor chain, return it immediately.
      //  This is needed for elements like SVG which may contain many child elements. Usually, when
      //  you right-click on a part of an inline SVG it will actually be a child element of the SVG.
      if (isMedia(current)) {
        return [current];
      }
    }

    return [];
  }
})();
