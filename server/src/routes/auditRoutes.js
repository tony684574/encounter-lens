const express = require("express");
const auditController = require("../controllers/auditController");
const wrapAsync = require("../utils/wrapAsync");

const router = express.Router();

router.get("/", wrapAsync(auditController.listAuditLogs));

module.exports = router;
