# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e5]:
    - generic [ref=e7]:
      - img
    - generic [ref=e10]:
      - heading "Welcome to Medusa" [level=1] [ref=e11]
      - paragraph [ref=e12]: Sign in to access the account area
    - generic [ref=e14]:
      - generic [ref=e15]:
        - textbox "Email" [ref=e18]
        - generic [ref=e20]:
          - textbox [ref=e21]:
            - /placeholder: Password
          - button "Show password" [ref=e23] [cursor=pointer]:
            - generic [ref=e24]: Show password
            - img [ref=e25]
      - button "Continue with Email" [ref=e30] [cursor=pointer]
    - generic [ref=e31]:
      - generic [ref=e32]:
        - text: Forgot password? -
        - link "Reset" [ref=e33]:
          - /url: /reset-password
      - generic [ref=e34]:
        - text: Pas encore de compte ?
        - link "Créer un compte" [ref=e35]:
          - /url: /register
  - region "Notifications alt+T"
```