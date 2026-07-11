// scripts/install-v7.js — installs the uuid_generate_v7() function
// in the connected Postgres database. Run after `prisma db push
// --force-reset` to restore the function Prisma dropped.
//
// Idempotent: uses CREATE OR REPLACE.

const path = require("path");
const realPrisma = require(path.resolve(__dirname, "../node_modules/.prisma/client/default.js"));

(async () => {
  const p = new realPrisma.PrismaClient();
  try {
    const createFn = `
      CREATE OR REPLACE FUNCTION uuid_generate_v7() RETURNS uuid AS $$
      DECLARE
        ts bytea;
        rand bytea;
        uuid_bytes bytea;
      BEGIN
        ts := decode(
          lpad(
            to_hex((extract(epoch from clock_timestamp()) * 1000)::bigint)::text,
            12,
            '0'
          ),
          'hex'
        );
        rand := gen_random_bytes(10);
        uuid_bytes := ts || rand;
        uuid_bytes := set_byte(uuid_bytes, 6, (get_byte(uuid_bytes, 6) & 15) | 112);
        uuid_bytes := set_byte(uuid_bytes, 8, (get_byte(uuid_bytes, 8) & 63) | 128);
        RETURN encode(uuid_bytes, 'hex')::uuid;
      END;
      $$ LANGUAGE plpgsql VOLATILE;
    `;
    await p.$executeRawUnsafe(createFn);
    const test = await p.$queryRawUnsafe("SELECT uuid_generate_v7() AS id;");
    console.log("uuid_generate_v7() installed. Sample:", test[0].id);
  } catch (e) {
    console.error("Error:", e.message);
    process.exit(1);
  } finally {
    await p.$disconnect();
  }
})();
