import { prisma } from "../lib/prisma.js";
import { ADMIN_PERMISSIONS } from "../lib/permissions.js";

/**
 * Bootstrap the first superadmin (and any additional ones) from the command line.
 *
 * Usage:
 *   npx tsx src/scripts/grantSuperadmin.ts person@example.com
 *
 * The account must already exist with the ADMIN role. The script promotes it
 * and grants every permission. This is intentionally the only way to create
 * the very first superadmin — the API cannot promote an account that isn't
 * already controlled by a superadmin.
 */
const email = process.argv[2]?.trim();

if (!email) {
  console.error("Usage: npx tsx src/scripts/grantSuperadmin.ts <admin-email>");
  process.exitCode = 1;
} else {
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    console.error(`No account found for ${email}.`);
    process.exitCode = 1;
  } else if (user.role !== "ADMIN") {
    console.error(
      `${email} has role ${user.role}. Promote it to ADMIN before granting superadmin access.`,
    );
    process.exitCode = 1;
  } else {
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { isSuperAdmin: true, permissions: ADMIN_PERMISSIONS },
      select: { id: true, email: true, display_name: true, isSuperAdmin: true, permissions: true },
    });

    console.log(
      `Granted superadmin access to ${updated.display_name} <${updated.email}> (${updated.permissions.length} permissions).`,
    );
  }
}

await prisma.$disconnect();
