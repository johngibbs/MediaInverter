// content.js - Finds and toggles nearby <img>/<video>/<svg> elements relative to the right-click target.
// If the right-click target itself is an <img>, <video>, or inline <svg>, only that element is toggled.

(() => {
  let lastRightClickedNode = null;

  const INVERT_FILTER_DECLARATION = "filter:invert(1) hue-rotate(180deg);";
  const INVERT_FILTER_STYLE_SEGMENT = ";" + INVERT_FILTER_DECLARATION;

  chrome.runtime.onMessage.addListener((message) => {
    if (!message || message.command !== "toggle-invert") return;
    if (!lastRightClickedNode || !document.contains(lastRightClickedNode)) return;

    const mediaElements = findNearbyMediaElements(lastRightClickedNode);
    if (mediaElements.length > 0) {
      toggleMediaElements(mediaElements);
    }
  });

  window.addEventListener(
    "contextmenu",
    (event) => {
      lastRightClickedNode = event.target;
    },
    { capture: true }
  );

  const domMutationObserver = new MutationObserver(() => {
    if (lastRightClickedNode && !document.contains(lastRightClickedNode)) {
      lastRightClickedNode = null;
    }
  });
  domMutationObserver.observe(document.documentElement, { childList: true, subtree: true });

  // Toggles each provided media element independently.
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
      maxAncestorLevels = 5,
      maxDescendantDepth = 15,
      maxNodesVisited = 2500,
      maxMediaPerResult = 20
    } = options;

    // Include inline SVG root elements. Normalize tag names to handle SVG case-sensitivity.
    const mediaTagNames = new Set(["IMG", "VIDEO", "SVG"]);
    const isMedia = (n) => {
      if (!(n instanceof Element)) return false;
      const name = (n.tagName || n.nodeName || "").toUpperCase();
      return mediaTagNames.has(name);
    };

    if (isMedia(startNode)) {
      return [startNode];
    }

    let nodesVisited = 0;

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

    let current = startNode;
    let level = 0;
    while (current && level <= maxAncestorLevels && nodesVisited <= maxNodesVisited) {
      // If we come across a media element while going up the ancestors, return it immediately.
      //  This is needed for elements like SVG which may contain many child elements. Usually, when
      //  you right-click on a part of an inline SVG it will actually be a child element of the SVG.
      if (isMedia(current)) {
        return [current];
      }
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
      current = current.parentElement;
      level++;
    }

    return [];
  }
})();
