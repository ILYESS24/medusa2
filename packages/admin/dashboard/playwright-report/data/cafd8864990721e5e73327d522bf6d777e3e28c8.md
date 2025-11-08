# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e5]:
    - img [ref=e8]
    - generic [ref=e11]:
      - heading "Welcome to Medusa" [level=1] [ref=e12]
      - paragraph [ref=e13]: Sign in to access the account area
    - generic [ref=e15]:
      - generic [ref=e16]:
        - textbox "Email" [ref=e19]
        - generic [ref=e21]:
          - textbox [ref=e22]:
            - /placeholder: Password
          - button "Show password" [ref=e24] [cursor=pointer]:
            - generic [ref=e25]: Show password
            - img [ref=e26]
      - button "Continue with Email" [ref=e30] [cursor=pointer]
    - generic [ref=e31]:
      - generic [ref=e32]:
        - text: Forgot password? -
        - link "Reset" [ref=e33] [cursor=pointer]:
          - /url: /reset-password
      - generic [ref=e34]:
        - text: Pas encore de compte ?
        - link "Créer un compte" [ref=e35] [cursor=pointer]:
          - /url: /register
  - region "Notifications alt+T"
```