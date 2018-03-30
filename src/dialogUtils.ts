import dialogPolyfill from "dialog-polyfill";

const dialog = document.createElement("dialog") as HTMLDialogElement;
const textArea = document.createElement("textarea");
const closeLink = document.createElement("a");
const header = document.createElement("header");
header.appendChild(closeLink);
closeLink.textContent = "X";
closeLink.href = "#";
closeLink.classList.add("close-link");
dialog.appendChild(header);
dialog.appendChild(textArea);
document.body.appendChild(dialog);

dialogPolyfill.registerDialog(dialog);

closeLink.addEventListener("click", ev => {
  dialog.close();
  ev.preventDefault();
});

/**
 * Shows the dialog with the given text in a text area.
 * @param data Data to be shown in the dialog's text area.
 */
export function showDataInDialog(data: string) {
  textArea.textContent = data;
  dialog.showModal();
}

function parseDataUrl(dataUrl: string) {
  // data:[<mediatype>][;base64],<data>
  const re = /^data:([^;]+)?(?:;([^,]+))?,(.+)$/;
  const match = dataUrl.match(re);
  if (match) {
    const [mediaType, base64, data] = match.slice(1);
    let text: string;
    if (base64) {
      text = btoa(data);
    } else {
      text = decodeURIComponent(data);
    }
    return {
      mediaType,
      base64: Boolean(base64),
      data: text
    };
  } else {
    const text = dataUrl;
    return { mediaType: null, base64: null, text };
  }
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
