todo=[];
Var.render(`todo`,`
<div>
    <strong>
        [this.name]
    </strong>  :  
    [this.desc]
    <button onclick="deleteTodo([this.name])">
    delete
    </button>
</div>
`);
const addTodo=()=>{
    const name=prompt("name");
    const desc=prompt("description");
    todo.push({name:name,desc:desc});
    todo=todo;
}
const deleteTodo=name=>{
    const num=todo.find(element=>element.name==name)
    todo.splice(num,num);
}