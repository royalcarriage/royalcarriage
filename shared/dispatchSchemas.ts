export const dispatchSchemas = {
  trips: {
    tripId: { type: "string", required: true, unique: true }, // Could be auto-generated or external ID
    pickupDateTime: { type: "timestamp", required: true },
    dropoffDateTime: { type: "timestamp" },
    pickupAddress: { type: "string", required: true },
    dropoffAddress: { type: "string", required: true },
    driverId: { type: "string", optional: true }, // Link to driver profile
    vehicleId: { type: "string", optional: true }, // Link to vehicle
    customerId: { type: "string", required: true }, // Link to customer data if separate
    tripStatus: {
      type: "string",
      required: true,
      enum: [
        "scheduled",
        "assigned",
        "en_route_pickup",
        "arrived_pickup",
        "en_route_dropoff",
        "completed",
        "cancelled",
        "no_show",
      ],
    },
    notes: { type: "string", optional: true },
    fare: { type: "number" },
    paymentStatus: { type: "string", enum: ["pending", "paid", "failed"] },
    createdAt: { type: "timestamp", required: true },
    updatedAt: { type: "timestamp" },
  },
  assignments: {
    tripId: { type: "string", required: true }, // Link to trip
    driverId: { type: "string", required: true }, // Link to driver
    vehicleId: { type: "string", required: true }, // Link to vehicle
    assignmentDateTime: { type: "timestamp", required: true },
    status: {
      type: "string",
      required: true,
      enum: [
        "pending",
        "accepted",
        "declined",
        "en_route",
        "completed",
        "cancelled",
      ],
    },
    driverNotes: { type: "string", optional: true },
    dispatchNotes: { type: "string", optional: true },
  },
  // Status workflow is more about logic than schema, but could have a history log
  tripStatusHistory: {
    tripId: { type: "string", required: true },
    status: {
      type: "string",
      required: true,
      enum: [
        "scheduled",
        "assigned",
        "en_route_pickup",
        "arrived_pickup",
        "en_route_dropoff",
        "completed",
        "cancelled",
        "no_show",
      ],
    },
    timestamp: { type: "timestamp", required: true },
    userId: { type: "string" }, // Who made the status change
    notes: { type: "string", optional: true },
  },
  // Comms could be a separate collection, or integrated into trip/assignment notes
};
