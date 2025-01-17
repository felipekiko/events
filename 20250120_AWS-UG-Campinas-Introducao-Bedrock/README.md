# AWS User Group Angola: Amazon Bedrock: Primeiros passos com Generative AI (Agosto/ 2024)

## Etapas da Demonstração

1. Exibição do Bedrock no Console da AWS
1. Exibição do Continue.dev
    1. Configuração no VS Code
1. Criação ambiente local
    1. `sam init`
    1. `sam local invoke`
    1. `sam deploy --guided`
1. Testes da URL do API Gateway no Postman
1. Modificações
    1. Template para aceitar POST
    1. Modificar Lambda
        1. Permissões
        1. Timeout
1. Deploy!
1. Criação do HTML
    1. Prompt utilizado:
    `Por favor, me gere uma página HTML que tenha um campo texto para o usuário inserir um prompt e um botao enviar. Ao clicar em enviar ele vai consumir a API POST https://ID.execute-api.us-east-1.amazonaws.com/Prod/hello enviando o texto no formato json com o json "{ "prompt": "AQUI VAI O QUE A PESSOA DIGITOU" }" no body. A reposta da api sera: { "answer": "RESPOSTA GERADA PELA API" }. O valor do "answer" deve ser colocado na tela, mantendo o historico anterior`
1. Testes!