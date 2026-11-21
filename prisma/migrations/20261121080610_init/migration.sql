-- CreateTable
CREATE TABLE "Users" (
    "user_id" SERIAL NOT NULL,
    "nik" VARCHAR(16) NOT NULL,
    "full_name" VARCHAR(50) NOT NULL,
    "phone" VARCHAR(15) NOT NULL,
    "email" VARCHAR(50) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "role" VARCHAR(10) NOT NULL,
    "status" VARCHAR(10) NOT NULL,

    CONSTRAINT "Users_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "Vehicles" (
    "vehicle_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "type" VARCHAR(15) NOT NULL,
    "plate_number" VARCHAR(15),
    "brand_model" VARCHAR(50) NOT NULL,
    "battery_kwh" INTEGER,

    CONSTRAINT "Vehicles_pkey" PRIMARY KEY ("vehicle_id")
);

-- CreateTable
CREATE TABLE "Garages" (
    "garage_id" VARCHAR(4) NOT NULL,
    "type" VARCHAR(15) NOT NULL,
    "daily_price" INTEGER NOT NULL,
    "kwh_price" INTEGER,
    "status" VARCHAR(10) NOT NULL,

    CONSTRAINT "Garages_pkey" PRIMARY KEY ("garage_id")
);

-- CreateTable
CREATE TABLE "Rentals" (
    "rental_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "vehicle_id" INTEGER NOT NULL,
    "garage_id" VARCHAR(4) NOT NULL,
    "rental_type" VARCHAR(10) NOT NULL,
    "days" INTEGER,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "rental_cost" INTEGER NOT NULL,
    "charging_cost" INTEGER NOT NULL,
    "total_cost" INTEGER NOT NULL,
    "payment_proof_url" VARCHAR(255) NOT NULL,

    CONSTRAINT "Rentals_pkey" PRIMARY KEY ("rental_id")
);

-- CreateTable
CREATE TABLE "RentalExtensions" (
    "extension_id" SERIAL NOT NULL,
    "rental_id" INTEGER NOT NULL,
    "old_end_date" DATE NOT NULL,
    "new_end_date" DATE NOT NULL,
    "amount_due" INTEGER NOT NULL,
    "payment_proof_url" VARCHAR(255) NOT NULL,

    CONSTRAINT "RentalExtensions_pkey" PRIMARY KEY ("extension_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Users_nik_key" ON "Users"("nik");

-- CreateIndex
CREATE UNIQUE INDEX "Users_email_key" ON "Users"("email");

-- AddForeignKey
ALTER TABLE "Vehicles" ADD CONSTRAINT "Vehicles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rentals" ADD CONSTRAINT "Rentals_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "Users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rentals" ADD CONSTRAINT "Rentals_vehicle_id_fkey" FOREIGN KEY ("vehicle_id") REFERENCES "Vehicles"("vehicle_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rentals" ADD CONSTRAINT "Rentals_garage_id_fkey" FOREIGN KEY ("garage_id") REFERENCES "Garages"("garage_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RentalExtensions" ADD CONSTRAINT "RentalExtensions_rental_id_fkey" FOREIGN KEY ("rental_id") REFERENCES "Rentals"("rental_id") ON DELETE RESTRICT ON UPDATE CASCADE;
