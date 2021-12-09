    //config menu module    

    function toggleConfigMenu() { // esconde el el menu
        var menuList = document.getElementById("menu");
        if (menuList.className == "menuOff") {
            menuList.className = "menuOn";
        } else {
            menuList.className = "menuOff";
        }
    };
    
    var bodyElem = document.getElementsByTagName("body")[0];


    const setBgColor = (value) => {
        //no imprime el value por eso se hace con el document. en vez de el value, arreglar
        bodyElem.setAttribute("style","background: " + document.getElementById("bgColorInput").value + ";");
    };

    // seguro sea necesario meterlo en el DOMready event para que funcione

    let gradientDegre = 90; // declaracion mas una configuracion inicial

    document.getElementById("degSelect").addEventListener("mousedown", event => {
        const retDeg = () => {
            let x = event.pageX - $('#degSelect').offset().left - 25 ; //  el menos 25 es por el padding tanto horizontal como vertical que tiene el div
            let y = event.pageY - $('#degSelect').offset().top - 25; //  con esta resta los valores son [-25,25] en vez de [0,40]
            x = -x; // sino se ve invertido el degrade, removerlo y probar, se rompe
            y = -y; // invierte el valor asi mas arriba da positivo y mas abajo negativo en vez de al revez
            let deg = Math.atan2(y,x) * 180 / Math.PI;
            deg = (deg <= 0 ) ? deg + 360 : deg;
            document.getElementById("degSelect").setAttribute("style",'background: linear-gradient('+(deg-90)+'deg,'+document.getElementById("gradient1").value+','+ document.getElementById("gradient2").value +');');
            return deg;
        }

        gradientDegre = retDeg();   
    });


    const setBgGradient = () => {
        gradientDegre = Math.floor(gradientDegre);
        bodyElem.setAttribute("style",'background: linear-gradient('+(gradientDegre-90)+'deg,'+document.getElementById("gradient1").value+','+ document.getElementById("gradient2").value +');');
        // se agrego un tag html{} para arreglarlo, buscar otra idea.
    };


    const setBgImage = () => {
        bodyElem.setAttribute("style","background-image: url('" + document.getElementById("imageInput").value + "');");

    };


    // time module

    const getLocalTime = () =>{
        let date = new Date();
        let dayNumber = date.getDay();
        let hour = date.getHours();
        let minute = date.getMinutes();
        let ampm = hour >= 12 ? 'PM' : 'AM';
        let dayNames = ["LUN", "MAR", "MIE", "JUE", "VIE","SAB", "DOM"];
        
        hour = hour % 12;
        hour = hour ? hour : '12';
        hour = hour < 10 ? '0' + hour : hour;
        minute = minute < 10 ? '0' + minute : minute;
        
        document.getElementById("locaTime").innerHTML = dayNames[dayNumber] + " | " + hour + ":" + minute + " | " + ampm;
    };
    
    const updateTimeSpent = () => {
        timeSpent.s++;
        if (timeSpent.s == 60){ // paso minuto
            timeSpent.s = 0;
            timeSpent.m++;
            if (timeSpent.m == 60){ // paso hora
                timeSpent.m = 0;
                timeSpent.h++;
            }
            getLocalTime();  // si paso un minuto actualiza el reloj        
        }
        document.getElementById("timeSpent").innerHTML = timeSpent.h + ":" + timeSpent.m + ":" + timeSpent.s ; // actualiza el contador de horas
        localStorage.setItem("timeSpent",JSON.stringify(timeSpent)); // guarda horas sumadas
        setTimeout(updateTimeSpent, 1000); // prepara proximo tick en 1 segundo
    };


    // nav bar component
    function changeState(id){ //declarado abajo del todo en la inicializacion (en dom ready event)
        if (id != currentState){
            replaceState(id);
        }
    };

    const replaceState = id => {
        document.getElementById(currentState).setAttribute("class","");
        document.getElementById(id).setAttribute("class","nb-item-selected");
        currentState=id;
    }



    { // todo component

        // needed variables
        var UserTasks; // variable para el manejo de todo el listado como arreglo de objetos
        var globalCounter = 0; // variable escencial para el borrado de elementos del todo

        // carga desde la memoria
        function inicializarTodo (){
            // carga container en el elemento main
            document.getElementsByTagName("main")[0].innerHTML = 
            `<div id="tdUser1">
                <div class="tdUserName round-top"><input id="userName" class="tdUserName" type="text"placeholder="username" style="outline: none;text-align: center;; background-color: transparent; border: none;"></div>  
                    <div id="tdUser1-input" class="tdUserName" style="background: linear-gradient(180deg, rgba(0, 0, 0, 0.392)65%, rgba(0, 0, 0, 0.592)100%);display: flex; justify-content: space-evenly;">
                        <input autocomplete="off" class="round-bottom round-top" style="background-color: rgba(121, 92, 134, 0.315); border: none; height: 35px; color: white;margin-bottom: 10px;margin-top: 2px/*sacar*/;" type="text" name="newTask" id="taskInput" placeholder="metele las tareas de tu sueños">
                        <button id="taskBtn" style="padding: 0px 0px 2px 0px;margin-bottom: 10px; width: 50px;" class="btnDone" onclick="createAndInsertTask();">add</button>
                    </div>             
                    <div id="User1list" class="round-bottom"></div>
            </div>`;


            if (localStorage.getItem("user1") === null) {   // crea un archivo todo en localStorage
                UserTasks = [ {name: "gonzalo"} ];
                UserTasks.push({TaskIs:"el valor abajo del reloj marca el tiempo que pasaste en la pagina" , state:false });
                UserTasks.push({TaskIs:"clickeando en el logo de 'Gn-Bn' abris el menu de configuraciones" , state:false });
                localStorage.setItem("user1",JSON.stringify(UserTasks));
            }
            else {   // recupera archivo todo en localStorage
                UserTasks = localStorage.getItem("user1");
                UserTasks = JSON.parse(UserTasks);
            }

            document.getElementById("userName").value = UserTasks[0]; // carga el nombre de usuario o id del todo actual
            for (i = 1; i < UserTasks.length; i++){ //carga las tareas de la memoria
                addToList(UserTasks[i],i);
            }
            

            // carga eventos
            document.getElementById("taskInput").addEventListener("keydown", event =>{ // estaba anidado adentro de un focus event con el mismo get document y al de este evento se le removia
                if (event.code == "Enter" || event.code == "NumpadEnter")
                createAndInsertTask();
            });
    
            document.getElementById("userName").addEventListener("keydown", event => saveUserNameInput());
        }

        function createAndInsertTask(){
            let UserInput = document.getElementById("taskInput").value;

            if (UserInput!= ""){
                let taskToAdd = {TaskIs : UserInput , state : false};
                addToList( taskToAdd , UserTasks.length + globalCounter);

                UserTasks.push(taskToAdd);
                localStorage.setItem("user1",JSON.stringify(UserTasks)) 
            }
            document.getElementById("taskInput").value = "";
        }  

        function addToList(task,i){                    
            let list = document.getElementById("User1list").innerHTML;
            let UserInput = task.TaskIs;
            
            let newTask = {};
            newTask.idNumber = i + globalCounter ;

            newTask.text = '<button id="d'+ newTask.idNumber +'"class="btnDel" onclick="this.parentElement.remove();handleDeletion(this.id);"><i class="fa fa-close"></i></button><button id="b'+ newTask.idNumber + '" class="btnUndone" onclick="toggleTaskStatus(this.id);"><span>done</span></button> <div id="t' + newTask.idNumber +  '" class="todo-undone "> ' + UserInput + ' </div>  ';
            
            newTask.div = document.createElement('div');
            newTask.div.setAttribute("id","todo"+newTask.idNumber);
            newTask.div.setAttribute("class","list-elements-center");

            newTask.div.insertAdjacentHTML("afterbegin", newTask.text);
            document.getElementById("User1list").insertAdjacentElement("beforeend",newTask.div);

            if (task.state){
                toggleTaskStatus("b" + (i + globalCounter))
            }
        }

        function toggleTaskStatus(id){
            let TaskNum = id.replace('b','');
            
            let tdElem = document.getElementById("todo"+TaskNum);
            
            tdElem.btn = document.getElementById("b"+TaskNum);
            tdElem.text = document.getElementById("t"+TaskNum);

            if (tdElem.btn.className == "btnUndone") {
                tdElem.btn.className = "btnDone" ;
                tdElem.text.className = "todo-done";
                UserTasks[TaskNum-globalCounter].state = true;
                tdElem.btn.innerHTML = "<span>undone</span>";

            } else {
                tdElem.btn.className = "btnUndone" ;
                tdElem.text.className = "todo-undone";
                UserTasks[TaskNum-globalCounter].state = false;
                tdElem.btn.innerHTML = "<span>done</span>";
            }
            localStorage.setItem("user1",JSON.stringify(UserTasks));
        }

        function handleDeletion(id){
            let TaskNum = id.replace('d','');
            globalCounter++;
            UserTasks.splice(TaskNum,1);
            localStorage.setItem("user1",JSON.stringify(UserTasks));
        }

        const saveUserNameInput = () => {            
            setTimeout(() => {
                UserTasks[0] = document.getElementById("userName").value;
                localStorage.setItem("user1",JSON.stringify(UserTasks));
            }, 5); // se le metio un timeout por que sino se rompe y no funciona y cuando lo meto en el eventhandler que lo trigerea q saveusername se llame con retraso no fnciona
        }  
    }


// "Main"


// variablle global principal
let currentState = "todo-nb"; // variable que define la applicacion que se esta usando actualmente, las aplicaciones aparecen en el navbar, todolist por default deberia estar definida con bar
let timeSpent;
document.addEventListener('DOMContentLoaded', event => {
    // carga inicial de memoria local
    if (localStorage.getItem("timeSpent")===null){ // tiempo de usuario en la pagina
        timeSpent = {h:00,m:00,s:00};
    } else{
        timeSpent = JSON.parse(localStorage.getItem("timeSpent"));
    }

    // cargar configuracion del usuario


    // cargar ultima tarea hecha

    
    // inicializacion de funcionalidades
    getLocalTime();
    updateTimeSpent();
    inicializarTodo();
    gApi();
});

    function gApi() {
    }
