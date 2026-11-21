import { redirect } from "next/navigation";
import * as garageController from "@/controllers/garage-controller";
import * as userController from "@/controllers/user-controller";
import { getSession } from "@/lib/session";
import RentForm from "./rent-form";

// Page /tenant/rent (tenant only): the form gets every garage with its bookings
// and shows the ones that are free for the chosen period.
export default async function RentPage() {
  const session = await getSession(); // never null here: the middleware already checked it
  const user = await userController.getUser(session!.userId);
  if (!user.isApproved()) redirect("/tenant");

  const garages = await garageController.listGaragesForRentForm();
  return <RentForm garages={garages} />;
}
