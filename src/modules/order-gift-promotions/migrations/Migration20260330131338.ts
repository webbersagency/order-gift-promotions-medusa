import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260330131338 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table if not exists "order_gift_promotion" ("id" text not null, "order_quantity" integer not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "order_gift_promotion_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_order_gift_promotion_deleted_at" ON "order_gift_promotion" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`create table if not exists "order_gift_promotion_gift_item" ("id" text not null, "quantity" integer not null, "promotion_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "order_gift_promotion_gift_item_pkey" primary key ("id"));`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_order_gift_promotion_gift_item_promotion_id" ON "order_gift_promotion_gift_item" ("promotion_id") WHERE deleted_at IS NULL;`);
    this.addSql(`CREATE INDEX IF NOT EXISTS "IDX_order_gift_promotion_gift_item_deleted_at" ON "order_gift_promotion_gift_item" ("deleted_at") WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "order_gift_promotion_gift_item" add constraint "order_gift_promotion_gift_item_promotion_id_foreign" foreign key ("promotion_id") references "order_gift_promotion" ("id") on update cascade on delete cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "order_gift_promotion_gift_item" drop constraint if exists "order_gift_promotion_gift_item_promotion_id_foreign";`);

    this.addSql(`drop table if exists "order_gift_promotion" cascade;`);

    this.addSql(`drop table if exists "order_gift_promotion_gift_item" cascade;`);
  }

}
