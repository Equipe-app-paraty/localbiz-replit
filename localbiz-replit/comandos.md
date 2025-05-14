## Arquivo docker-compose.yml
O arquivo docker-compose.yml está localizado no diretório raiz do projeto ( c:\Users\User\Desktop\Projetos\trae\localbiz ), não no diretório backend. Isso significa que você deve executar os comandos docker-compose a partir do diretório raiz, não do diretório backend.

## Correção dos Comandos
Aqui está a sequência correta de comandos a serem executados:

# Navegue até a pasta raiz do projeto (onde está o docker-compose.yml)
cd c:\Users\User\Desktop\Projetos\trae\localbiz

# Pare o container atual
docker-compose down

# Reconstrua a imagem com as novas dependências
docker-compose build

# Inicie o container novamente
docker-compose up -d

Após reiniciar os containers, verifique os logs para garantir que tudo está funcionando corretamente:
docker-compose logs -f backend  


## Passos para Configurar Corretamente
1. Certifique-se de que o backend está rodando :
cd c:\Users\User\Desktop\Projetos\trae\localbiz
docker-compose ps

### 3. Limpe e Reinicie o Docker Completamente
Para garantir que todas as alterações sejam aplicadas, execute estes comandos para limpar e reiniciar tudo:
# Pare todos os containers
docker-compose down

# Remova os containers parados (opcional)
docker container prune -f

# Remova as imagens antigas (opcional)
docker image prune -f

# Reconstrua as imagens
docker-compose build --no-cache

# Inicie os containers novamente
docker-compose up -d
### 4. Verifique os Logs
Após reiniciar, verifique os logs para confirmar que as variáveis estão sendo lidas corretamente:
docker-compose logs -f backend


ngrok http 3000