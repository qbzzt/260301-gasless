import express from "express";
import { createServer as createViteServer } from "vite";
import { createWalletClient, http } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { sepolia } from 'viem/chains'
import 'dotenv/config'

let greeterABI = [
  {
    "type": "function",
    "name": "sponsoredSetGreeting",
    "inputs": [
      {
        "name": "req",
        "type": "tuple",
        "internalType": "struct Greeter.GreetingRequest",
        "components": [
          {
            "name": "greeting",
            "type": "string",
            "internalType": "string"
          }
        ]
      },
      {
        "name": "v",
        "type": "uint8",
        "internalType": "uint8"
      },
      {
        "name": "r",
        "type": "bytes32",
        "internalType": "bytes32"
      },
      {
        "name": "s",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
]  // greeterABI


const sepoliaAccount = privateKeyToAccount(process.env.PRIVATE_KEY)

const sepoliaClient = createWalletClient({
  account: sepoliaAccount,
  chain: sepolia,
  transport: http("https://rpc.sentio.xyz/sepolia"),
})

const greeterAddr = '0xC87506C66c7896366b9E988FE0aA5B6dDE77CFfA'

const start = async () => {
  const app = express()

  app.use(express.json())

  app.post("/server/sponsor", async (req, res) => {
    try {
      const signed = req.body

      const txHash = await sepoliaClient.writeContract({
        address: greeterAddr,
        abi: greeterABI,
        functionName: 'sponsoredSetGreeting',
        args: [signed.req, signed.v, signed.r, signed.s],
      })

      res.json({ txHash })
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: err.message })
    }
  })

  // Let Vite handle everything else
  const vite = await createViteServer({
    server: { middlewareMode: true }
  })

  app.use(vite.middlewares)

  app.listen(5173, () => {
    console.log("Dev server running on http://localhost:5173");
  })
}

start()

