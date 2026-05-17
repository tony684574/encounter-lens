const auditService = require("../services/app/auditService");

async function listAuditLogs(req, res) {
  const logs = await auditService.listAuditLogs({
    resourceType: req.query.resourceType,
    status: req.query.status,
    limit: Number(req.query.limit) || 50
  });

  res.json({
    success: true,
    data: { logs }
  });
}

module.exports = {
  listAuditLogs
};
