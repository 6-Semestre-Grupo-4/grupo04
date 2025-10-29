# Como Contribuir

Para manter nosso histórico de commits organizado e legível, usamos o [**Commitizen**](https://commitizen.github.io/cz-cli/) e as convenções do [**Conventional Commits**](https://www.conventionalcommits.org/pt-br/v1.0.0/).
Isso garante que todas as mensagens de commit sigam um padrão e facilita a geração de changelogs e o versionamento automático.

⚠️ **É obrigatório o uso do Commitizen para submeter código.**
Qualquer commit que não seguir o padrão **não passará** no nosso pipeline de integração contínua (CI).

---

## Usando o Commitizen

Em vez de usar o comando `git commit` diretamente, utilize o script de commit do projeto:

```bash
npm run commit
```

Ao executar este comando, você será guiado por um **questionário interativo** que irá montar a mensagem do commit para você.

---

## Estrutura do Questionário

- **Tipo de alteração**: Escolha o tipo de mudança que você está fazendo
  **Exemplo:** `feat` (nova funcionalidade), `fix` (correção de bug), `docs` (documentação)

- **Escopo (opcional)**: Indique a parte do projeto afetada pela mudança
  **Exemplo:** `autenticacao`, `api`, `ui`

- **Descrição**: Escreva uma breve e objetiva descrição da alteração

---

> Ao seguir esses passos, sua mensagem de commit estará automaticamente no padrão correto, garantindo que seu código seja aprovado no pipeline de forma rápida.

## Rodar teste

Dentro da pasta do `accountflow-api` rodar:

```python
python manage.py test backend
```
