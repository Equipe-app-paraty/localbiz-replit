 authService.js app.js webhooks.js api.js users.js userController.js user.js auth.js



Atualização do Clerk's Node SDK para o Express SDK
Instalar o Express SDK
Para atualizar do Clerk Node SDK para o Clerk Express SDK, execute o seguinte comando para desinstalar o Node SDK:

npm
fio
pnpm
pãozinho
terminal

npm uninstall @clerk/clerk-sdk-node
Em seguida, execute o seguinte comando para instalar o Express SDK:

npm
fio
pnpm
pãozinho
terminal

npm install @clerk/express
Migrar dewithAuth()
Se você costumava withAuth()encapsular seus manipuladores de rota, agora pode recuperar o estado de autenticação dentro dos seus manipuladores de rota Express usando o req.authobjeto.

clerkMiddleware()é necessário ser definido na cadeia de middleware antes que este utilitário seja usado, conforme mostrado no exemplo a seguir.


import { withAuth } from '@clerk/clerk-sdk-node'
import { clerkMiddleware } from '@clerk/express'
import express from 'express'

const app = express()
const port = 3000

app.use(clerkMiddleware())

app.get(
  '/auth-state',
  withAuth((req, res) => res.json(req.auth)),
)
app.get('/auth-state', (req, res) => {
  const authState = req.auth
  return res.json(authState)
})

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`)
})
requireAuth()mudanças de uso
No SDK do Node, requireAuth()manipuladores de rotas encapsulados. Com o SDK Express, você deve passar requireAuth()uma função de middleware antes do manipulador, em vez de encapsular o manipulador. Além disso, requireAuth()agora redirecionará usuários não autenticados para a página de login, onde antes emitia um erro.


import { requireAuth } from '@clerk/clerk-sdk-node'
import { requireAuth } from '@clerk/express'

app.get('/', requireAuth(handler))
app.get('/', requireAuth(), handler)
Se você quiser manter o comportamento anterior requireAuth()(emitir um erro em vez de redirecionar), você pode fazer isso da seguinte maneira:


const legacyRequireAuth = (req, res, next) => {
  if (!req.auth.userId) {
    return next(new Error('Unauthenticated'))
  }
  next()
}
app.get('/', legacyRequireAuth, handler)
Você também deve certificar-se de capturar e tratar o erro usando um middleware de erro  abaixo.

Migrar deClerkExpressWithAuth
Para substituir seu middleware Node SDK existente ClerkExpressWithAuth(), que permite que as solicitações prossigam mesmo quando os usuários não estão autenticados, você precisa escrever seu próprio middleware que usa req.authobjeto para recuperar o estado de autenticação e, em seguida, retornar um objeto vazio se o usuário não estiver autenticado.


import { ClerkExpressWithAuth } from '@clerk/clerk-sdk-node'
import { clerkMiddleware } from '@clerk/express'
import express from 'express'

const app = express()
const port = 3000

// clerkMiddleware is required to be set in the middleware chain before req.auth is used
app.use(clerkMiddleware())

const withAuth = (req, res, next) => {
  const { userId } = req.auth
  // If the user is not authenticated, return an empty object
  req.auth = userId ? auth : {}
  next()
}

// Define a protected route
app.get('/protected-route', ClerkExpressWithAuth(), (req, res) => {
  res.json(req.auth)
})
app.get('/protected', withAuth, (req, res) => {
  res.json(req.auth)
})

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`)
})
Migrar deClerkExpressRequireAuth
Para impor a autenticação rigorosa, substitua seu middleware rigoroso do Node SDK existente, ClerkExpressRequireAuth, pelo novo middleware do Express SDK, requireAuth().

requireAuth()é uma função de middleware que você pode usar para proteger rotas em seu aplicativo Express.js. Esta função verifica se o usuário está autenticado e, caso contrário, redireciona para o URL de login configurado.


import { ClerkExpressRequireAuth, RequireAuthProp, StrictAuthProp } from '@clerk/clerk-sdk-node'
import { clerkMiddleware, requireAuth } from '@clerk/express'
import express from 'express'

const app = express()
const port = 3000

// Define a protected route
app.get('/protected', ClerkExpressRequireAuth(), (req, res) => {
  res.send('This is a protected route')
})
app.get('/protected', requireAuth(), (req, res) => {
  res.send('This is a protected route')
})

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`)
})
Se você quiser manter o comportamento anterior ClerkExpressRequireAuth(emitir um erro em vez de redirecionar), você pode fazer isso da seguinte maneira:


const legacyRequireAuth = (req, res, next) => {
  if (!req.auth.userId) {
    return next(new Error('Unauthenticated'))
  }
  next()
}
app.get('/', legacyRequireAuth, handler)
Você também deve certificar-se de capturar e tratar o erro usando um middleware de erro  abaixo.

Migrar de createClerkExpressWithAuthecreateClerkExpressRequireAuth
Se você já usou createClerkExpressWithAuthou createClerkExpressRequireAuthpara criar um middleware personalizado passando chaves Clerk personalizadas, uma clerkClientinstância personalizada e/ou uma URL de API personalizada, não poderá mais usar esses métodos com o Express SDK. Em vez disso, use clerkMiddlewarepara criar seu middleware personalizado.

Se você estiver passando chaves personalizadas do Clerk ou uma URL de API personalizada, passe-as createClerkClientdo Backend SDK e depois passe-as personalizadas clerkClientpara o middleware.


import { createClerkExpressRequireAuth } from '@clerk/clerk-sdk-node'
import { createClerkClient } from '@clerk/backend'
import { clerkMiddleware } from '@clerk/express'

const customMiddleware = createClerkExpressRequireAuth({
  publishableKey: '',
  apiUrl: '',
  secretKey: '',
})
const clerkClient = createClerkClient({ publishableKey: '', apiUrl: '', secretKey: '' })

app.use(clerkMiddleware({ clerkClient }))

app.get('/path', customMiddleware, (req, res) => res.json(req.auth))
app.get('/path', (req, res) => res.json(req.auth))
SDK de back-end
Importações removidas
Com o Node SDK, você pode importar qualquer um dos métodos do Backend SDK diretamente do Node SDK. Com o Express SDK, você precisa importar os métodos do Backend SDK do @clerk/backendpacote.


import { User, requireAuth } from '@clerk/clerk-sdk-node'
import { requireAuth } from '@clerk/express'
import { User } from '@clerk/backend'
clerkClientimportar
O clerkClienté usado para acessar o Backend SDK , que expõe os recursos da API de Backend do Clerk. Se você estava importando clerkClientdo Node SDK, pode importá-lo do Express SDK.


import { clerkClient } from '@clerk/clerk-sdk-node'
import { clerkClient } from '@clerk/express'
Instanciando um costumeclerkClient
Se você estava instanciando um método personalizado clerkClientcom createClerkClient, não poderá mais importar este método do Express SDK. Você deve importá-lo do Backend SDK .


import { createClerkClient } from '@clerk/clerk-sdk-node'
import { createClerkClient } from '@clerk/backend' 




Aprenda a integrar o Clerk ao seu backend Express para autenticação e gerenciamento seguros de usuários. Este guia se concentra na implementação do backend e requer um SDK de frontend Clerk para funcionar corretamente.

Instalar@clerk/express
O Clerk Express SDK fornece uma variedade de utilitários de backend para simplificar a autenticação e o gerenciamento de usuários em seu aplicativo.

Execute o seguinte comando para instalar o SDK:

npm
fio
pnpm
pãozinho
terminal

npm install @clerk/express
Defina suas chaves de API do Clerk
Adicione as seguintes chaves ao seu .envarquivo. Essas chaves sempre podem ser recuperadas na página de de API no Painel do Assistente.

.env

Escola

Escola


CLERK_PUBLISHABLE_KEY=pk_test_ZXhjaXRpbmctYmVlLTYwLmNsZXJrLmFjY291bnRzLmRldiQ
CLERK_SECRET_KEY=sk_test_OY5pXEt9Ar58ptRMEFtkRVhio6TgULp6K6CLxVeuzN
Este guia usa o comando dotenvpara carregar as variáveis ​​de ambiente. Execute o seguinte comando para instalá-lo:

npm
fio
pnpm
pãozinho
terminal

npm install dotenv
Adicione clerkMiddleware()ao seu aplicativo
A clerkMiddleware()função verifica os cookies e cabeçalhos da solicitação para um JWT de sessão e, se encontrado, anexa o objeto  ao objeto sob a chave.Authrequestauth

índice.ts

import 'dotenv/config'
import express from 'express'
import { clerkMiddleware } from '@clerk/express'

const app = express()
const PORT = 3000

app.use(clerkMiddleware())

// Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`)
})
Proteja suas rotas usandorequireAuth()
Para proteger suas rotas, use o requireAuth()middleware. Este middleware funciona de forma semelhante ao clerkMiddleware(), mas também protege suas rotas redirecionando usuários não autenticados para a página de login.

No exemplo a seguir, requireAuth()é usado para proteger a /protectedrota. Se o usuário não estiver autenticado, ele será redirecionado para a página inicial. Se o usuário estiver autenticado, a getAuth()função é usada para obter o userId, que é passado para  para buscar o objeto do usuário atual .clerkClient.users.getUser()User

índice.ts

import 'dotenv/config'
import express from 'express'
import { clerkClient, requireAuth, getAuth } from '@clerk/express'

const app = express()
const PORT = 3000

// Use requireAuth() to protect this route
// If user isn't authenticated, requireAuth() will redirect back to the homepage
app.get('/protected', requireAuth(), async (req, res) => {
  // Use `getAuth()` to get the user's `userId`
  const { userId } = getAuth(req)

  // Use Clerk's JavaScript Backend SDK to get the user's User object
  const user = await clerkClient.users.getUser(userId)

  return res.json({ user })
})

// Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`)
})
Adicionar tipo TypeScript global (opcional)
Se você estiver usando TypeScript, adicione uma referência de tipo global ao seu projeto para habilitar o preenchimento automático e a verificação de tipo para o authobjeto nos manipuladores de solicitação do Express.

Na pasta raiz do seu aplicativo, crie um types/diretório.
Dentro deste diretório, crie um globals.d.tsarquivo com o seguinte código.
tipos /globals.d.ts

/// <reference types="@clerk/express/env" />