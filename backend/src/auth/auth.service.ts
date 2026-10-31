import { AppError } from "../lib/appError.js";
import { prisma } from "../lib/prisma.js";
import { BloodType, Role } from "../generated/prisma/enums.js";

interface googleUserProfile {
  providerUserId: string;
  email: string;
  name: string;
  picture: string;
}

// find user by email
export const findUserByEmail = async (email: string) => {
  return await prisma.user.findFirst({
    where: {
      email: email,
    },
  });
};

// find user with hashedPassword
export const findUserByIdWithHashPassword = async (userId: string) => {
  const account = await prisma.oauthAccount.findUnique({
    where: {
      userId,
    },
    select: {
      passwordHash: true,
    },
  });
  return account?.passwordHash;
};

interface CreateUserExtras {
  phone?: string;
  bloodType?: BloodType;
  city?: string;
}

// create user
export const createNewUser = async (
  display_name: string,
  email: string,
  role: Role,
  hashedPassword: string,
  extras: CreateUserExtras = {},
) => {
  try {
    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          display_name: display_name,
          email: email,
          role: role,
          is_email_verified: false,
          phone: extras.phone,
          bloodType: extras.bloodType,
          city: extras.city,
        },
      });

      await tx.oauthAccount.create({
        data: {
          userId: user.id,
          provider: "PASSWORD",
          passwordHash: hashedPassword,
        },
      });

      return user;
    });

    return newUser;
  } catch (error) {
    throw new AppError(500, "Failed to create user", error);
  }
};

const createGoogleAuthUser = async (
  display_name: string,
  email: string,
  providerUserId: string,
  picture?: string,
  role: Role = "HOSPITAL",
) => {
  try {
    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          display_name: display_name,
          email: email,
          avater: picture,
          role: role,
          is_email_verified: true,
        },
      });

      await tx.oauthAccount.create({
        data: {
          userId: user.id,
          provider: "GOOGLE",
          providerUserId: providerUserId,
        },
      });

      return user;
    });

    return newUser;
  } catch (error) {
    throw new AppError(500, "Failed to create user", error);
  }
};

// update the is_email_verified field
export const update_is_email_verified = async (userId: string) => {
  try {
    return await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        is_email_verified: true,
      },
    });
  } catch (error) {
    throw new AppError(500, "Failed to update is_email_verified field", error);
  }
};

// update last_login_at
export const updateLastLogin = async (email: string) => {
  return await prisma.user.update({
    where: {
      email: email,
    },
    data: {
      last_login_at: new Date(),
    },
  });
};

// find user by phone (WhatsApp number) — used to enforce uniqueness at registration
export const findUserByPhone = async (phone: string) => {
  return await prisma.user.findFirst({
    where: {
      phone,
    },
  });
};

// find user by id
export const findUserById = async (userId: string) => {
  return await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });
};

// update users password
export const updatePassowrd = async (
  userId: string,
  hashNewPassword: string,
) => {
  return await prisma.oauthAccount.update({
    where: {
      userId,
    },
    data: {
      passwordHash: hashNewPassword,
    },
  });
};

// find or create user - google oauth
// `role` only applies when a brand-new account is created (an existing account keeps
// its own role) — web callers leave it as the default HOSPITAL, the mobile endpoint
// passes USER since that's the only role the Flutter app signs donors in as.
export const findOrCreateUser = async (
  profile: googleUserProfile,
  role: Role = "HOSPITAL",
) => {
  let isUserNew: boolean = false;
  let user = await prisma.user.findUnique({
    where: {
      email: profile.email,
    },
  });

  if (!user) {
    user = await createGoogleAuthUser(
      profile.name,
      profile.email,
      profile.providerUserId,
      profile.picture,
      role,
    );
    isUserNew = true;
  }

  return { user, isUserNew };
};

// updateing is_deleted field when user requests to delete his account
export const updateIs_deleted = async (userId: string) => {
  return await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      active: false,
      is_deleted: true,
    },
  });
};
