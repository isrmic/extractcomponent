## Instalação

  Para instalar rode o comando `npm install -g extractcomponent` .

  É necessário instalar outros 3 pacotes, veja abaixo.

  para react:     `npm install --save babel-preset-react`

  para es2015:    `npm install --save babel-preset-es2015`

  para minificar: `npm install --save babel-preset-babili`

# Iniciando
  Aberto a linha de comando no diretório do projeto rode o comando: `component prepare`, será gerado um arquivo de configuração .
  Deixe as configurações como estão e rode novamente o comando .

# Criando Componente
  * __Vue__
    Crie um arquivo na pasta components que foi gerada chamado, hello-world.html e deixe ele desta forma :
    ```html
      <name>hello-world</name>
      <forcomponent>vue</forcomponent>
      <template>
          <div class="content">
              {{message}}
          </div>
      </template>
      <script>
          data () {
              return {
                  message:'Hello World'
              }
          }
      </script>
      <style>
          .content{
              text-align: center;
              font-weight: bold;
              font-size: 16px;
          }
      </style>
    ```
    Acredito que dá se a entender como funciona isto, porem mais detalhes será falado depois.
    No arquivo html gerado dentro da pasta www, você pode testar o componente usando seu nome desta forma :
    ```html
    ...
    <body>
        <div id = "app">
            <hello-world><hello-world>
        </div>
        <script src = "js/build.components.js"></script>
    </body>
    ...
    ```
    No main.js que foi gerado , deixe-o desta forma :
    ```js
      <{hello-world}/>
      var app = new Vue({
          el:"#app"
      });
    ```
    Após isso rode o comando `component extract`.
    Pronto , se você abrir o arquivo index.html diretamente ou por um servidor estático , você poderá ver o funcionamento do componente.
    Há várias formas de fazer um componente e tem algumas coisas que são importantes saber para funcionarem da forma que espera, por isso recomendo que veja as dicas para que possa fazer tudo corretamente.

    __OBS: você deverá carregar o vuejs no index.html para funcionar corretamente.__

  * __react__
    Aproveitando o que vimos acima vamos resumir algumas coisas.
    Crie o arquivo Hello.html na pasta componente e deixe-o assim:
    ```html
      <name>Hello</name>
      <forcomponent>react</forcomponent>
      <template id = "root">
          <div class="content">
              {this.state.hello}
          </div>
      </template>
      <script>
          constructor(props){
              super(props);
              this.state = {hello:'Hello World'};
          }          
      </script>
      <style>
          .content{
              text-align: center;
              font-weight: bold;
              font-size: 16px;
          }
      </style>
    ```
    No Arquivo Main.js:
    ```js
      <{Hello}/>
    ```
    index.html:
    ```html
    ...
    <body>
        <div id = "root"></div>
        <script src = "js/build.components.js"></script>
    </body>
    ...
    ```
    Agora rode o comando `component extract`.

    Pronto pode testar e ver o seu componente funcionando normalmente.
    
    Para mais detalhes do componente react veja [aqui](https://github.com/isrmic/extractcomponent/blob/master/WriteReact.md) .
