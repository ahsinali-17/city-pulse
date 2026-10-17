"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema/users";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export interface ActionResponse {
  success: boolean;
  message?: string;
  error?: string;
}

/**
 * Updates user display name and avatar URL
 */
export async function updateProfile(formData: {
  name: string;
  avatarUrl: string;
}): Promise<ActionResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized. Please sign in to update your profile." };
    }

    const trimmedName = formData.name?.trim();
    if (!trimmedName || trimmedName.length < 2) {
      return { success: false, error: "Display name must be at least 2 characters long." };
    }

    if (trimmedName.length > 70) {
      return { success: false, error: "Display name cannot exceed 70 characters." };
    }

    const trimmedAvatar = formData.avatarUrl?.trim() || null;
    if (trimmedAvatar && trimmedAvatar.length > 500) {
      return { success: false, error: "Avatar URL is too long." };
    }

    await db
      .update(users)
      .set({
        name: trimmedName,
        avatarUrl: trimmedAvatar,
      })
      .where(eq(users.id, session.user.id));

    revalidatePath("/profile");
    revalidatePath("/", "layout");

    return {
      success: true,
      message: "Profile details updated successfully.",
    };
  } catch (error) {
    console.error("[UPDATE_PROFILE_ERROR]", error);
    return {
      success: false,
      error: "Failed to update profile. Please try again.",
    };
  }
}

/**
 * Updates user password with verification of current password
 */
export async function updatePassword(formData: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}): Promise<ActionResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized. Please sign in to change your password." };
    }

    const { currentPassword, newPassword, confirmPassword } = formData;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return { success: false, error: "All password fields are required." };
    }

    if (newPassword.length < 6) {
      return { success: false, error: "New password must be at least 6 characters long." };
    }

    if (newPassword !== confirmPassword) {
      return { success: false, error: "New passwords do not match." };
    }

    // Fetch existing user to verify password hash
    const userArray = await db
      .select({ passwordHash: users.passwordHash })
      .from(users)
      .where(eq(users.id, session.user.id));

    const user = userArray[0];
    if (!user) {
      return { success: false, error: "User account not found." };
    }

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      return { success: false, error: "Incorrect current password." };
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 12);

    await db
      .update(users)
      .set({
        passwordHash: newPasswordHash,
      })
      .where(eq(users.id, session.user.id));

    revalidatePath("/profile");

    return {
      success: true,
      message: "Password changed successfully.",
    };
  } catch (error) {
    console.error("[UPDATE_PASSWORD_ERROR]", error);
    return {
      success: false,
      error: "Failed to change password. Please try again.",
    };
  }
}
