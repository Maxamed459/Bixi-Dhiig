import { email } from "zod";
import { AppError } from "../lib/appError.js";
import { prisma } from "../lib/prisma.js";

export const findUserByEmail = async (email: string) => {
  return await prisma.user.findFirst({
    where: {
      email: email,
    },
  });
};

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

export const createNewUser = async (
  display_name: string,
  email: string,
  hashedPassword: string,
) => {
  try {
    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          display_name: display_name,
          email: email,
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

export const findUserById = async (userId: string) => {
  return await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });
};
