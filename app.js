let db;
const request=indexedDB.open('builderPM',1);
request.onupgradeneeded=e=>{db=e.target.result;if(!db.objectStoreNames.contains('projects')){db.createObjectStore('projects',{keyPath:'id',autoIncrement:true})}};
request.onsuccess=e=>{db=e.target.result; if(location.pathname.endsWith('index.html')){loadProjects()} else {loadProject()}};

function saveProject(project,callback){const tx=db.transaction('projects','readwrite');const store=tx.objectStore('projects');store.put(project);tx.oncomplete=()=>callback()}
function loadProjects(){const ul=document.getElementById('projects');ul.innerHTML='';const tx=db.transaction('projects','readonly');const store=tx.objectStore('projects');store.openCursor().onsuccess=e=>{const cursor=e.target.result;if(cursor){const li=document.createElement('li');li.textContent=cursor.value.name+' ('+cursor.value.client+')';li.onclick=()=>{location.href='project.html?id='+cursor.value.id};li.ondblclick=()=>{const n=prompt('Edit project name',cursor.value.name);if(n){cursor.value.name=n;saveProject(cursor.value,loadProjects)}};ul.appendChild(li);cursor.continue()}}}
document.getElementById('addProjectBtn')?.addEventListener('click',()=>{const name=document.getElementById('projectName').value;const client=document.getElementById('projectClient').value;const deadline=document.getElementById('projectDeadline').value;if(!name) return;saveProject({name,client,deadline,tasks:[],costs:[],notes:'',photos:[]},()=>{document.getElementById('projectName').value='';document.getElementById('projectClient').value='';document.getElementById('projectDeadline').value='';loadProjects()})});

function loadProject(){const params=new URLSearchParams(location.search);const id=Number(params.get('id'));const tx=db.transaction('projects','readonly');const store=tx.objectStore('projects');store.get(id).onsuccess=e=>{const project=e.target.result;if(!project) return;document.getElementById('projectTitle').textContent=project.name;document.getElementById('notesInput').value=project.notes;loadTasks(project);loadCosts(project);loadPhotos(project);window.currentProject=project}};
function saveCurrentProject(){if(window.currentProject){saveProject(window.currentProject,()=>{})}}

function loadTasks(project){const ul=document.getElementById('taskList');ul.innerHTML='';project.tasks.forEach((t,i)=>{const li=document.createElement('li');li.textContent=t.text;li.ondblclick=()=>{const newText=prompt('Edit task',t.text);if(newText){t.text=newText;saveCurrentProject();loadTasks(project)}};li.onclick=()=>{if(confirm('Delete task?')){project.tasks.splice(i,1);saveCurrentProject();loadTasks(project)}};ul.appendChild(li)})}
function addTask(){const input=document.getElementById('taskInput');if(!input.value) return;window.currentProject.tasks.push({text:input.value});input.value='';saveCurrentProject();loadTasks(window.currentProject)}

function loadCosts(project){const ul=document.getElementById('costList');ul.innerHTML='';let total=0;project.costs.forEach((c,i)=>{const li=document.createElement('li');li.textContent=c.desc+': $'+c.amount;total+=Number(c.amount);li.ondblclick=()=>{const desc=prompt('Edit cost desc',c.desc);const amt=prompt('Edit amount',c.amount);if(desc&&amt){c.desc=desc;c.amount=amt;saveCurrentProject();loadCosts(project)}};li.onclick=()=>{if(confirm('Delete cost?')){project.costs.splice(i,1);saveCurrentProject();loadCosts(project)}};ul.appendChild(li)});document.getElementById('totalCost').textContent=total}

function addCost(){const desc=document.getElementById('costDesc').value;const amt=document.getElementById('costAmount').value;if(!desc||!amt) return;window.currentProject.costs.push({desc,amount:amt});document.getElementById('costDesc').value='';document.getElementById('costAmount').value='';saveCurrentProject();loadCosts(window.currentProject)}

function saveNotes(){window.currentProject.notes=document.getElementById('notesInput').value;saveCurrentProject();alert('Notes saved')} 

function loadPhotos(project){const div=document.getElementById('photoGallery');div.innerHTML='';project.photos.forEach((p,i)=>{const img=document.createElement('img');img.src='photos/'+p;img.style.width='100px';img.style.margin='5px';img.onclick=()=>{if(confirm('Delete photo?')){project.photos.splice(i,1);saveCurrentProject();loadPhotos(project)}};div.appendChild(img)})}
function addPhoto(){const f=document.getElementById('photoFile').value;if(!f) return;window.currentProject.photos.push(f);document.getElementById('photoFile').value='';saveCurrentProject();loadPhotos(window.currentProject)}
