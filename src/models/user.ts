// A user of the app: an admin or a tenant (penyewa).
import bcrypt from "bcryptjs";
import type { Role, UserStatus } from "./types";

export class User {
  constructor(
    readonly id: number,
    readonly nik: string,
    readonly fullName: string,
    readonly phone: string,
    readonly email: string,
    private passwordHash: string,
    readonly role: Role,
    public status: UserStatus,
  ) {}

  isAdmin(): boolean {
    return this.role === "ADMIN";
  }

  /** Tenants can only rent after the admin approves them. */
  isApproved(): boolean {
    return this.status === "APPROVED";
  }

  /** Compares the typed password with the saved hash. */
  checkPassword(plain: string): Promise<boolean> {
    return bcrypt.compare(plain, this.passwordHash);
  }

  approve(): void {
    this.status = "APPROVED";
  }

  reject(): void {
    this.status = "REJECTED";
  }
}
