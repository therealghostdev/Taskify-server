import crypto from "crypto";
import fs from "fs";
import path from "path";

// Generate RSA key pair
const generateKeyPair = () => {
  const keypair = crypto.generateKeyPairSync("rsa", {
    modulusLength: 4096,
    publicKeyEncoding: {
      type: "pkcs1",
      format: "pem",
    },
    privateKeyEncoding: {
      type: "pkcs1",
      format: "pem",
    },
  });

  // Resolve the path to the .env file in the root directory
  const envFilePath = path.resolve(__dirname, "../../.env");

  // Append the keys to the existing .env file
  const envData = `\nRSA_PUBLIC_KEY="${keypair.publicKey.replace(
    /\n/g,
    "\\n"
  )}"\nRSA_PRIVATE_KEY="${keypair.privateKey.replace(/\n/g, "\\n")}"\n`;
  fs.appendFileSync(envFilePath, envData);

  console.log("Keys written to .env file");
};

// Call the function to generate and save the keys
generateKeyPair();
