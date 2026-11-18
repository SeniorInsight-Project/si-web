// Copia os tipos TypeScript gerados no si-contracts (generated/ts) para src/contracts.
// Os arquivos ficam versionados aqui para o build da Vercel não depender do repositório vizinho.
// Uso: npm run contracts:sync  (com o si-contracts em ../si-contracts, ou SI_CONTRACTS=<pasta>)
import { copyFileSync, mkdirSync, readdirSync } from 'node:fs'
import { join, resolve } from 'node:path'

const origem = resolve(process.env.SI_CONTRACTS ?? '../si-contracts', 'generated/ts')
const destino = resolve('src/contracts')
mkdirSync(destino, { recursive: true })

for (const arquivo of readdirSync(origem).filter((nome) => nome.endsWith('.ts'))) {
  copyFileSync(join(origem, arquivo), join(destino, arquivo))
  console.log(`ok  ${arquivo}`)
}
