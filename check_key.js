const key = process.env.API_KEY;
if (key) {
  console.log("API_KEY starts with:", key.substring(0, 4));
  console.log("API_KEY length:", key.length);
} else {
  console.log("API_KEY is missing");
}
