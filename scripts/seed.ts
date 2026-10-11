import { connectDb } from "../src/lib/db";
import {
  ProductModel,
  UserModel,
  SessionModel,
  OrderModel,
  QuoteModel,
  CorporateAccountModel,
  RecipientModel,
  MerchantModel,
  MerchantKycModel,
  MerchantSettlementModel,
  CategoryModel,
  OccasionModel,
  FestivalModel,
  CouponModel,
  ReviewModel,
  SupportTicketModel,
  AIConversationModel,
  RateModel,
  AuditModel,
  HomepageModel,
  InteractionModel,
} from "../src/lib/models";
import { hashPassword } from "../src/lib/password";
import { demoProducts } from "../tests/fixtures/products";
import { catalogueProducts, occasions } from "../src/lib/catalog-data";

const categoriesToSeed = [
  { name: "Curated Hampers", slug: "curated-hampers", description: "Luxury gift hampers for festivals, employees, and executive gifting.", featured: true, active: true },
  { name: "Desk Essentials", slug: "desk-essentials", description: "Premium desk organizers, personalized stationery & corporate tools.", featured: true, active: true },
  { name: "Wellness & Self-Care", slug: "wellness", description: "Aromatherapy, calming teas, and mindful self-care gift sets.", featured: true, active: true },
  { name: "Gourmet & Sweets", slug: "gourmet", description: "Artisanal chocolates, dry fruit selections, and festive delicacies.", featured: true, active: true },
  { name: "Eco-Friendly & Sustainable", slug: "eco-friendly", description: "Sustainable bamboo, organic cotton, and eco-conscious gifting.", featured: true, active: true },
];

const couponsToSeed = [
  {
    code: "WELCOME10",
    description: "10% off on your first order",
    discountType: "PERCENTAGE",
    discountValue: 10,
    minOrderValue: 99900,
    maxDiscount: 50000,
    active: true,
  },
  {
    code: "DIWALI20",
    description: "20% off on festive collections",
    discountType: "PERCENTAGE",
    discountValue: 20,
    minOrderValue: 199900,
    maxDiscount: 150000,
    active: true,
  },
  {
    code: "CORPORATE500",
    description: "Flat ₹500 off on bulk corporate orders",
    discountType: "FIXED",
    discountValue: 50000,
    minOrderValue: 500000,
    applicableRoles: ["CORPORATE", "ADMIN", "SUPER_ADMIN"],
    active: true,
  },
];

async function main() {
  const db = await connectDb();
  try {
    console.log("Creating database indexes...");
    const models = [
      ProductModel, UserModel, SessionModel, OrderModel, QuoteModel,
      CorporateAccountModel, RecipientModel, MerchantModel, MerchantKycModel,
      MerchantSettlementModel, CategoryModel, OccasionModel, FestivalModel,
      CouponModel, ReviewModel, SupportTicketModel, AIConversationModel,
      RateModel, AuditModel, HomepageModel, InteractionModel,
    ];

    for (const model of models) {
      await model.createIndexes();
    }
    console.log("✓ All indexes created successfully.");

    // Seed Categories
    for (const cat of categoriesToSeed) {
      await CategoryModel.updateOne({ slug: cat.slug }, { $set: cat }, { upsert: true });
    }
    console.log(`✓ Seeded ${categoriesToSeed.length} product categories.`);

    // Seed Occasions
    for (const occ of occasions) {
      const slug = occ.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      await OccasionModel.updateOne(
        { slug },
        { $set: { name: occ, slug, active: true } },
        { upsert: true }
      );
    }
    console.log(`✓ Seeded ${occasions.length} occasions.`);

    // Seed Coupons
    for (const cp of couponsToSeed) {
      await CouponModel.updateOne({ code: cp.code }, { $set: cp }, { upsert: true });
    }
    console.log(`✓ Seeded ${couponsToSeed.length} promotional coupons.`);

    // Seed Products from fixtures and catalogue
    let productCount = 0;
    for (const p of demoProducts) {
      await ProductModel.updateOne(
        { id: p.id },
        {
          $set: {
            ...p,
            rating: 4.9,
            reviewsCount: 18,
            gst: 18,
          },
        },
        { upsert: true }
      );
      productCount++;
    }

    for (const item of catalogueProducts) {
      if (item.cataloguePrice) {
        await ProductModel.updateOne(
          { id: item.id },
          {
            $set: {
              id: item.id,
              slug: item.slug,
              name: item.name,
              subtitle: item.subtitle,
              description: item.description,
              category: "Hampers",
              price: item.cataloguePrice,
              compareAtPrice: Math.round(item.cataloguePrice * 1.15),
              stock: 150,
              minimumOrderQuantity: 10,
              personalizable: item.personalizable,
              artwork: "hamper",
              color: "#ede5da",
              badge: item.featured ? "Featured" : undefined,
              occasions: item.occasion ? [item.occasion] : ["Corporate events", "Diwali"],
              recipients: ["Clients", "Employees"],
              includes: item.contents || [],
              featured: item.featured,
              active: true,
              rating: 4.8,
              reviewsCount: 12,
              gst: 18,
            },
          },
          { upsert: true }
        );
        productCount++;
      }
    }
    console.log(`✓ Seeded/Updated ${productCount} catalogue products into MongoDB.`);

    // Seed Super Admin if configured
    const adminEmail = process.env.ADMIN_EMAIL || "admin@ruvaani.com";
    const adminName = process.env.ADMIN_NAME || "Ruvaani Admin";
    const adminPassword = process.env.ADMIN_PASSWORD || "RuvaaniAdmin@2026!";

    const existingAdmin = await UserModel.findOne({ email: adminEmail });
    if (!existingAdmin) {
      const passwordHash = await hashPassword(adminPassword);
      await UserModel.create({
        name: adminName,
        email: adminEmail,
        passwordHash,
        role: "SUPER_ADMIN",
        status: "ACTIVE",
      });
      console.log(`✓ Seeded Super Admin account: ${adminEmail}`);
    } else {
      console.log(`• Admin user already exists: ${adminEmail}`);
    }

    console.log("\nDatabase initialization and seeding completed successfully!");
  } finally {
    await db.disconnect();
  }
}

main().catch((error: unknown) => {
  console.error("Database seeding failed:", error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
