import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config()

async function main(){
  console.log('Worker ingest started — implement file ingestion -> embeddings -> vector DB')
}

main().catch(e=>{ console.error(e); process.exit(1) })

