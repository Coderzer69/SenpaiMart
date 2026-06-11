// import { pgTable,text,timestamp,uuid,boolean,integer,jsonb } from "drizzle-orm/pg-core";
// import{ relations}from "drizzle-orm";

// export type OderStatus = "pending" | "paid" | "failed" | "delivered" ;
// export type UserRole = "admin" | "customer" | "support";

// export type CheckoutSessionLine = {
//     productId:string;
//     qunatity:number;
//     unitPriceCents:number;
// }

/// TABLES

// users table
// export const users = pgTable("users",{
//     id: uuid("id").primaryKey().defaultRandom(),
//     clerkUserId:text("clerk_user_id").notNull().unique(),
//     email:text("email").notNull().unique(),
//     displayName:text("display_name").notNull(),
//     role:text("role").$type<UserRole>().notNull().default("customer"),
//     createdAt:timestamp("created_at" ,{withTimezone:true}).notNull().defaultNow(),
//     updatedAt:timestamp("updated_at" ,{withTimezone:true}).notNull().defaultNow(),
// });




// products table
// export const product = pgTable("products",{
//     id: uuid("id").primaryKey().defaultRandom(),
//     slug:text("slug").notNull().unique(),
//     category:text("category").notNull().default("general"),
//     description:text("description").notNull().default(""),
//     priceCents:integer("price_centes").notNull().default(0),
//     curency:text("currency").notNull().default("USD"),
//     imageUrl:text("image_url"),
//     imageKitFeild : text("image_kit_feild"),
//     active:boolean("active").notNull().default(true),
//     createdAt:timestamp("created_at" ,{withTimezone:true}).notNull().defaultNow(),
// });


// checkout sessions table
// export const CheckoutSessions = pgTable("checkout_sessions",{
//     id: uuid("id").primaryKey().defaultRandom(),
//     userId:uuid("user_id").notNull().references(()=>users.id ,{onDelete:"cascade"}),
//     polarCheckoutId:text("polar_checkout_id").notNull().unique(),
//     lines:jsonb("lines").$type<CheckoutSessionLine[]>().notNull(),
//     totalCents:integer("total_cents").notNull(),
//     currency:text("currency").notNull(),
//     createdAt:timestamp("created_at",{withTimezone:true}).notNull().defaultNow(),
// });


// orders table
// export const orders = pgTable("orders",{
//     id:uuid("id").primaryKey().defaultRandom(),
//     userId:uuid("user_id").notNull().references(()=>users.id ,{onDelete:"cascade"}),
//         status:text("status").$type<OderStatus>().notNull().default("pending"),
//     polarCheckoutId:text("polar_checkout_id"),
//     polarOrderId:text("polar_order_id"),
//     totalCents:integer("total_cents").notNull().default(0),
//     createdAt:timestamp("created_at" ,{withTimezone:true}).notNull().defaultNow(),
//     updatedAt:timestamp("updated_at" ,{withTimezone:true}).notNull().defaultNow(),
// });



// order items table
// export const orderItems = pgTable("order_items",{
//     id:uuid("id").primaryKey().defaultRandom(),
//     orderId:uuid("order_id").notNull().references(()=>orders.id ,{onDelete:"cascade"}),
//     productId:uuid("product_id").notNull().references(()=>product.id ,{onDelete:"restrict"}),
//     quantity:integer("quantity").notNull(),
//     unitPriceCents:integer("unit_price_cents").notNull(),
//     totalPriceCents:integer("total_price_cents").notNull().default(0),
// });


// RELATIONS

// a user can have many orders

// export const usersRelations = relations(users, ({ many }) => ({
//   orders: many(orders),
// }));

// an order belongs to a user and  has many order items
// export const ordersRelations = relations(orders,({many})=>({
//     orderItems:many(orderItems),
// }));

// each order belongs to exactly one user; each order can have many line items.
// export const orderRelations = relations(orders,({one, many })=>({
//     user:one(users , { fields : [orders.userId],references:[users.id]}),
//     items:many(orderItems),
// }))

// each order item belongs to one order and one product
// export const orderItemsRelations = relations(orderItems,({one})=>({
//     order:one(orders , { fields : [orderItems.orderId],references:[orders.id]}),
//     product:one(product , { fields : [orderItems.productId],references:[product.id]}),
// }));











import { pgTable, text, integer, timestamp, uuid, boolean, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export type OrderStatus = "pending" | "paid" | "failed";
export type UserRole = "customer" | "support" | "admin";

export type CheckoutSessionLine = {
  productId: string;
  quantity: number;
  unitPriceCents: number;
};

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  clerkUserId: text("clerk_user_id").notNull().unique(),
  email: text("email").notNull().default(""),
  displayName: text("display_name"),
  role: text("role").$type<UserRole>().notNull().default("customer"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const products = pgTable("products", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  category: text("category").notNull().default("General"),
  description: text("description").notNull().default(""),
  priceCents: integer("price_cents").notNull(),
  currency: text("currency").notNull().default("usd"),
  imageUrl: text("image_url"),
  /** ImageKit `fileId` for deletes */
  imageKitFileId: text("image_kit_file_id"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const checkoutSessions = pgTable("checkout_sessions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  polarCheckoutId: text("polar_checkout_id").unique(),
  lines: jsonb("lines").$type<CheckoutSessionLine[]>().notNull(),
  totalCents: integer("total_cents").notNull(),
  currency: text("currency").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const orders = pgTable("orders", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  status: text("status").$type<OrderStatus>().notNull().default("pending"),
  polarCheckoutId: text("polar_checkout_id"),
  polarOrderId: text("polar_order_id").unique(),
  totalCents: integer("total_cents").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const orderItems = pgTable("order_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "restrict" }),
  quantity: integer("quantity").notNull(),
  unitPriceCents: integer("unit_price_cents").notNull(),
});

// cascade = “delete children when parent is deleted”; restrict = “don’t delete the parent if any child still points at it.”

// a user can have many orders over time.
export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
}));

// the same product can show up on many order lines
export const productsRelations = relations(products, ({ many }) => ({
  orderItems: many(orderItems),
}));

// each order belongs to exactly one user; each order can have many line items.
export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, { fields: [orders.userId], references: [users.id] }),
  items: many(orderItems),
}));

// each line item is for exactly one order and one product
export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, { fields: [orderItems.orderId], references: [orders.id] }),
  product: one(products, { fields: [orderItems.productId], references: [products.id] }),
}));