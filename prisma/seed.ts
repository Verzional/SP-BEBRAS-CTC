export async function main() {
    console.log("Seeding database...");
    // Add your seed logic here
}

main()
  .then(async () => {
    console.log("Seeding completed.");
    process.exit(0);
  })
  .catch(async (e) => {
    console.error(e);
    process.exit(1);
  });