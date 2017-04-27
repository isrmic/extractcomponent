## iniciando
  ***todos os comandos realizados, será na linha de comando com o diretório do seu projeto.***
  pressupondo que já escreveu um componente hello world em vue , agora vamos escrever este mesmo em react.
  Usando o mesmo comando passado vamos criar um componente , `component new blank:Teste`, vamos até este componente gerado e vamos começar a monta-lo.
  Foi gerado algo com uma estrutura semelhante a esta :
  ```html
  <name>Teste</name>

  <forcomponent></forcomponent>

  <template>

  </template>

  <script>

  </script>
  ```
  vamos colocar dentro da tag __forcomponent__ o tipo de componente, neste caso é "react", e vamos montar o layout deste componente para ficar como o outro , vai ficar parecido com isso :
  ```html
  <name>Teste</name>

  <forcomponent>react</forcomponent>

  <template id = "reactapp">
    <div class="content">
        <h1 class = "hw">{message}</h1>
    </div>
  </template>

  <script>
  constructor(props){
      super(props);
  }
  --:      
      const message = "Hello World";
  --;
  </script>

  <style>
  .hw{
      color: darkcyan;
  }
  </style>
  ```
  __Repare que foi atribuido um id para o template, isso significa que queremos que ele renderize este componente no elemento html com id 'reactapp'.__
  caso não se satisfaça com isso e gostaria por exemplo de passar propriedades a este componente pode fazer manualmente a declaração de renderização dentro de uma tag chamada render , ex:
  ```html
    <render>
        ReactDOM.render(
          <Teste props = {...props} />,
          document.getElementById('reactapp')
        );
    </render>
  ```
  Agora no seu index html (certifique-se de que está incluso a biblioteca react na sua pagina de teste) crie o elemento div com id reactapp.
  No arquivo main.js vc faz a mesma coisa como no componente vue anterior basta escrever assim:
  ```js
    <{Teste}/>
  ```
  Na linha de comando rode o comando `component extract`, e abra sua pagina index.html e veja que o resultado é o mesmo do componente vue , um hello world com a cor cyano escuro .

# observações
  * Alem do id do template pra poder setar qual elemento vai renderizar o componente , teve algo incomum no código se reparou bem , que foi o uso de __--:, --;__, isso devido a forma que é extraído o componente react , foi usado para servir de delimitador do escopo antes da função render antes de return , para uso de variaveis criação de elementos com condições etc ...

  * Você pode usar syntax jsx para manipular o dom com condições como em jsx normalmente no template, um exemplo seria :
    ```html
    <div className = "content">
    {this.state.value ?
        <div>is true</div> :
        <div> is false</div>
    }
    </div>
    ```

# Pug/Jade
  Não muito diferente da forma que escrevemos o componente anterior, vamos escreve-lo no formato pug/jade o que acho até bem eficiente já que escreve menos código, vamos lá, para criar o componente basta rodar o comando `component new pug:Pugc`, agora editando o arquivo que foi gerado vamos deixa-lo desta forma :

  ```html
  name Pugc
  forcomponent react

  template#reactapp2
    div(className = "content")
      h1(className = "hw") {message}
  script.
    constructor(props){
        super(props);
    }
    --:      
        const message = "Hello World";
    --;
  style.
    .hw{
        color: darkcyan;
    }
  ```
  importe o componente, rode o comando de extração e agora no seu index.html adicione o elemento div com id reactapp2 e abra seu index.html terá o mesmo resultado do componente anterior. Você também pode setar a propriedade lang da tag template para pug ou jade tanto do componente principal como do subcomponente ex:
  ```html
    <template id = "reactapp" lang = "pug">
        <!-- context -->
    </template>
    ...
    <component name = "Test">
        <template lang = "jade">
            <!-- context -->
        </template>
    </component>
  ```
  __OBS:__ em pug/jade você pode usar as features de include de script, style, dentre outros , caso não conhece e deseja escrever componentes dessa forma recomendo que veja a documentação: [pug/jade](https://pugjs.org/) .
