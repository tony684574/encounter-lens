const app = require("./app");
const { port } = require("./config/env");

app.listen(port, () => {
  console.log(`Encounter Lens API running on http://localhost:${port}`);
});
