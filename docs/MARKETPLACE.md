# Marketplace integration policy

The marketplace module is intentionally a **public listing search + external-link tool**.

- It currently includes provider adapters for Star Hangar, Space Foundry and The Impound.
- It may parse public search-result cards when the seller page permits normal HTTP access.
- If parsing fails, it falls back to an external live search link rather than inventing a price or availability.
- “LTI only” is a text filter, not a guarantee that an item actually transfers with Lifetime Insurance.
- NekoVerse does not sign into RSI or a seller, store marketplace credentials, purchase anything, or automate pledge transfers.
- Third-party Star Citizen pledge trades are a grey market and are not purchases protected or endorsed by CIG/RSI. Always verify the item, insurance, seller, payment/refund/escrow terms and final transfer yourself.

Provider adapters should respect seller terms, rate limits, robots policy where applicable, and changes to page structure.
