import tseslint from 'typescript-eslint';
import reactHooks from 'eslint-plugin-react-hooks';

// Regra do projeto (AGENTS.md): TypeScript sem `any`.
export default tseslint.config(
  { ignores: ['dist'] },
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.{ts,tsx}'],
    plugins: { 'react-hooks': reactHooks },
    rules: {
      ...reactHooks.configs.recommended.rules,
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
);
