import dialogPolyfill from "dialog-polyfill";
import { parseDataUrl } from "./conversionUtils";
import FormatError from "./FormatError";

function makeCloseableDialog() {
  // Create the dialog element and child content, then
  // add dialog element to the document body.
  // tslint:disable-next-line:no-shadowed-variable
  const dialog = document.createElement("dialog") as HTMLDialogElement;
  // tslint:disable-next-line:no-shadowed-variable
  const textArea = document.createElement("textarea");
  const closeLink = document.createElement("a");
  const header = document.createElement("header");
  header.classList.add("dialog-header");
  header.appendChild(closeLink);
  closeLink.textContent = "🗙";
  closeLink.href = "#";
  closeLink.classList.add("close-link");
  dialog.appendChild(header);
  dialog.appendChild(textArea);
  document.body.appendChild(dialog);

  // Register the dialog element with the dialog polyfill.
  dialogPolyfill.registerDialog(dialog);

  // Setup the dialog's close button functionality.
  closeLink.addEventListener("click", ev => {
    dialog.close();
    ev.preventDefault();
  });
  return { dialog, textArea };
}

const { dialog, textArea } = makeCloseableDialog();

/**
 * Shows the dialog with the given text in a text area.
 * @param data Data to be shown in the dialog's text area.
 */
export function showDataInDialog(data: string) {
  textArea.textContent = data;
  dialog.showModal();
}

/**
 * An event handler that will open the dialog and show the contents of the data URL.
 * @param this The <a> element that is being assigned an event handler
 * @param ev mouse event.
 */
export function showDialogHandler(this: HTMLAnchorElement, ev: MouseEvent) {
  const dataUrl = this.href;
  const { mediaType, base64, data } = parseDataUrl(dataUrl);

  if (data) {
    showDataInDialog(data);
  }

  ev.preventDefault();
}
