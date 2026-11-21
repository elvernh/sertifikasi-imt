import bcrypt from "bcryptjs";
import { describe, expect, it } from "vitest";
import { User } from "@/models/user";

function makeTenant(passwordHash = "x"): User {
  return new User(1, "3171234567890001", "Budi", "0812", "budi@mail.test", passwordHash, "TENANT", "PENDING");
}

describe("User", () => {
  it("UT-24 a new tenant is not approved until the admin approves", () => {
    const user = makeTenant();
    expect(user.isApproved()).toBe(false);
    user.approve();
    expect(user.isApproved()).toBe(true);
    expect(user.status).toBe("APPROVED");
  });

  it("UT-25 a rejected tenant is not approved", () => {
    const user = makeTenant();
    user.reject();
    expect(user.isApproved()).toBe(false);
    expect(user.status).toBe("REJECTED");
  });

  it("UT-26 checkPassword accepts the right password and rejects a wrong one", async () => {
    const user = makeTenant(await bcrypt.hash("rahasia123", 4));
    expect(await user.checkPassword("rahasia123")).toBe(true);
    expect(await user.checkPassword("salah")).toBe(false);
  });

  it("UT-27 isAdmin is true only for the ADMIN role", () => {
    const admin = new User(2, "0000000000000000", "Admin", "0", "a@mail.test", "x", "ADMIN", "APPROVED");
    expect(admin.isAdmin()).toBe(true);
    expect(makeTenant().isAdmin()).toBe(false);
  });
});
