import nextConfig from 'eslint-config-next';

const eslintConfig = [
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'coverage/**',
      'playwright-report/**',
      'e2e/**',
    ],
  },
  ...nextConfig,
  {
    rules: {
      // Disable strict React 19 rules that are too aggressive for common patterns
      'react-hooks/set-state-in-effect': 'off',
      // Allow purity warnings for UI components (skeleton loaders use Math.random)
      'react-hooks/purity': 'warn',
      // Allow exhaustive deps warning (useful but not blocking)
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
];

export default eslintConfig;
