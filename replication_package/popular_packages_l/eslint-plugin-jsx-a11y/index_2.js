json
// .eslintrc.json - Configuration file for ESLint with jsx-a11y plugin
{
  "extends": [
    "eslint:recommended",
    "plugin:jsx-a11y/recommended"
  ],
  "plugins": [
    "jsx-a11y"
  ],
  "rules": {
    "jsx-a11y/alt-text": "error"
  },
  "settings": {
    "jsx-a11y": {
      "polymorphicPropName": "as",
      "components": {
        "CustomButton": "button",
        "MyLink": "a"
      },
      "attributes": {
        "for": ["htmlFor", "for"]
      }
    }
  }
}
