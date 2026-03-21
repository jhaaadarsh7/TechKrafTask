import request from "supertest";

let app: Awaited<ReturnType<typeof import("../../src/app")>>["default"];
let prisma: Awaited<ReturnType<typeof import("../../src/config/db")>>["default"];

const unique = Date.now();
const userOneEmail = `buyer1_${unique}@test.com`;
const userTwoEmail = `buyer2_${unique}@test.com`;

let userOneToken = "";
let userTwoToken = "";
let propertyId = 0;

describe("Auth + favourites integration", () => {
  beforeAll(async () => {
    process.env.JWT_SECRET = process.env.JWT_SECRET ?? "integration-test-secret";

    const appModule = await import("../../src/app");
    const dbModule = await import("../../src/config/db");

    app = appModule.default;
    prisma = dbModule.default;

    const property = await prisma.property.create({
      data: {
        title: `Integration Test Property ${unique}`,
        location: "Kathmandu",
        price: 123456,
      },
    });

    propertyId = property.id;
  });

  afterAll(async () => {
    await prisma.favourite.deleteMany({
      where: {
        OR: [{ user: { email: userOneEmail } }, { user: { email: userTwoEmail } }],
      },
    });

    await prisma.user.deleteMany({
      where: {
        email: { in: [userOneEmail, userTwoEmail] },
      },
    });

    if (propertyId) {
      await prisma.property.deleteMany({
        where: { id: propertyId },
      });
    }

    await prisma.$disconnect();
  });

  it("registers two users and returns JWT", async () => {
    const registerOne = await request(app).post("/api/auth/register").send({
      name: "Buyer One",
      email: userOneEmail,
      password: "Password123",
    });

    expect(registerOne.status).toBe(201);
    expect(registerOne.body.success).toBe(true);
    expect(registerOne.body.data.user.email).toBe(userOneEmail);
    expect(registerOne.body.data.token).toBeTruthy();

    const registerTwo = await request(app).post("/api/auth/register").send({
      name: "Buyer Two",
      email: userTwoEmail,
      password: "Password123",
    });

    expect(registerTwo.status).toBe(201);
    expect(registerTwo.body.success).toBe(true);
  });

  it("logs in and returns profile for authenticated user", async () => {
    const loginOne = await request(app).post("/api/auth/login").send({
      email: userOneEmail,
      password: "Password123",
    });

    expect(loginOne.status).toBe(200);
    expect(loginOne.body.success).toBe(true);

    userOneToken = loginOne.body.data.token;

    const me = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${userOneToken}`);

    expect(me.status).toBe(200);
    expect(me.body.success).toBe(true);
    expect(me.body.data.email).toBe(userOneEmail);
    expect(me.body.data.role).toBe("buyer");
  });

  it("allows a user to add and remove own favourite", async () => {
    const addFavourite = await request(app)
      .post(`/api/favourites/${propertyId}`)
      .set("Authorization", `Bearer ${userOneToken}`);

    expect(addFavourite.status).toBe(201);
    expect(addFavourite.body.success).toBe(true);
    expect(addFavourite.body.data.propertyId).toBe(propertyId);

    const myFavourites = await request(app)
      .get("/api/favourites")
      .set("Authorization", `Bearer ${userOneToken}`);

    expect(myFavourites.status).toBe(200);
    expect(myFavourites.body.success).toBe(true);
    expect(
      myFavourites.body.data.some((fav: { propertyId: number }) => fav.propertyId === propertyId)
    ).toBe(true);

    const removeFavourite = await request(app)
      .delete(`/api/favourites/${propertyId}`)
      .set("Authorization", `Bearer ${userOneToken}`);

    expect(removeFavourite.status).toBe(200);
    expect(removeFavourite.body.success).toBe(true);
  });

  it("prevents users from modifying another user's favourites", async () => {
    const loginTwo = await request(app).post("/api/auth/login").send({
      email: userTwoEmail,
      password: "Password123",
    });

    expect(loginTwo.status).toBe(200);
    userTwoToken = loginTwo.body.data.token;

    const userOneAddsAgain = await request(app)
      .post(`/api/favourites/${propertyId}`)
      .set("Authorization", `Bearer ${userOneToken}`);

    expect(userOneAddsAgain.status).toBe(201);

    const userTwoRemoveAttempt = await request(app)
      .delete(`/api/favourites/${propertyId}`)
      .set("Authorization", `Bearer ${userTwoToken}`);

    expect(userTwoRemoveAttempt.status).toBe(404);

    const userTwoFavourites = await request(app)
      .get("/api/favourites")
      .set("Authorization", `Bearer ${userTwoToken}`);

    expect(userTwoFavourites.status).toBe(200);
    expect(
      userTwoFavourites.body.data.some((fav: { propertyId: number }) => fav.propertyId === propertyId)
    ).toBe(false);
  });
});
