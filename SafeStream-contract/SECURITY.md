Private keys and environment variables

This repository includes a `.env.example` to show which environment variables are used by the Hardhat scripts.

Important guidance:

- Never commit your real private key to the repository. Use a local `.env` file that is listed in `.gitignore`.
- The project reads `PRIVKEY` by default. For convenience some scripts also accept `PRIVATE_KEY`.
- The expected format for the key is a 0x-prefixed hex string, e.g. `0xaaaaaaaa...`.
- Example `.env` contents (DO NOT commit):

```
SEPOLIA_RPC=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
PRIVKEY=0xYOUR_PRIVATE_KEY_HERE
ETHERSCAN_API_KEY=your_etherscan_key
```

- To keep keys secure in CI, store them in your CI provider's secret store and reference them as environment variables when running deployment tasks.

If you want, I can add a small script to validate `.env` on startup and warn if `PRIVKEY` looks like a real key in the repo (to prevent accidental commits).