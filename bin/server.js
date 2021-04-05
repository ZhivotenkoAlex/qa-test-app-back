const db = require("../model/db");
const app = require("../app");

const PORT = process.env.PORT || 3000;

db.then(() => {
  app.listen(PORT, async () => {
    console.log(`Server running. Use our API on port: ${PORT}`);
  });
}).catch((e) => {
  console.log(`Server not running. Error message: ${e.message}`);
  process.exit(1);
});
