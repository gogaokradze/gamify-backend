if (!process.env.JWT_SECRET) throw new Error("you need to provide JWT_SECRET in .env");

const config = {
  jwtSecret: process.env.JWT_SECRET || "",
};

export default config;
