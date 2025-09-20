# Media Inverter – Privacy Policy

**Last Updated:** September 20, 2025

## 1. Introduction

Media Inverter (“the Extension”) inverts or reverts colors of images, videos, and inline SVG elements via a context menu. This Privacy Policy explains how it handles data.

## 2. Data Collection and Usage

The Extension only inspects elements on the page you explicitly invoke it on. It may momentarily access:

- The DOM node you right‑clicked and its nearby ancestors/descendants
- Attributes/styles of `<img>`, `<video>`, and inline `<svg>` elements to toggle inversion

It does **not**:

- Send any data off your device
- Collect analytics or usage telemetry
- Record browsing history
- Use cookies or tracking technologies
- Share data with third parties

## 3. Data Storage

No persistent storage of page content or media references is performed. Actions occur in-memory within the active tab context.

## 4. Permissions

- `contextMenus`: Provide the right‑click inversion command
- `activeTab`: Act on the current tab after you invoke the menu item
- `scripting`: Inject or execute the content script logic (Manifest V3)
- `host_permissions: "<all_urls>"`: Enable operation on any site you choose

These are used only to locate and modify the targeted media elements’ visual appearance.

## 5. No External Communication

The Extension does not contact remote servers.

## 6. Security

All operations remain within the browser sandbox. Keeping your browser updated helps reduce general risk.

## 7. Changes

Updates to this policy will revise the “Last Updated” date.

## 8. Contact

Questions or concerns:  
GitHub Issues: <https://github.com/johngibbs/MediaInverter/issues>

---
*Effective as of September 20, 2025.*
