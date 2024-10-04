import {
    ACTIONS_CORS_HEADERS,
    ActionGetResponse,
  ActionPostRequest,
  ActionPostResponse,
  createPostResponse,
} from "@solana/actions";
  
  import {
    Connection,
    LAMPORTS_PER_SOL,
    PublicKey,
    SystemProgram,
    Transaction,
    clusterApiUrl,
  } from "@solana/web3.js";
  
  // GET request handler
  export async function GET(request: Request) {
    const url = new URL(request.url);
    const payload: ActionGetResponse = {
      icon: "/ma.png", // Local icon path
      title: "Donate to Rahul",
      description: "Support Rahul by donating SOL.",
      label: "Donate",
      links: {
        actions: [
          {
            label: "Donate 0.1 SOL",
            href: `${url.href}?amount=0.1`,
            type: "transaction"
          },
        ],
      },
    };
    return new Response(JSON.stringify(payload), {
      headers: ACTIONS_CORS_HEADERS,
    });
  }
  
  export const OPTIONS = GET; // OPTIONS request handler
  
  // POST request handler
  export async function POST(request: Request) {
    const body: ActionPostRequest = await request.json();
    const url = new URL(request.url);
    const amount = Number(url.searchParams.get("amount")) || 0.1;
    let sender;
  
    try {
      sender = new PublicKey(body.account);
    } catch (error) {
      return new Response(
        JSON.stringify({
          error: {
            message: "Invalid account",
          },
        }),
        {
          status: 400,
          headers: ACTIONS_CORS_HEADERS,
        }
      );
    }
  
    const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
  
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: sender, // Sender public key
        toPubkey: new PublicKey("9jNvLRB5S9Np6Gh32ZGdq86zTFLkinjSkge6g5TUPkwE"), // Replace with your recipient public key
        lamports: amount * LAMPORTS_PER_SOL,
      })
    );
    transaction.feePayer = sender;
    transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    transaction.lastValidBlockHeight = (await connection.getLatestBlockhash()).lastValidBlockHeight;
  
    const payload: ActionPostResponse = await createPostResponse({
      fields: {
        transaction,
        message: "Transaction created",
        type: "transaction" // Added the missing 'type' property
      },
    });
    return new Response(JSON.stringify(payload), {
      headers: ACTIONS_CORS_HEADERS,
    });
  }