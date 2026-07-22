# FAESDE.COM

Site institucional e painel administrativo da FAESDE para cursos técnicos EAD, certificação por competência, pós-técnicos, certificados e gestão de arquivos EAD.

## Tecnologias

- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- Supabase
- Node.js

## Comandos

```sh
npm install
npm run dev
npm run build
npm run start
```

## Estrutura Principal

- `src/pages`: páginas públicas e páginas do painel admin.
- `src/components`: componentes visuais reutilizáveis.
- `server/index.mjs`: servidor Node usado em produção para APIs, arquivos EAD, SEO dinâmico, sitemap e redirecionamentos.
- `public/eadplataforma`: cache público dos materiais EAD leves sincronizados.
- `public/eadplataforma-drive-manifest.json`: manifesto de sincronização Drive/GitHub.
- `supabase/migrations`: scripts SQL do banco.
- `docs`: documentação operacional do projeto.

## SEO e Indexação

O servidor injeta metatags por rota, gera `sitemap.xml`, entrega `robots.txt`, redireciona URLs antigas e aplica `X-Robots-Tag` em áreas que não devem aparecer no Google.

Arquivos EAD em `/eadplataforma/` devem continuar acessíveis para alunos, mas não devem ser indexados como páginas comerciais de curso.

## Deploy

O deploy de produção roda pelo Coolify a partir da branch `main`.
