const path = require('path');
const pak = require('./package.json');

module.exports = function (api) {
  api.cache(true);

  return {
    presets: ['babel-preset-expo'],
    overrides: [
      {
        test: './node_modules/ethers',
        plugins: [
          ["@babel/plugin-transform-private-methods", { "loose": true }]
        ]
      }
    ],
    plugins: [
      'expo-router/babel',
      ["@babel/plugin-transform-private-methods", { "loose": true }],
      // NOTE: this is required to pass the right environment
      [
        "transform-inline-environment-variables",
        // NOTE: include is optional, you can leave this part out
        {
          include: ["TAMAGUI_TARGET", "EXPO_ROUTER_APP_ROOT"],
        },
      ],
      [
        'module-resolver',
        {
          extensions: ['.tsx', '.ts', '.js', '.json'],
          root: ["."],
        },
      ],
    ],
  };
};
