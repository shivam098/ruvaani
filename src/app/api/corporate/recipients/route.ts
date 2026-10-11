import { NextResponse } from "next/server";
import { connectDb } from "@/lib/db";
import { RecipientModel, CorporateAccountModel } from "@/lib/models";
import { apiError, rateLimit, requestIp } from "@/lib/http";
import { requireUser } from "@/lib/auth";

export const runtime = "nodejs";

interface RawRecipient {
  name?: string;
  mobile?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  gift?: string;
}

export async function POST(request: Request) {
  try {
    await rateLimit(`recipients-upload:${requestIp(request)}`, 20);
    const user = await requireUser();
    const body = await request.json();

    const recipientsList: RawRecipient[] = Array.isArray(body.recipients) ? body.recipients : [];
    if (!recipientsList.length) {
      return NextResponse.json({ error: "Please provide a non-empty list of recipients." }, { status: 400 });
    }

    if (recipientsList.length > 5000) {
      return NextResponse.json({ error: "Maximum 5,000 recipients can be uploaded per batch." }, { status: 400 });
    }

    await connectDb();

    // Find or create user's corporate account
    let corporateAccount = await CorporateAccountModel.findOne({
      $or: [{ userId: user.id }, { workEmail: user.email.toLowerCase() }],
    });
    if (!corporateAccount) {
      corporateAccount = await CorporateAccountModel.create({
        companyName: user.name || "Corporate Account",
        workEmail: user.email.toLowerCase(),
        mobile: "9876543210",
        userId: user.id,
      });
    }

    const validatedItems = [];
    const errors: { row: number; error: string }[] = [];
    const seenMobiles = new Set<string>();
    const seenEmails = new Set<string>();

    for (let i = 0; i < recipientsList.length; i++) {
      const row = recipientsList[i];
      const rowNum = i + 1;

      const name = (row.name || "").trim();
      const mobile = String(row.mobile || "").replace(/\D/g, "");
      const email = (row.email || "").trim().toLowerCase();
      const address = (row.address || "").trim();
      const city = (row.city || "").trim();
      const pincode = String(row.pincode || "").trim();

      if (!name) {
        errors.push({ row: rowNum, error: "Recipient name is required." });
        continue;
      }

      if (!/^[6-9]\d{9}$/.test(mobile)) {
        errors.push({ row: rowNum, error: `Invalid Indian mobile number: ${row.mobile}` });
        continue;
      }

      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push({ row: rowNum, error: `Invalid email address: ${row.email}` });
        continue;
      }

      if (!/^[1-9]\d{5}$/.test(pincode)) {
        errors.push({ row: rowNum, error: `Invalid 6-digit postal pincode: ${row.pincode}` });
        continue;
      }

      if (!address || address.length < 5) {
        errors.push({ row: rowNum, error: "Detailed delivery address is required." });
        continue;
      }

      // Duplicate detection in uploaded batch
      if (seenMobiles.has(mobile)) {
        errors.push({ row: rowNum, error: `Duplicate mobile number in batch: ${mobile}` });
        continue;
      }
      seenMobiles.add(mobile);

      if (email && seenEmails.has(email)) {
        errors.push({ row: rowNum, error: `Duplicate email address in batch: ${email}` });
        continue;
      }
      if (email) seenEmails.add(email);

      validatedItems.push({
        corporateAccountId: corporateAccount._id,
        name,
        mobile,
        email: email || `${mobile}@ruvaani.recipient`,
        address,
        city: city || "Metropolitan",
        state: row.state || "",
        pincode,
        gift: row.gift || "Standard Corporate Hamper",
        status: "PENDING",
      });
    }

    if (errors.length > 0 && validatedItems.length === 0) {
      return NextResponse.json({
        success: false,
        error: "Validation failed for all recipients.",
        details: errors.slice(0, 15),
      }, { status: 400 });
    }

    const inserted = await RecipientModel.insertMany(validatedItems);

    return NextResponse.json({
      success: true,
      totalReceived: recipientsList.length,
      validSaved: inserted.length,
      invalidCount: errors.length,
      warnings: errors.slice(0, 10),
      message: `Successfully validated and saved ${inserted.length} recipients for delivery tracking.`,
    });
  } catch (error) {
    return apiError(error);
  }
}

export async function GET() {
  try {
    const user = await requireUser();
    await connectDb();

    const corporateAccount = await CorporateAccountModel.findOne({
      $or: [{ userId: user.id }, { workEmail: user.email.toLowerCase() }],
    });

    if (!corporateAccount) {
      return NextResponse.json({ recipients: [], count: 0 });
    }

    const recipients = await RecipientModel.find({ corporateAccountId: corporateAccount._id })
      .sort({ createdAt: -1 })
      .limit(500)
      .lean();

    return NextResponse.json({ recipients, count: recipients.length });
  } catch (error) {
    return apiError(error);
  }
}
