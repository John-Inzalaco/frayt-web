// Overrides create-react-app webpack configs without ejecting
// https://github.com/timarney/react-app-rewired

const { addBabelPlugins, override } = require('customize-cra');

const overrides = [];

if (process.env.NODE_ENV !== 'production') {
  overrides.concat(
    ...addBabelPlugins(['babel-plugin-typescript-to-proptypes'])
  );
}

module.exports = override(overrides);
