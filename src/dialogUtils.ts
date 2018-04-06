/**
 * This module creates the dialog that shows the exported
 * feature set data.
 */

import dialogPolyfill from "dialog-polyfill";
import { parseDataUrl } from "./conversionUtils";
import FormatError from "./FormatError";
import { supportsDialog } from "./tests";

const needsDialogPolyfill = !supportsDialog();

/**
 * Adds link to CSS file <link> to document head only if <dialog> is not supported natively.
 * @param cssPath Path to CSS file for dialog polyfill.
 * E.g., https://cdn.jsdelivr.net/npm/dialog-polyfill@0.4.9/dialog-polyfill.css
 * @param sri Optional SRI hash
 * @returns Returns the link if it was added, or null otherwise.
 */
export function addDialogPolyfillCss(cssPath: string, sri?: string) {
  if (needsDialogPolyfill) {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = cssPath;
    if (sri) {
      link.integrity = sri;
      link.crossOrigin = "anonymous";
    }
    document.head.appendChild(link);
    return link;
  }
  return null;
}

/**
 * Creates a dialog and registers it with the dialog polyfill.
 * At the top of the dialog will be a close button that will
 * dismiss the dialog.
 * @param content The content of the dialog
 */
function makeCloseableDialog(id: string, content?: HTMLElement) {
  // Create the dialog element and child content, then
  // add dialog element to the document body.
  // tslint:disable-next-line:no-shadowed-variable
  const dialog = document.createElement("dialog") as HTMLDialogElement;
  dialog.id = id;
  // tslint:disable-next-line:no-shadowed-variable

  const closeLink = document.createElement("a");
  const header = document.createElement("header");
  header.classList.add("dialog-header");
  header.appendChild(closeLink);
  closeLink.textContent = "🗙";
  closeLink.href = "#";
  closeLink.classList.add("close-link");
  dialog.appendChild(header);
  if (content) {
    dialog.appendChild(content);
  }
  document.body.appendChild(dialog);

  if (needsDialogPolyfill) {
    // Register the dialog element with the dialog polyfill.
    // When all modern browsers support the dialog element,
    // the polyfill and this registration step will no longer
    // be necessary.
    dialogPolyfill.registerDialog(dialog);
  }

  // Setup the dialog's close button functionality.
  closeLink.addEventListener("click", ev => {
    dialog.close();
    ev.preventDefault();
  });

  return dialog;
}

export function makeCloseableTextAreaDialog(id: string) {
  const textArea = document.createElement("textarea");
  textArea.readOnly = true;

  return makeCloseableDialog(id, textArea);
}

/**
 * An event handler that will open the dialog and show the contents of the data URL.
 * @param this The <a> element that is being assigned an event handler. This <a> element
 * must have a data-dialog-id attribute set to the value of a dialog element's id attribute
 * @param ev mouse event.
 */
export function showDialogHandler(this: HTMLAnchorElement, ev: MouseEvent) {
  const dataUrl = this.href;
  const { mediaType, base64, data } = parseDataUrl(dataUrl);

  if (data) {
    if (!this.dataset.dialogId) {
      console.error("Link has no dialog ID.", this);
    } else {
      const dialog = document.getElementById(
        this.dataset.dialogId!
      ) as HTMLDialogElement | null;
      if (!dialog) {
        console.error(
          `No dialog with id of "${this.dataset.dialogId} was found.`
        );
      } else {
        const textarea = dialog.querySelector("textarea");
        if (!textarea) {
          throw new Error("The dialog does not have a textarea element.");
        }
        textarea.value = data;
        dialog.showModal();
      }
    }
    // showDataInDialog(data);
  }

  ev.preventDefault();
}
