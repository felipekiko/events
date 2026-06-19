# Padrões de Desenvolvimento de Jogos

## Arquitetura e Game Loop

- Utilizar o padrão de game loop com `requestAnimationFrame` para renderização suave a 60fps
- Separar claramente as fases de **update** (lógica) e **render** (desenho) no loop principal
- Usar delta-time para cálculos de física, garantindo comportamento consistente em diferentes taxas de frame
- Aplicar clamping no delta-time (máximo 250ms) para evitar "teleportação" ao retornar de abas inativas
- Organizar o código em componentes com responsabilidade única (Ghost, PipeManager, CollisionDetector, etc.)

## Gerenciamento de Estado

- Definir estados de jogo como valores discretos (`start`, `active`, `gameOver`)
- Transições de estado devem ser explícitas e centralizadas em um método `transition(newState)`
- Nunca processar input em estados que não o aceitam
- Implementar cooldowns adequados entre transições (ex: 500ms antes de permitir restart)

## Física e Movimento

- Toda movimentação deve ser multiplicada por `deltaTime` para independência de framerate
- Velocidades em pixels por segundo (px/s), gravidade em px/s²
- Aplicar caps de velocidade (terminal velocity) para evitar comportamentos erráticos
- Posição = posição anterior + velocidade × deltaTime

## Colisão

- Usar AABB (Axis-Aligned Bounding Box) para detecção de colisão em jogos 2D simples
- Bounding boxes devem ser ligeiramente menores que o sprite visual para uma experiência mais "justa"
- Verificar colisão com limites da tela (topo e fundo) separadamente dos obstáculos
- Colisão deve ser verificada após o update de posição, antes do render

## Configuração e Tunagem

- Externalizar todos os parâmetros tuníveis (gravidade, velocidade, gaps, etc.) em um arquivo `config.json`
- Sempre fornecer valores padrão hardcoded como fallback caso o arquivo de config não carregue
- Usar deep merge para combinar config carregado com defaults, preservando campos não especificados
- Validar ranges de valores na configuração e substituir valores inválidos pelos defaults

## Renderização (Canvas 2D)

- Limpar o canvas inteiro a cada frame antes de desenhar
- Renderizar em camadas ordenadas: background → obstáculos → jogador → UI/overlay
- Usar `ctx.save()` e `ctx.restore()` ao aplicar transformações (rotação, translação)
- Sprites devem ser pré-carregados antes do início do game loop
- Fornecer fallback visual (forma geométrica simples) caso um sprite falhe ao carregar

## Áudio

- Áudio é funcionalidade não-crítica: falhas de carregamento/reprodução nunca devem travar o jogo
- Usar `try/catch` em toda operação de áudio
- Criar novas instâncias de `Audio` ou clonar para permitir sobreposição de sons
- Resetar `currentTime = 0` antes de `play()` para reprodução imediata

## Input

- Suportar múltiplas fontes de input (teclado, mouse/click, touch) normalizadas para uma única ação
- Filtrar eventos de repetição de tecla (`event.repeat === true`)
- Input deve ser desabilitado durante estados que não aceitam interação
- Prevenir comportamentos padrão do browser (scroll em Space, zoom em touch)

## Pontuação e Persistência

- Usar `localStorage` para persistência de high score
- Sempre wrappear acesso a `localStorage` em try/catch (pode estar indisponível)
- High score só pode crescer monotonicamente (nunca diminuir)
- Pontuação incrementa exatamente uma vez por obstáculo ultrapassado (usar flag `scored`)

## Tratamento de Erros

- O jogo nunca deve crashar: erros devem ser capturados e tratados graciosamente
- Se um valor se torna `NaN`, clampar para 0 e logar warning
- Falhas de rede/fetch devem resultar em fallback para defaults, não em tela em branco
- Exibir mensagem amigável se o browser não suportar Canvas

## Estrutura de Arquivos

```
project-root/
├── index.html          # Entry point, canvas element, carrega game.js
├── config.json         # Configuração externa (parâmetros tuníveis)
├── game.js             # Módulo principal do jogo (toda lógica)
└── assets/             # Sprites, sons e recursos visuais
```

## Testes

- Propriedades de corretude devem ser testadas com property-based testing (fast-check)
- Mínimo de 100 iterações por propriedade
- Testes unitários para cenários específicos e edge cases
- Lógica de jogo (física, colisão, pontuação) deve ser testável isoladamente, sem dependência de DOM/Canvas
- Separar lógica pura de side-effects para facilitar testabilidade

## Convenções de Código (JavaScript/Vanilla)

- Usar classes ES6+ para componentes do jogo
- Sem frameworks, sem build tools: o jogo roda diretamente no browser
- Um único arquivo `.js` como módulo principal
- Nomes de variáveis e funções em inglês, camelCase
- Comentários explicativos em trechos complexos de física ou matemática
- `const` por padrão, `let` quando reatribuição é necessária, nunca `var`
