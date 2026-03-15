import request from "supertest"
import app from "../app.js"

describe("Login API", () => {

  it("should login successfully", async () => {

    const res = await request(app)
      .post("/api/user/login")
      .send({
        email: "test@test.com",
        password: "123456"
      })

    expect(res.statusCode).toBe(200)

  })

})