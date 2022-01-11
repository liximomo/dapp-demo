module.exports = {
  presets: [["babel-preset-react-app", { runtime: "automatic" }]],
  plugins: [
    "./dev-utils/babel/babel-plugin-add-cssmodule-flag",
    [
      "./dev-utils/babel/babel-plugin-auto-import",
      {
        cn: "classnames"
      }
    ]
  ]
};
