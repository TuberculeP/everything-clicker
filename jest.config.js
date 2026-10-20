module.exports = {
  testEnvironment: "node",
  roots: ["<rootDir>/server"],
  transform: {
    "^.+\\.ts$": ["ts-jest", { tsconfig: "server/tsconfig.json" }],
  },
};
