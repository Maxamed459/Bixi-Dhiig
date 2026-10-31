# Bixi-Dhiig API — Flutter quick reference

Base: `/api/v1`. All responses: `{ success, message?, data? }`. Protected routes need
`Authorization: Bearer <accessToken>`. **Mobile is the default client**: no header needed,
and the refresh token comes back in the JSON body (store it in flutter_secure_storage).
The web dashboard must send `X-Client-Type: web` to get the HttpOnly cookie instead.

## Auth
| Method | Path | Body |
|---|---|---|
| POST | /auth/register-user | display_name, email, password, **phone** (E.164, WhatsApp number), bloodType?, city? |
| POST | /auth/login | email, password |
| POST | /auth/google/mobile | idToken (from google_sign_in) |
| POST | /auth/refresh-token | refreshToken |
| POST | /auth/verify | submittedCode (emailed OTP) |
| POST | /auth/resend-code, /auth/logout, /auth/change-password, /auth/delete-account | |

bloodType: `A_POSITIVE | A_NEGATIVE | B_POSITIVE | B_NEGATIVE | AB_POSITIVE | AB_NEGATIVE | O_POSITIVE | O_NEGATIVE`

## Blood requests
| Method | Path | Who |
|---|---|---|
| POST | /blood-requests | USER (-> PENDING, needs admin) / HOSPITAL (-> APPROVED) |
| GET | /blood-requests?status&bloodType&city&urgency&page&limit | any |
| GET | /blood-requests/mine, /blood-requests/:id | any |
| PATCH | /blood-requests/:id/approve, /reject {reason?} | ADMIN |
| PATCH | /blood-requests/:id/cancel | owner or ADMIN |

Create body: patientName, bloodType, unitsNeeded, urgency (NORMAL/URGENT/CRITICAL), hospitalName, city, address?, contactPhone, notes?

## Donations
| Method | Path | Who |
|---|---|---|
| POST | /donations | USER — {bloodRequestId, unitsOffered?, notes?} |
| GET | /donations/mine | donor history |
| GET | /donations/request/:requestId | requester or ADMIN |
| PATCH | /donations/:id/status | {status: ACCEPTED/DECLINED/COMPLETED by requester/admin; CANCELLED by donor} |

Lifecycle: PENDING -> ACCEPTED -> COMPLETED (request auto-flips to FULFILLED when units are met).

## WhatsApp (WAHA) notifications
Matching donors (same bloodType + city, phone set, receiveAlerts) are alerted when a request goes live;
admins when a USER request needs approval; requester on approve/reject/pledge/fulfilled; donor on accept/complete.
Every send is recorded in `NotificationLog`.
