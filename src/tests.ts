/**
 * Tests the browser to see if it supports <dialog>.
 */
export function supportsDialog() {
  const dialog = document.createElement("dialog") as HTMLDialogElement;
  return !!dialog.show && !!dialog.showModal && !!dialog.close;
}
