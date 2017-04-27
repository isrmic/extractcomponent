# introdução
O extractcomponent é um simples "extrator" de componentes para as libs vuejs e reactjs, constuída baseada no SFC do vue para facilitar a criação de componentes com
essas duas tecnologias, usando syntaxes diferentes como html, pug etc , para fácil manutenção e visualização do código .
***obs: para ver as tecnologias usadas, veja as dependências, consulte o package.json.***

## Instalação
***abaixo é pressuposto que você saiba usar a linha de comando e tenha nodejs instalado na máquina.***
Para instalar o extractcomponent simplesmente rode o comando na linha de comando : `npm install -g extractcomponent` e estaremos quase pronto para começar.
É necessário que faça outras 3 instalações de módulos para o melhor funcionamento da ferramenta , rode na sua linha de comando o seguinte :
`npm install --save babel-preset-es2015 babel-preset-babili babel-preset-react`, e agora estamos pronto para iniciar .

# iniciando
Vamos seguir alguns passos para não termos problemas.
* ***1° preparar ambiente***
  * rode o comando `component prepare`, será gerado um arquivo de configuração , nele você verá aonde será salvo script js , css , e seus respectivos nomes (é recomendável por agora deixar como está), rode novamente o comando `component prepare`, nisto será gerado alguns arquivos e criado pastas , onde __components__ é aonde ficará os nossos componentes, __main.js__ o arquivo que usaremos pra escrever os códigos de importação  dos componentes e/ou dependências, e uma pasta chamada __www__, aonde ficará o conteúdo do site, tudo isso é modificável pelo arquivo de configuração gerado, mas vamos deixar assim por enquanto.
  >***obs: não é recomendável em fase de construção dos compoentes e testes setar a opção minify para true, pois poderá influênciar no tempo de extração.***

* ***escrever componente***
  * Nós podemos escrever componentes em 3 tipos de arquivos (.html, .vue, .react, .pug, .jade), e a forma em que serão tratados é pouco diferente.
  * Para facilitar a criação de um componente vamos utilizar um comando pra isso semelhante a : `component new typecomponent:nome-componente`, nisto será gerado um arquivo para escrevermos nosso componente em nossa pasta __components__, então vamos criar um componente vue, rode o comando `component new vue:teste-compo`.
  * vamos no nosso arquivo dentro da pasta componentes e vamos começar com algo simples como um hello world vamos deixar nossa estrutura dessa forma:
    ```html
      <name>teste-compo</name>

      <template>
          <div class="content">
              <h1 class = "hw">{{message}}</h1>
          </div>
      </template>

      <script>
        data () {
            return {
              message:'hello world'
            }
        }
      </script>

      <style>
        .hw{
            color: darkcyan;
        }
      </style>

    ```
* ***extrair componente***
  * Para extrair é bem simples e há várias formas , mas mostrarei neste inicio somente um, abra o arquivo main.js, e escreva o seguinte trecho:
    ```js
      <{teste-compo}/>      
    ```
    rode o comando: `component extract`, e será gerado o arquivo css externo com todos os styles dos componentes , neste caso somente um, um arquivo chamando 'build.components.js', localizado na pasta 'www/js' como setado na configuração , agora abra o arquivo index.html (certifique-se de estar carregando vue.js e build.components.js) , e coloque dentro do elemento que vc está instanciando com o vue o seu componente ficando assim por exemplo:
    ```html
      ...
      <body>
          <div id = "app">
              <teste-compo><teste-compo>
          </div>
          <script src = "js/build.components.js"></script>
      </body>
    ```
    agora você pode ver isto rodando no navegador e deve aparecer seu componente funcionando.
    **obs:** Caso queira pode instanciar o vue dentro do main.js de uma vez para facilitar , ficando assim:
    ```js
      <{teste-compo}/>
      new Vue({
          el:"#app"
      });
    ```
    certifique-se de rodar o comando de extração novamente caso fizer esta alteração para funcionar.
    veja as dicas pois são importantes para um melhor desenvolvimento.
