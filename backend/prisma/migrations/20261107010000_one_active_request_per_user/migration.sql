-- Existing data may contain multiple active requests for one requester.
-- Keep the newest active request and close older duplicates before adding the
-- constraint. No request row is deleted.
WITH ranked_active_requests AS (
  SELECT
    "id",
    ROW_NUMBER() OVER (
      PARTITION BY "requesterId"
      ORDER BY "createdAt" DESC, "id" DESC
    ) AS row_number
  FROM "BloodRequest"
  WHERE "status" IN ('PENDING'::"RequestStatus", 'APPROVED'::"RequestStatus")
)
UPDATE "BloodRequest" AS request
SET
  "status" = 'CANCELLED'::"RequestStatus",
  "rejectionReason" = COALESCE("rejectionReason", 'Older duplicate active request closed automatically.'),
  "updatedAt" = CURRENT_TIMESTAMP
FROM ranked_active_requests AS duplicate
WHERE request."id" = duplicate."id"
  AND duplicate.row_number > 1;

CREATE UNIQUE INDEX "BloodRequest_one_active_per_requester"
ON "BloodRequest" ("requesterId")
WHERE "status" IN ('PENDING'::"RequestStatus", 'APPROVED'::"RequestStatus");
