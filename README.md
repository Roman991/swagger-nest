error

` Error  The "@nestjs/swagger" plugin is not compatible with Nest CLI. Neither "after()" nor "before()" nor "afterDeclarations()" function have been provided.`

steps to reproduce:

```sh
  
  cd ./monorepo/
  pnpm i --force
  pnpm --filter api dev
 
```
