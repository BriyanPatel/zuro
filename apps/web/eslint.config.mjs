import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

const config = [
  ...nextCoreWebVitals,
  {
    rules: {
      "react/no-unescaped-entities": "off",
      "react/jsx-no-comment-textnodes": "off",
      "@next/next/no-html-link-for-pages": "off",
    },
  },
  {
    ignores: ["public/registry/**"],
  },
];

export default config;
