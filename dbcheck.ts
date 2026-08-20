import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
async function main() {
  const c = await p.college.count();
  console.log("colleges in DB:", c);
  for (const name of ["Arizona State University", "Harvard University", "Albany State University", "Georgia Institute of Technology"]) {
    const r = await p.college.findFirst({
      where: { name },
      select: { name: true, acceptanceRate: true, avgGpa: true, satRangeMin: true, satRangeMax: true, actRangeMin: true, actRangeMax: true },
    });
    console.log(name, "=>", JSON.stringify(r));
  }
}
main().finally(() => p.$disconnect());