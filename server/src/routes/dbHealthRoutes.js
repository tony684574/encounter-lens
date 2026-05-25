const express = require("express");
const pool = require("../db/pool");
const wrapAsync = require("../utils/wrapAsync");

const router = express.Router();

router.get(
  "/",
  wrapAsync(async (req, res) => {
    const result = await pool.query("select now() as now");

    res.json({
      success: true,
      data: {
        status: "database-ok",
        now: result.rows[0].now
      }
    });
  })
);

module.exports = router;