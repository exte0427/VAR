# Var.JS
```
Easy, Powerful, and Simple FrameWork for Web.
```

## Why Var.JS
+ Easy and powerful
+ Good to learn
+ Fast and Light

## How to Load
it's simple. one thing that you have to do is just load Var.js before your scripts.
```html
<script type="text/javascript" src="./var.js"></script>
<script type="text/javascript" src="./script.js"></script>
```

## How to Use
1. make sure your variable is in **var tag**
```html
<body>
    <var>myVariable</var>
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
myVariable.render = `<strong><var>this.data</var></strong>`;
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
element.render = `<div><var>this.name</var> :  <var>this.des</var></div>`;
element = todo;
```
this is great example. it will be work like
```
breakfast : eat
lunch :  eat
dinner :  eat
```
## Version 1
