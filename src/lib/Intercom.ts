export default function Intercom(
  action: keyof Intercom_.IntercomCommandSignature,
  options?: Intercom_.IntercomSettings
) {
  if (window.Intercom) {
    window.Intercom(action, options);
  }
}
