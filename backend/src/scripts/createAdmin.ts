import { prisma } from '../config/prisma';
import { hashPassword } from '../utils/password';
import { UserRole, UserStatus } from '@prisma/client';

async function main() {
  const email = 'admin@omshilpijewels.com';
  const password = 'AdminPassword123!';

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    const updated = await prisma.user.update({
      where: { email },
      data: { role: UserRole.SUPER_ADMIN, status: UserStatus.ACTIVE },
    });
    console.log(`Promoted existing user ${email} to SUPER_ADMIN (ID: ${updated.id})`);
  } else {
    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        name: 'Om Shilpi Admin',
        email,
        passwordHash,
        role: UserRole.SUPER_ADMIN,
        status: UserStatus.ACTIVE,
      },
    });
    console.log(`Created Super Admin user ${email} (ID: ${user.id})`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
