"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const crypto_1 = __importDefault(require("crypto"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
// Generate RSA key pair
const generateKeyPair = () => {
    const keypair = crypto_1.default.generateKeyPairSync("rsa", {
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
    const keypair2 = crypto_1.default.generateKeyPairSync("rsa", {
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
    const envFilePath = path_1.default.resolve(__dirname, "../../.env");
    // Append the keys to the existing .env file
    const envData = `\nRSA_PUBLIC_KEY="${keypair.publicKey.replace(/\n/g, "\\n")}"\nRSA_PRIVATE_KEY="${keypair.privateKey.replace(/\n/g, "\\n")}"\n`;
    fs_1.default.appendFileSync(envFilePath, envData);
    const envData2 = `\nREFRESH_TOKEN_PUBLIC_KEY="${keypair2.publicKey.replace(/\n/g, "\\n")}"\nREFRESH_TOKEN_PRIVATE_KEY="${keypair.privateKey.replace(/\n/g, "\\n")}"\n`;
    fs_1.default.appendFileSync(envFilePath, envData2);
    console.log("Keys written to .env file");
};
// Call the function to generate and save the keys
generateKeyPair();
