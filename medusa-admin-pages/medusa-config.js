module.exports = {
  projectConfig: {
    database_url: "postgres://localhost/medusa",
    database_type: "postgres",
    http: {
      jwtSecret: "test",
      cookieSecret: "test"
    }
  },
  admin: {
    disable: false
  }
}
