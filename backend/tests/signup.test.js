import request from "supertest"
import app from "../app.js"

describe("Signup API", () => {

  it("should create user", async () => {

    const res = await request(app)
      .post("/api/user/register")
      .send({
        name: "testuser",
        email: "test@test.com",
        password: "123456"
      })

    expect(res.statusCode).toBe(200)

  })

})