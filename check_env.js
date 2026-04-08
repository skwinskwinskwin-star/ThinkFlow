
const keys = {};
Object.keys(process.env).forEach(k => {
  if (k.includes("KEY") || k.includes("AI")) {
    keys[k] = process.env[k] ? process.env[k].length : 0;
  }
});
console.log(JSON.stringify(keys, null, 2));
