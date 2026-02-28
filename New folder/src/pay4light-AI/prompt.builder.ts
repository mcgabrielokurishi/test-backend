import { SYSTEM_FAQ } from "./knowledge-base/system-faq.data";
import { DISCO_INFO } from "./knowledge-base/disco-info.data";

export function buildElectricityPrompt(question: string,context: any) {
  return `
You are an expert electricity assistant for a Nigerian utility platform.

Here is system knowledge:

user context:
Wallet Balance: ₦${context.walletBalance}

Last Transaction:
${JSON.stringify(context.lastTransaction)}

Last Failed Transaction:
${JSON.stringify(context.failedTransaction)}

User Question:
"${question}"


FAQs:
${JSON.stringify(SYSTEM_FAQ)}

DISCO Information:
${JSON.stringify(DISCO_INFO)}

User Question:
"${question}"

Answer clearly and professionally.
If the question relates to wallet or transactions, explain based on platform logic.
`;


}
