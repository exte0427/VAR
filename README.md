**Do not use Var.JS**, it's so unstable.    
Next Update will be.. `뭘 하긴 했는데 성과가 없어서 1일 1커밋 하루 날로먹을꺼임ㅎ`   
    
<img src="https://ifh.cc/g/6OipzO.png"  width="140" height="51">

```
Easy, Powerful, and Simple FrameWork for Web.
```

## Why Var.JS
+ Easy and powerful
+ Good to learn
+ Fast and Light

## How to Load
load Var.js before your scripts.    
and use `<load>` to load your scripts.  
`<load>src<load>`
```html
<script type="text/javascript" src="./var.js"></script>
<load>script.js</load>
```

## How to Use
1. make sure your variable is in **var tag**
```html
<body>
    [myVariable]
</body>
```
2. set the variable, but don't **declare it**
```js
myVariable = "hello there";
```
3. **it's done!** Var.JS will automatically change the var tag if the variable is changed

## Functions
### render
render can assist displaying the variables
```js
myVariable = "hello there";
Var.render(myVariable,`<strong><var>this.data</var></strong>`);
```
the result of this code will be  
**hello there**         
although the variable is changed, the render will be apply

### array
in Var.JS, array will be work   
```js
let todo=[
    {name:"breakfast",des:"eat"},
    {name:"lunch",des:"eat"},
    {name:"dinner",des:"eat"},
];
Var.render(element,`<div><var>this.name</var> :  <var>this.des</var></div>`);
element = todo;
```
this is great example. it will be work like
```
breakfast : eat
lunch :  eat
dinner :  eat
```
