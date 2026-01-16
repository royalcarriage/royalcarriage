/**
 * Moovs CSV Parser
 * Parses Moovs booking data and stores immutably in Firebase Storage with SHA256 hash
 * Prevents duplicate imports and maintains audit trail
 */

import { Storage } from "@google-cloud/storage";
import * as crypto from "crypto";
import * as admin from "firebase-admin";

interface MoovsRow {
  tripNo: string;
  orderNo: string;
  pickupDate: string;
  pickupTime: string;
  totalAmount: number;
  baseRate: number;
  taxAmount: number;
  driverPayout: number;
  serviceType: string;
  vehicleType: string;
  pickupAddress: string;
  dropoffAddress: string;
  passengerName: string;
  passengerPhone?: string;
  passengerEmail?: string;
  reqSource?: string;
  gclid?: string;
  notes?: string;
}

interface ParseResult {
  success: boolean;
  data?: MoovsRow[];
  errors?: string[];
  rowCount: number;
  fileHash: string;
  storagePath: string;
}

export class MoovsParser {
  private storage: Storage;
  private bucket: string;

  constructor() {
    this.storage = new Storage();
    this.bucket = process.env.FIREBASE_STORAGE_BUCKET || "royalcarriage-imports";
  }

  /**
   * Calculate SHA256 hash of file content
   */
  private calculateFileHash(content: Buffer): string {
    return crypto.createHash("sha256").update(content).digest("hex");
  }

  /**
   * Check if file hash already exists in Firestore
   */
  private async checkDuplicateHash(fileHash: string): Promise<boolean> {
    const db = admin.firestore();
    const snapshot = await db
      .collection("import_logs")
      .where("fileHash", "==", fileHash)
      .limit(1)
      .get();

    return !snapshot.empty;
  }

  /**
   * Upload file to Firebase Storage immutably
   */
  private async uploadToStorage(
    content: Buffer,
    fileHash: string,
    originalFilename: string,
  ): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const storagePath = `imports/moovs/${timestamp}_${fileHash.slice(0, 8)}_${originalFilename}`;

    const file = this.storage.bucket(this.bucket).file(storagePath);

    await file.save(content, {
      metadata: {
        contentType: "text/csv",
        metadata: {
          originalName: originalFilename,
          fileHash: fileHash,
          uploadedAt: new Date().toISOString(),
          immutable: "true",
        },
      },
    });

    console.log(`✓ Uploaded to storage: ${storagePath}`);
    return storagePath;
  }

  /**
   * Parse CSV content to MoovsRow objects
   */
  private parseCSV(content: string): { data: MoovsRow[]; errors: string[] } {
    const lines = content.split("\n").filter((line) => line.trim());
    const errors: string[] = [];
    const data: MoovsRow[] = [];

    if (lines.length === 0) {
      errors.push("File is empty");
      return { data, errors };
    }

    // Parse header
    const header = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""));

    // Expected columns
    const requiredColumns = [
      "Trip#",
      "Order#",
      "Pickup Date",
      "Pickup Time",
      "Total Amount",
      "Base Rate",
      "Tax Amount",
      "Driver Payout",
      "Service Type",
      "Vehicle Type",
    ];

    // Validate header
    for (const col of requiredColumns) {
      if (!header.includes(col)) {
        errors.push(`Missing required column: ${col}`);
      }
    }

    if (errors.length > 0) {
      return { data, errors };
    }

    // Parse rows
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const values = line.split(",").map((v) => v.trim().replace(/"/g, ""));

      if (values.length !== header.length) {
        errors.push(`Row ${i + 1}: Column count mismatch`);
        continue;
      }

      try {
        const row: MoovsRow = {
          tripNo: values[header.indexOf("Trip#")],
          orderNo: values[header.indexOf("Order#")],
          pickupDate: values[header.indexOf("Pickup Date")],
          pickupTime: values[header.indexOf("Pickup Time")],
          totalAmount: parseFloat(values[header.indexOf("Total Amount")]),
          baseRate: parseFloat(values[header.indexOf("Base Rate")]),
          taxAmount: parseFloat(values[header.indexOf("Tax Amount")]),
          driverPayout: parseFloat(values[header.indexOf("Driver Payout")]),
          serviceType: values[header.indexOf("Service Type")],
          vehicleType: values[header.indexOf("Vehicle Type")],
          pickupAddress: values[header.indexOf("Pickup Address")] || "",
          dropoffAddress: values[header.indexOf("Dropoff Address")] || "",
          passengerName: values[header.indexOf("Passenger Name")] || "",
          passengerPhone: values[header.indexOf("Passenger Phone")],
          passengerEmail: values[header.indexOf("Passenger Email")],
          reqSource: values[header.indexOf("Source")],
          gclid: values[header.indexOf("GCLID")],
          notes: values[header.indexOf("Notes")],
        };

        // Validate required fields
        if (!row.tripNo) {
          errors.push(`Row ${i + 1}: Missing Trip#`);
          continue;
        }
        if (!row.orderNo) {
          errors.push(`Row ${i + 1}: Missing Order#`);
          continue;
        }
        if (isNaN(row.totalAmount)) {
          errors.push(`Row ${i + 1}: Invalid Total Amount`);
          continue;
        }

        data.push(row);
      } catch (error) {
        errors.push(`Row ${i + 1}: Parse error - ${error.message}`);
      }
    }

    return { data, errors };
  }

  /**
   * Main parse method
   */
  async parse(fileContent: Buffer, filename: string): Promise<ParseResult> {
    try {
      // Calculate file hash
      const fileHash = this.calculateFileHash(fileContent);
      console.log(`File hash: ${fileHash}`);

      // Check for duplicate
      const isDuplicate = await this.checkDuplicateHash(fileHash);
      if (isDuplicate) {
        return {
          success: false,
          errors: ["This file has already been imported (duplicate hash detected)"],
          rowCount: 0,
          fileHash,
          storagePath: "",
        };
      }

      // Upload to storage (immutable)
      const storagePath = await this.uploadToStorage(
        fileContent,
        fileHash,
        filename,
      );

      // Parse CSV
      const content = fileContent.toString("utf-8");
      const { data, errors } = this.parseCSV(content);

      console.log(`✓ Parsed ${data.length} rows with ${errors.length} errors`);

      return {
        success: errors.length === 0 || data.length > 0,
        data,
        errors: errors.length > 0 ? errors : undefined,
        rowCount: data.length,
        fileHash,
        storagePath,
      };
    } catch (error) {
      console.error("Parse error:", error);
      return {
        success: false,
        errors: [error.message],
        rowCount: 0,
        fileHash: "",
        storagePath: "",
      };
    }
  }

  /**
   * Store parsed data to Firestore
   */
  async storeToFirestore(
    data: MoovsRow[],
    fileHash: string,
    storagePath: string,
    userId: string,
  ): Promise<void> {
    const db = admin.firestore();
    const batch = db.batch();
    let importedCount = 0;
    let skippedCount = 0;

    // Check for duplicates by tripNo
    for (const row of data) {
      const existingDoc = await db
        .collection("bookings")
        .where("tripNo", "==", row.tripNo)
        .limit(1)
        .get();

      if (!existingDoc.empty) {
        skippedCount++;
        continue;
      }

      const docRef = db.collection("bookings").doc();
      batch.set(docRef, {
        ...row,
        importedAt: admin.firestore.FieldValue.serverTimestamp(),
        importedBy: userId,
        fileHash,
        storagePath,
      });
      importedCount++;
    }

    await batch.commit();

    // Log import
    await db.collection("import_logs").add({
      type: "moovs",
      fileName: storagePath.split("/").pop(),
      fileHash,
      filePath: storagePath,
      rowCount: data.length,
      importedCount,
      skippedCount,
      errorCount: 0,
      status: "success",
      userId,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    console.log(
      `✓ Stored ${importedCount} bookings, skipped ${skippedCount} duplicates`,
    );
  }
}

// Export for Cloud Functions
export const parseMoovsFile = async (
  fileContent: Buffer,
  filename: string,
  userId: string,
): Promise<ParseResult> => {
  const parser = new MoovsParser();
  const result = await parser.parse(fileContent, filename);

  if (result.success && result.data) {
    await parser.storeToFirestore(
      result.data,
      result.fileHash,
      result.storagePath,
      userId,
    );
  }

  return result;
};
