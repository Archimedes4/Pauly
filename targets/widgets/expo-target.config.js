/** @type {import('@bacons/apple-targets').Config} */
module.exports = {
  type: "widget",
  entitlements: {
    "com.apple.security.keychain-access-groups": ["$(AppIdentifierPrefix)com.microsoft.adalcache"],
  },
  widgetBackgroundColor: "#DB739C",
  accentColor: "#F09458",
};