const pool = require("../../db/pool");

async function logAudit({
  userId,
  action,
  resourceType,
  resourceId = null,
  status,
  message,
  requestPayload = null,
  responsePayload = null
}) {
  const query = `
    INSERT INTO audit_logs (
      user_id,
      action,
      resource_type,
      resource_id,
      status,
      message,
      request_payload,
      response_payload
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
  `;

  const values = [
    userId || null,
    action,
    resourceType,
    resourceId,
    status,
    message,
    requestPayload,
    responsePayload
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
}

async function listAuditLogs({ resourceType, status, limit = 50 }) {
  const clauses = [];
  const values = [];

  if (resourceType) {
    values.push(resourceType);
    clauses.push(`resource_type = $${values.length}`);
  }

  if (status) {
    values.push(status);
    clauses.push(`status = $${values.length}`);
  }

  values.push(limit);
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";

  const query = `
    SELECT
      id,
      user_id AS "userId",
      action,
      resource_type AS "resourceType",
      resource_id AS "resourceId",
      status,
      message,
      created_at AS "createdAt"
    FROM audit_logs
    ${where}
    ORDER BY created_at DESC
    LIMIT $${values.length}
  `;

  const result = await pool.query(query, values);
  return result.rows;
}

module.exports = {
  logAudit,
  listAuditLogs
};
