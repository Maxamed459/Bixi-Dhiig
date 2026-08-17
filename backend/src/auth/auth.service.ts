import { email } from "zod";
import { AppError } from "../lib/appError.js";
import { prisma } from "../lib/prisma.js";
import { Role } from "../generated/prisma/enums.js";

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

// create user
export const createNewUser = async (
  display_name: string,
  email: string,
  role: Role,
  hashedPassword: string,
) => {
  try {
    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          display_name: display_name,
          email: email,
          role: role,
          is_email_verified: false,
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
) => {
  try {
    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          display_name: display_name,
          email: email,
          avater: picture,
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
export const findOrCreateUser = async (profile: googleUserProfile) => {
  let user = await prisma.user.findUnique({
    where: {
      email: profile.email,
    },
  });

  if (!user) {
    user = await createGoogleAuthUser(
      profile.name,
      profile.email,
      profile.picture,
      profile.providerUserId,
    );
  }

  return user;
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
