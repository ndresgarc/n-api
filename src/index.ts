import Express from "express";
import bodyParser from "body-parser";
import LOGGER from "./logger";

import API from "./api";

const app = Express();
const port = 8080;
const log = new LOGGER();

const api = new API();

app.use(bodyParser.json());

// Root endpoint
app.get("/", (req, res) => {
  res.send("Root endpoint");
});

// Employees list
app.get("/employees", (req: any, res: any) => {
  log.write(req.params);
  res.send(api.browse(req));
});

// Employee unique
app.get("/employees/:id", (req: any, res: any) => {
  log.write(req.params);
  res.send(api.read(req));
});

// New employee
app.post("/employees", (req: any, res: any) => {
  log.write(req.body);
  res.send(api.add(req));
});

app.listen(port, () => {
  log.write(`server started at http://localhost:${port}`);
});
