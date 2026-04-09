console.log("Environment Keys:", Object.keys(process.env).filter(k => !k.includes("SECRET") && !k.includes("PASSWORD")));
