# introdução

O extractcomponent é um simples "extrator" de componentes para as libs vuejs e reactjs, construída baseada no SFC do vue para facilitar a criação de componentes com
essas duas tecnologias, usando syntaxs como html, pug etc , para fácil manutenção e visualização do código .

***obs: para ver as tecnologias usadas, veja as dependências, consulte o package.json.***

## Instalação
***abaixo é pressuposto que você saiba usar a linha de comando e tenha nodejs instalado na máquina.***

Para instalar o extractcomponent simplesmente rode o comando na linha de comando : `npm install -g extractcomponent` e estaremos quase pronto para começar.
É necessário que faça outras 3 instalações de módulos para o melhor funcionamento da ferramenta , rode na sua linha de comando o seguinte :
`npm install --save babel-preset-es2015 babel-preset-babili babel-preset-react`, e agora estamos pronto para iniciar .

# iniciando
**Este inicio é um pouco detalhado demais, caso queira ver algo menos detalhado inicie por [aqui](https://github.com/isrmic/extractcomponent/blob/master/GuideFast.md) .**

Vamos seguir alguns passos para não termos problemas (usaremos a linha de comando com o diretório setado para o do seu projeto ou aonde pretende fazer testes, portanto use um diretório novo unicamente para um teste).
* **1° preparar ambiente**
  * rode o comando `component prepare`, será gerado um arquivo de configuração , nele você verá aonde será salvo script js , css , e seus respectivos nomes (é recomendável por agora deixar como está), rode novamente o comando `component prepare`, nisto será gerado alguns arquivos e criado pastas , onde __components__ é aonde ficará os nossos componentes, __main.js__ o arquivo que usaremos pra escrever os códigos de importação  dos componentes e/ou dependências, e uma pasta chamada __www__, aonde ficará o conteúdo do site, tudo isso é modificável pelo arquivo de configuração gerado, mas vamos deixar assim por enquanto.

    >**obs: não é recomendável em fase de construção dos componentes e testes setar a opção minify para true, pois poderá influenciar no tempo de extração.**

* **escrever componente**
  * Nós podemos escrever componentes em 5 tipos de arquivos (.html, .vue, .react, .pug, .jade), e a forma em que serão tratados é pouco diferente.
  * Para facilitar a criação de um componente vamos utilizar um comando pra isso, é semelhante a : `component new typecomponent:nome-componente`, nisto será gerado um arquivo para escrevermos nosso componente em nossa pasta __components__, então iremos usar um componente vue para exemplo, rode o comando `component new vue:teste-compo`.
  * vamos no nosso arquivo dentro da pasta componentes e vamos começar com algo simples, como um hello world.
  Vamos deixar nosso componente dessa forma:
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
      //main.js
      <{teste-compo}/>      
    ```
    rode o comando: `component extract`, e será gerado o arquivo css externo com todos os styles dos componentes , neste caso somente um, um arquivo chamando 'build.components.js', localizado na pasta 'www/js' como setado na configuração , agora abra o arquivo index.html (certifique-se de estar carregando vue.js e build.components.js) , e coloque dentro do elemento que você está instanciando com o vue o seu componente ficando assim por exemplo:
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
    **obs:** Caso queira pode instanciar o vue dentro do main.js de uma vez para facilitar poderá, ficando assim:
    ```js
      //main.js
      <{teste-compo}/>
      new Vue({
          el:"#app"
      });
    ```
    certifique-se de rodar o comando de extração novamente caso fizer esta alteração para funcionar.
    veja as dicas pois são importantes para um melhor desenvolvimento, e veja como escrever este mesmo componente em react [aqui](https://github.com/isrmic/extractcomponent/blob/master/WriteReact.md).

## Dicas Importantes

  * As extensões .vue e .react são somente pra referência direta do tipo de componente que eles são , para ser extraído de forma correta. Por exemplo, se criarmos um componente num arquivo com a extensão .html para dizer se ele é vue ou react , basta dizer dentro de uma tag chamada __forcomponent__ o tipo do componente ex:
    ```html
      <forcomponent>react</forcomponent>
    ```
    o mesmo vale para extensões .pug e .jade, assim seria como ficaria em pug/jade:
    ```html
      name Compo
      forcomponent react
    ```
  * Os componentes react na hora da importação são tratados segundo a definição de padrões do nome de cada um , em componentes vue eles geralmente tem um nome e um subnome separado pelo caractere "-", ex: my-compo, other-compo ... e no React eles começam por uma letra maiúscula com um único nome ex: Main, Form, Teste ...
  por isso é importante colocar o nome correto na hora da importação do componente.

  * Arquivos componentes .pug e .jade trabalham de uma mesma forma é a mesma interpretação , isso vai de preferência pra quem já tem costume a escrever em uma dessas extensões.

  * __Tag Script__
   Dentro da tag script no componente vue ele vai ser extraído como um objeto e não como um simples código javascript, então é necessário separar por virgulas as suas propriedades por exemplo:
    ```js
      data () {
          return {
              counter:0
          }
      },
      methods:{
          methodTest(){
              this.counter++;
          }
      }
    ```
    Para componentes react este conceito muda um pouco , ele seria extraído como o conteúdo escrito depois da declaração de classe e antes da render function, ex:
    ```js
      constructor(props){
          super(props);
          this.state = {value:''};
      }
    ```
  * __Criar Componente__

    Para agilizar a criação do arquivo componente é recomendável usar o comando `component new type-component:name-component`, aonde "type-component" é o tipo do arquivo componente e "name-component" é o nome do componente.
    O argumento type-component pode receber 1 valor, são 5 diferentes valores (__blank, vue, react, pug, jade__), todos geram arquivos com suas respectivas extensões como o do argumento(vue = .vue, react = .react), exceto o valor "blank" que gera um arquivo html, o que o difere dos demais como .pug .jade é o aproveitamento da syntax em um editor com syntax hilight html, e .vue .react especifica diretamente o tipo de componentes que são , sem a necessidade do uso da tag `<forcomponent></forcomponent>`, então ao rodar o comando : `component new jade:Compo` sera gerado um arquivo na pasta de componentes chamado "Compo.jade" e dentro já setado o nome para "Compo" tendo agora que só setar o tipo de componente(vue ou react) desta forma: `<forcomponent>react</forcomponent>`.

  * __Tag Style__
    Toda vez que é rodado o comando de extração , é lido os valores da tag style de todos os componentes da pasta de componentes e unificados em um único arquivo css que é exportado para a pasta css configurada nas configurações de extração, e se você repetir o nome de uma classe em um dos componentes , ela não vai ser sobrescrita mas sim duplicada no arquivo css exportado , e o que foi escrito na style de um componente pode ser usado chamando a classe por referencia em outro componente, neste caso a tag style tem utilidade somente para organizar melhor os componentes , não deixará nenhuma classe escrita exclusiva para o componente, então é sempre bom tomar cuidado para não cometer mancadas e escrever duas vezes a mesma classe.

  * __Componente Objeto__
    Os componentes vue , podem ser trazidos como referencia de objeto , para se poder usar o Vue-router, por exemplo:
    ao se importar o componente nós escrevemos dessa forma -> `<{compo-vue}/>`, para se usar como objetos pode-se escrever de uma forma diferente para se usar no Vue-router -> `{ path:"/", component:<{{compo-index}}> }` , isto não funciona pra react, seria importado como da forma normal de se importar.

  * __Pug/Jade__ Você pode sem precisar usar arquivos de extensões .pug ou .jade , setar o atributo lang do template principal e dos subcomponentes para "pug" ou "jade" para escreverem componentes usando pug/jade.

    >__obs:__ escreva da forma correta, pois pug é baseado em identação e tem algumas regrinhas um pouco limitadoras mas é bem util , caso não conheça recomendo que leia a documentação caso queira escrever componentes com pug/jade.

# subcomponentes

  Em todos os componentes escritos você pode criar subcomponentes, que na verdade são componentes normais mesmo porem, você escreve o componente normal no arquivo .html .vue .react .jade .pug, e usando uma tag chamada __component__ você pode escrever outros componentes dentro deste arquivo, sendo assim considerado um subcomponente, a syntax é semelhante ao do componente normal porém fica encapsulado na tag component dessa forma:
  ```html
    <component name = "sub-compo">
        <template>
            <div> {{msg}} </div>
        </template>
        <script>
            data () {
                return {
                    msg:'this is a subcomponent'
                }
            }
        </script>
        <style>
            /* folha de estilo */
        </style>
    </component>
  ```
  Estes subcomponentes em vue são todos gerados da mesma forma como o componente principal podendo ser depois chamado desta forma `<sub-compo></sub-compo>` em todos os outros componentes do seu tipo(vue), mas em react esses subcomponentes são como functions components e os principais como componentes de classe, podendo ser chamado os subcomponente dentro da template do componente principal ex:
  ```html
    ...
    <template id = "reactapp">
        <div className="content">
            <Sub content = "this is a content of subcomponent ... " />
        </div>
    </template>
    ...
    <component name = "Sub">
        <template>
            <div> {props.content} </div>
        </template>
    </component>
  ```
  O conceito de extração de componente do react poderia ser bem utilizado nisto se tiver entendimento do que está fazendo.
  Note que a propriedade __name__ é atribuída como o nome do componente , com o qual será chamado depois.

  * Pode-se separar os arquivos de extração , por exemplo , no arquivo de configuração a propriedade "file_nameToRender" aceita um array, e você pode especificar um pra vue outro pra react caso queira ou 2 diferentes só pra vue ou só react ex:
  ```js
    ...
    file_nameToRender:["vuecomponent.js", "reactcomponent.js"]
  ```
  Ambos serão lidos na hora da extração e No fim serão unificados para build.components.js

  Há tmabém uma opção que poderá ser util na hora de escrever componentes , caso vc queira que um desses arquivos passe por uma compilação final antes de serem unificados em um único arquivo , pode-se fazer o seguinte pelas configurações:

  ```js
    final_compiler:{
        presets:[
          "es2015"
        ]
    }
  ```

  Isso fará com que ambos arquivos passem por essa compilação final, caso queira um arquivo especifico :
  ```js
    final_compiler:{
        // presets:[
        //   "es2015"
        // ],
        files:{
            'reactcomponent.js':["es2015","react"]
        }
    }
  ```
# Importações

  O foco desta ferramenta era somente facilitar e estudar extração de componentes, mas devido a necessidade e utilidade , foi feito um mini protótipo de importação , importar componente, script, módulos (com limitações , está incompleto ainda a função).
  Pode-se importar scripts escrevendo em 3 formas diferentes :
  ```js
    import "path/to/script.js"
    import script from "path/to/script.js"
    var script = require('path/to/script');
  ```
  (Neste caso não é bom pensar que funciona como em webpack ou demais ferramentas que usam desta syntax pois é um protótipo incompleto mas funcional em algumas coisas).
  E pode-se importar módulos, baseando-se em que há uma variável module objeto com .exports com valor do módulo, ele procura em node_modules pelo nome do modulo dentro da pasta dist com o nome do módulo + extensão final igual a .js, caso não existir não carrega-o e pode gerar uma falha, e pode-se importar das seguintes formas:
  ```js      
    import script from "module"
    var module = require('module');
  ```
  Em vue e react funcionaram normal que era o principal foco, e alguns demais scripts caso houvesse a exportação do valor por meio da exportação como em nodejs:
  ```js
    //module1.js
    function sum(a,b){
        return a + b;
    }
    module.exports = sum;

    //main.js
    var sum = require('module1.js');
    console.log(sum(1, 1));

    import module1 from "module1.js" //aspas são opcional
    console.log(module1(1,1));
  ```
  Podemos usar isso para fazer importações de componentes também , apesar da forma inicial ser simples e prática , vai de cada um como quer escrever, então aqui está alguns exemplos:
  ```js
    import {<Compo/>}
    import {<my-compo/>}
    import Componente from {<my-compo/>}
    import Compo from test-compo.pug //.pug,.jade,.html,.vue/.react
    import Compo from "./App.jsx"
  ```  
  Em alguns casos de importação como ao importar um arquivo jsx teria de de indicar o que está exportando ex:
  ```js
  //App.jsx
  import { Component } from "react"
  class App extends Component{
      render(){
          return (
              <div>Componente a ser exportado, funct component <Sub content = "this is a content" /> </div>
          );
      }
  }
  function Sub (props) {
      return <div>{props.content}</div>
  }
  //1°
  export default App; // == module.export = App;
  //2°
  export {App, Sub};
  //3°
  export App;
  export Sub;

  //main.js
  //1°
  import App from "./App.jsx"
  //2° && 3°
  import { App, Sub } from "./App.jsx" // component is App && Sub
  import App from "./App.jsx" // component is App.App && App.Sub  
  ```
  A importação funciona ou por nome do componente (caso importado usando {<name-component/>}) ou pelo nome do arquivo do componente , que no fim resulta no mesmo. Pode ser usado para um especifico script que você criou também como no exemplo do jsx servira pra um arquivo js também, desde que siga as instruções corretamente.
  >>OBS: este sistema de importações está em fase de estudo e foi feito para estudo , podendo conter falhas, não foi usando um pacote secundário para fazê-las.

  __Dica__: Pode ser que na hora de importar um modulo da node_modules , tenha que especificar manualmente o diretório , há duas formas de fazer isso , importando direto pelo diretório : `import Module from "node_modules/module/index.js"`, ou setando no arquivo de configuração , ficando da seguinte forma :

  ```js
    ...
    load_modules:{
        'name-module':{
            path:'name-module/dist/index.js'
        }
    }
  ```
# Observação final

  Esta é uma simples ferramenta desenvolvida para estudo próprio e para facilitar nas coisas que havia feito , como recentemente com essa ferramenta construí um app para professor achei que me atenderia porque queria algo simples, espero ser de utilidade.
  Esta documentação pode ser reescrita afim de haver melhoras na explicação de como usar e citar novos recursos se houverem .
  Foi desenvolvida com pouco conhecimento nas duas tecnologias (vue, react) e poderá sofrer alterações futuras, devido a boas práticas e uma forma melhor de desenvolver pra essas tecnologias usando tecnicas que os desenvolvedores geralmente usam.
