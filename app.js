import {
 INVALID_FIRST_NAME,
 INVALID_LAST_NAME,
 INVALID_AGE,
 INVALID_GENDER,
 INVALID_NICK_NAME,
 INVALID_EMAIL,
 INVALID_PASSWORD,
 INVALID_PASSWORD_2,
 ERROR_ACCESSING_DATABASE,
 NO_USER_FOUND,
 INVALID_INPUT,
 host,
 JSESSIONID,
 origin
} from './constants.js'

import {
  getCookie,
  setCookie,
  deleteCookie
} from './cookies.js'

let User = null;

let guestData = {
  users: [
    {
      id: 1,
      nick_name: 'Alice'
    },
    {
      id: 2,
      nick_name: 'Bob'
    }
  ],
  posts: [
    {
      id: 1,
      user_id: 1,
      nick_name: 'Alice',
      number_of_comments: 1,
      date: 1716890218512,
      content: "Welcome to Green Chat Forum",
      categories: ['green apple', 'green grapes']
    },
    {
      id: 2,
      user_id: 2,
      nick_name: 'Bob',
      number_of_comments: 2,
      date: 1716892672989,
      content: "What are the best greens?",
      categories: ['green apple', 'green grapes', 'green pears']
    }
  ],

  comments: [
    {
      id: 1,
      post_id: 1,
      user_id: 2,
      user_nick_name: 'Bob',
      date: 1716893048825,
      content: 'Hi everyone'
    },
    {
      id: 2,
      post_id: 2,
      user_id: 1,
      user_nick_name: 'Alice',
      date: 1716893189700,
      content: 'Hi Bob'

    },
    {
      id: 3,
      post_id: 2,
      user_id: 2,
      user_nick_name: 'Bob',
      date: 1716893199317,
      content: 'Hi Alice'
    }
  ],
  categories: ['green apple', 'green grapes', 'avocado', 'green pears']
}  

const m1 = {
  online_users : [
    {
      id: 1,  nick_name: 'Alice', on_line: 'false'
    },
    {
      id: 2,  nick_name: 'Bob', on_line: 'false'
    },
  ]
}

const m2 = {
  online_users : [
    {
      id: 1,  nick_name: 'Alice', on_line: 'true'
    },
    {
      id: 2,  nick_name: 'Bob', on_line: 'false'
    },
  ]
}

const m3 = {
    content: 'Hey',
    date: 123,
    from_id: 1,
    from_nick_name: 'Alice',
    id: 1,
    to_id: -1
}
const messages = [];

//let socket = new WebSocket("ws://localhost:8080/ws");
let socket;

renderMainPage();

function renderLogInForm(e) {
  if (e) e.preventDefault();

  let content = `<div class="container">
    <div class="wrapper">
      <div class="title"><span>Login Form</span></div>
      <form action="/signin">

      <span id='signin-error' class="signin-error-lable"></span>

        <div class="row">
          <i class="fas fa-user"></i>
          <input id="signin-username-input" class='login-input' type="text" placeholder="Email or Nick Name" value='guest' required>
        </div>
        <div class="row">
          <i class="fas fa-lock"></i>
          <input id="signin-password-input" class='login-input' type="password" placeholder="Password" required value='guest'>
        </div>        
        <div class="row button">
          <input id='signin-submit-button' type="button" value="Login">
        </div>
        <div class="signup-link">Not a member? <a href='/' id='signup-link-anchor'>Signup now</a></div>
      </form>
    </div>
  </div>`;

  document.body.innerHTML = content;

  document.body.style.backgroundColor = '#1abc9c';

  //Set click listeners
  document.getElementById('signup-link-anchor').addEventListener('click', renderRegistrationForm, false);
  document.getElementById('signin-submit-button').addEventListener('click',signInHandler, false);

}

function renderRegistrationForm(e) {
  if (e) e.preventDefault();

  let content = `<div class="container">
    <div class="wrapper">
      <div class="title"><span>Registration Form</span></div>
      <form action="/signup">      
            
        <span id='registration-input-first-name-error' class="registration-error-lable"></span>
        <div class="row">                
            <input id='registration-input-first-name'  type="text" placeholder="First Name" required>
        </div>
        
        <span id='registration-input-last-name-error' class="registration-error-lable"></span>
        <div class="row">      
            <input id='registration-input-last-name' type="text" placeholder="Last Name" required>
        </div>
        
        <span id='registration-input-age-error' class="registration-error-lable"></span>
        <div class="row">      
          <input id='registration-input-age' type="number"  placeholder="Age" required>
        </div>   
        
        <span id='registration-input-gender-error' class="registration-error-lable"></span>
        <div class="row">      
          <select name="gender" id="registration-input-gender" placeholder="gender" required>
            <option value="" disabled selected>Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
            <option value="Prefer Not To Say">Prefer Not To Say</option>
          </select>
        </div>   
       
        <span id='registration-nick-name-error' class="registration-error-lable"></span>
        <div class="row">      
          <input  id='registration-input-nick-name' type="text" placeholder="Nick Name" required>
        </div>

        <span id='registration-email-error' class="registration-error-lable"></span>
        <div class="row">      
        <input id='registration-input-email' type="email" placeholder="Email" required>       
        </div>

        <span id='registration-password-error' class="registration-error-lable"></span>
        <div class="row">      
          <input id='registration-input-password' type="password"  placeholder="Password" required>
        </div>

        <span id='registration-password2-error' class="registration-error-lable"></span>
        <div class="row">      
          <input id='registration-input-password2' type="password" placeholder="Repeat Password" required>
        </div>
        <div class="row button">
            <input id='registration-submit-button' type='button' value="Submit">
        </div>
        <div class="signup-link">Member? <a href='/' id='login-link-anchor'>Login now</a></div>
      </form>
    </div>
  </div>`;

  document.body.innerHTML = content;
  //Set click listeners
  document.getElementById('login-link-anchor').addEventListener('click', renderLogInForm, false);
  document.getElementById('registration-submit-button').addEventListener('click',signUpHandler, false);

}

function signInHandler(){
  let userNameNode = document.getElementById('signin-username-input');
  let userName = userNameNode.value;

  let passwordNode = document.getElementById('signin-password-input');
  let password = passwordNode.value;


  if(userName === 'guest' && password === 'guest'){
    User = {
      id: -1, 
      nick_name: 'Guest'
    }
    renderGuestPage(guestData);
    handleWSMessage(m1);
    setTimeout(() => {
      const el = document.querySelector('#active-users');
      el.innerHTML = '';
      handleWSMessage(m2);
      setTimeout(() => {
        const date = (new Date()).getTime();
        m3.date = date;
        messages.push(m3);
        handleWSMessage({message: m3});
      }, 3000)
    }, 3000);

    return;
  } 

  const endpoint = host+"signin";    
  let headers = new Headers();
  headers.append('Accept', 'application/json');
  headers.append('Content-Type','application/x-www-form-urlencoded');
  fetch(endpoint, {
      method: 'POST',
      headers: headers,
      body: new URLSearchParams({
        'user_name' : userName,
        'password' : password
      })
  })
  .then(response => response.json())
  .then(data =>{  
    if(data.error){      
      showSignInError(data.error);     
    }else{      
      setCookie(JSESSIONID, data.payload.user.session_id, 1);
      renderMainPage();
    }
  }); 

}

function signUpHandler(){
    let firstNameNode = document.getElementById('registration-input-first-name');
    let first_name = firstNameNode.value;

    let lastNameNode = document.getElementById('registration-input-last-name');
    let last_name = lastNameNode.value;
    
    let ageNode = document.getElementById('registration-input-age');
    let age = ageNode.value;

    let genderNode = document.getElementById('registration-input-gender');
    let gender = genderNode.value;

    let nickNameNode = document.getElementById('registration-input-nick-name');
    let nick_name = nickNameNode.value;

    let emailNode = document.getElementById('registration-input-email');
    let email = emailNode.value;

    let passwordNode = document.getElementById('registration-input-password');
    let password = passwordNode.value;

    let password2Node = document.getElementById('registration-input-password2');
    let password2 = password2Node.value;

    const endpoint = host+"signup";  
    let headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-Type','application/x-www-form-urlencoded');
    fetch(endpoint, {
        method: 'POST',
        headers: headers,
        body: new URLSearchParams({
          'first_name' : first_name,
          'last_name' : last_name,
          'age' : age,
          'gender': gender,
          'nick_name' : nick_name,
          'email' : email,
          'password' : password,
          'password2' : password2
        }), 
    })
    .then(response => response.json())
    .then(data =>{
        if(data.error){
        showSignUpError(data.error);
      }else{        
        setCookie(JSESSIONID, data.payload.user.session_id, 1);      
        renderMainPage();       
      }
    });   
    
}

function showSignInError(error){

  switch(error.type){
    case ERROR_ACCESSING_DATABASE:
      setError('signin-username-input', 'signin-error', error);
      setError('signin-password-input', 'signin-error', error);
    break;
    case NO_USER_FOUND:
      setError('signin-username-input', 'signin-error', error); 
      setError('signin-password-input', 'signin-error', error);      
    break;
    default:
      errorHandler(error);
    break;
  }
}

function showSignUpError(error){
    resetErrors();
    
    switch(error.type){
        case INVALID_FIRST_NAME:
          setError('registration-input-first-name', 'registration-input-first-name-error', error);
        break;        
        
        case INVALID_LAST_NAME:
          setError('registration-input-last-name', 'registration-input-last-name-error', error);
        break;

        case INVALID_AGE:
          setError('registration-input-age', 'registration-input-age-error', error);
        break;

        case INVALID_GENDER:
          setError('registration-input-gender', 'registration-input-gender-error', error);
          break;

        case INVALID_NICK_NAME:
          setError('registration-input-nick-name', 'registration-nick-name-error', error);
        break;

        case INVALID_EMAIL:
          setError('registration-input-email', 'registration-email-error', error);
        break;

        case INVALID_PASSWORD:
          setError('registration-input-password', 'registration-password-error', error);
        break;
        case INVALID_PASSWORD_2:
          setError('registration-input-password2', 'registration-password2-error', error);
        break;

        default:
          errorHandler(error);
          break;
      }
  
}

function setError(input, lable, error){
  let inputNode = document.getElementById(input);
  let lableNode = document.getElementById(lable);
  lableNode.style.display = 'block';
  lableNode.innerText = `${error.message}`
  inputNode.style.borderColor = 'red';
  inputNode.style.borderWidth = '2px';
}

function resetErrors(){
    let lables = document.querySelectorAll('.registration-error-lable');
    lables.forEach(item => {
      item.style.display = 'none';
      item.innerText = '';
    });


    let nodes = [];
    nodes.push(document.querySelector('#registration-input-first-name'));
    nodes.push(document.querySelector('#registration-input-last-name')); 
    nodes.push(document.querySelector('#registration-input-age'));
    nodes.push(document.querySelector('#registration-input-gender'));     
    nodes.push(document.querySelector('#registration-input-nick-name'));  
    nodes.push(document.querySelector('#registration-input-email'));  
    nodes.push(document.querySelector('#registration-input-password'));  
    nodes.push(document.querySelector('#registration-input-password2'));      
    nodes.forEach(node => {
      node.style.borderColor = '#16a085';
      node.style.borderWidth = '1px';
    })
}

function renderMainPage(){

 let session_id = getCookie(JSESSIONID);

  if (!session_id) {
    renderLogInForm();
    return;
  }

  const endpoint = host+"home?";
  let headers = new Headers();
  headers.append('Accept', 'application/json');
  fetch(
    endpoint + new URLSearchParams({session_id}),
    {method: 'GET', headers: headers}
  )
  .then(response => response.json())
  .then(data =>{  
      if(data.error){     
      errorHandler(data.error);
      return;
    }
    if(data.payload == null){
      renderLogInForm();
      return;
    }

    if(data.payload.user){      
      User = data.payload.user     
    }else{
      renderLogInForm();
      return;
    }
    
    //Rendering main page
    document.body.style.backgroundColor = '#fff';   

    //Nav Bar
    let navBarHtml = createNavBar(data.payload.user);

    //List of active users
    let contentActiveUsers = `<div id="active-users"></div>`;

    //Posts
    let contentPosts = `<div class="posts-container" id="posts-container">`;
    
    if(data.payload.posts.length == 0){
      contentPosts+=`<div class="no-posts-message">No Posts Yet</div>`
    }

    data.payload.posts.forEach(post => { contentPosts += createPostElenemt(post, true) });   
  
    
    contentPosts+=`</div>`;

    //Messages
    let contentMessages = createMessagesSection();

    //Work window container
   let  contentworkingWindow = `
   <div class="working-window">
      ${contentActiveUsers}
      ${contentPosts}
      ${contentMessages}   
   </div>`;


    let mainWindow = `
    <div class="main-container">
    ${navBarHtml}
    ${contentworkingWindow}
    </div>`
    document.body.innerHTML = mainWindow;

   
    document.getElementById('navigation-controls-sign-out').addEventListener('click', () => {
      signOutHandler(data.payload.user);
    });

    document.getElementById('navigation-controls-new-post').addEventListener('click', () => {
       renderNewPostPage(data.payload.user);
    });

    document.getElementById('posts-container').addEventListener('click', (event)=>{
      
      let el = event.target;
      do{       
        if(el.className ==='post-container clickable-box'){
          let postId = el.dataset.id;
          if(postId){
            renderCommentsPage(postId);
            break;
          }
        }
        const id = el.dataset.id;
        if(id) {
          renderMainPage();
          break;
        }

        el = el.parentElement;
        if(el==null) break;
      }while(el.id !='posts-container')
    });

    document.getElementById('send-message-button').addEventListener('click', () =>{
      let message = document.getElementById('new-message-text-area').value;
      let  session_id = getCookie(JSESSIONID);
      if (!session_id){
        renderLogInForm();
        return;
      }
      let to_id = document.getElementById('chat-messages').dataset.to_id;

      let headers = new Headers();
      headers.append('Accept', 'application/json');
      headers.append('Content-Type','application/x-www-form-urlencoded');
      fetch(host+"message", {
          method: 'POST',
          headers: headers,
          body: new URLSearchParams({
            'message' : message,
            'session_id' : session_id,
            'to_id': to_id
          })
      })
      .then(response => response.json())
      .then(data =>{ 
        let newMessageErrorElement = document.getElementById('new-message-error');   
        if(data.error){ 
          if(data.error.type === INVALID_INPUT){           
            newMessageErrorElement.style.display = 'block';
            newMessageErrorElement.innerText = data.error.message;
          }else{
            showSignInError(data.error);  
          }          
        }else{
          newMessageErrorElement.style.display = 'none';
          document.getElementById('new-message-text-area').value = '';        
        }
      }); 
    });   

    document.getElementById('chat-messages').addEventListener('scroll', throttle((event)=>{
      const {scrollHeight, scrollTop, clientHeight} = event.target;  
      if (Math.abs(scrollHeight - clientHeight - scrollTop) < 1) {
        loadMoreMessages();
      }   
    }, 1000));
    
    makeWebSocketConnection(data.payload.user.session_id);        
  }); 
      
} 

function renderNewPostPage(user){
  
  let session_id = getCookie(JSESSIONID);

  if (!session_id) {
    renderLogInForm();
    return;
  }

  //verify user and get categories
  const endpoint = host+"newpost?";
  let headers = new Headers();
  headers.append('Accept', 'application/json');
  fetch(
    endpoint + new URLSearchParams({session_id}),
    {method: 'GET', headers: headers}
    )
  .then(response => response.json())
  .then(data => {
    if(data.error){     
      errorHandler(data.error);
      return;
    }
    if(data.payload == null){
      renderLogInForm();
      return;
    }
    if(data.payload.user == null){
      renderLogInForm();
      return;
    }

 //Rendering new post page
 document.body.style.backgroundColor = '#fff';
 
 
 //Nav Bar
  let content = createNavBar(user);


    //Categories select

    let categoriesElements = `
    <select  name="list_categories" id="list_categories">
    <option value="Add Category:">Add Category:</option>
    </select>
    <br>
    <ul id="selected_categories"></ul>
    `;

    //New Post Form
      content += `
        <div class="new-post-container">
          ${categoriesElements}
          <span id="new-post-error-message"></span>
          <textarea id="new-post-textarea" class="new-post-textarea" name="new-post" rows="10" placeholder="Type your post here..."></textarea> 
          <div class="new-post-submit-button-container">
            <input id="new-post-submit-button" class="new-post-submit-button" type="button" value="Post">
          </div>   
        </div>`;

        document.body.innerHTML = content;

        let j = JSON.parse(data.payload.categories);
        let listCategories = document.getElementById('list_categories');
        let options = `<option value="Add Category:">Add Category:</option>`;
        j.forEach(category => {
          options+=` <option value="${category}">${category}</option>`;
        });
        listCategories.innerHTML = options;

        document.getElementById('navigation-controls-sign-out').addEventListener('click', () => {
          signOutHandler(user);
        });

        document.getElementById('navigation-controls-new-post').style.display = 'none';

        document.getElementById('new-post-submit-button').addEventListener('click', () => {
          let content = document.getElementById('new-post-textarea').value;
          let selectedCategories = document.getElementById('selected_categories').children;
          let categories = [];
          for(let i = 0; i< selectedCategories.length; i++){
            categories.push(selectedCategories[i].textContent.trim());
          }
          newPostHandler(content, JSON.stringify(categories));   
        }); 

        document.getElementById('list_categories').addEventListener('input', onInput);  
        document.getElementById('selected_categories').addEventListener('click', e => {
          if(e.target.tagName === 'li'){
            removeElementFromList(e.target.innerText);
          }
        });

        document.getElementById('navigation-controls-home').addEventListener('click', ()=>{
          renderMainPage();
        });

  });

}

function signOutHandler(user){
  let session_id = getCookie(JSESSIONID);
  if(session_id){
    deleteCookie(JSESSIONID);
    const endpoint = host+"signout";    
    let headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-Type','application/x-www-form-urlencoded');
    fetch(endpoint, {
      method: 'POST',
      headers: headers,
      body: new URLSearchParams({
        'session_id' : session_id       
      })
    }).then(response => response.json())
    .then(data => {
      if(data.error != null){
        errorHandler(data.error);
      }else{
        renderLogInForm();   
      }
    });
  }
}

function newPostHandler(content, categories){
  let session_id = getCookie(JSESSIONID);

  const endpoint = host+"newpost?" + new URLSearchParams({session_id});    
  let headers = new Headers();
  headers.append('Accept', 'application/json');
  headers.append('Content-Type','application/x-www-form-urlencoded');
 
  fetch(endpoint, {
    method: 'POST',
    headers: headers,
    body: new URLSearchParams({
      // 'session_id' : session_id,
      'content' : content,
      'categories': categories
    })
  })
  .then(response => response.json())
  .then(data =>{  
    
    if(data.error){
      if(data.error.type === INVALID_INPUT){
        let errorMessageElement = document.getElementById('new-post-error-message');
        errorMessageElement.style.display = 'block';
        errorMessageElement.innerText = data.error.message;
      }else{
        errorHandler(data.error);  
      }        
    }else{
      renderMainPage();       
    }
  });
}

function errorHandler(error){
  alert(`Error type: ${error.type}. \nError message: ${error.message}`);  
}

function makeWebSocketConnection(session_id){    
  
   //Try to make connection
  //socket = new WebSocket(`ws://localhost:8080/ws/${session_id}`);
    socket = new WebSocket(`ws://${origin}/ws/${session_id}`);
    //Set Listeners
    socket.onopen = () => {}
    socket.onclose = event => {}
    socket.onerror = error => {
      alert('Connection error ', error);
    }
    socket.onmessage = (message) => {
      let m = JSON.parse(message.data.toString())   
      handleWSMessage(m);
    }    
}

function handleWSMessage(m){

  if(m.online_users){

    let activeUsersElement = document.getElementById('active-users');

    if(m.online_users.length == 0){
      activeUsersElement.style.display = 'none';
    }
    else{
      if(activeUsersElement.style){
        activeUsersElement.style.display = 'block';
      }        
    }

    document.getElementById('active-users').innerHTML = '';
    let online_users = m.online_users;  
  
    online_users.forEach(user => {     

        let div = document.createElement('div');
        div.classList.add('on-line-user-container');
        
        if(user.on_line === 'true'){
          div.innerHTML = `
          <img src="images/user_online.svg" alt="User OnLine"  width="36" height="36"> 
          <span class="user-element-nick-name">${user.nick_name}</span>`;
        }else{
          div.innerHTML = `
          <img src="images/user_offline.svg" alt="User OffLine"  width="36" height="36"> 
          <span class="user-element-nick-name">${user.nick_name}</span>`;
        }

        div.addEventListener('click', e => {
          const chatArea = document.querySelector('#user-messages-container');
          const messageBox = document.querySelector('#new-message-text-area');
          const sendButton = document.querySelector('#send-message-button');  

          if(!e.currentTarget.classList.contains('user-selected')){
            removeUsersSelection();  
            document.getElementById('chat-messages').dataset.to_id = user.id;
            document.getElementById('current-chatmate-container').innerText = `Chat with: ${user.nick_name}`;                
            document.getElementById('chat-messages').dataset.page = 1;
            document.getElementById('new-message-error').style.display = 'none';
            chatArea.style.display = 'block';
            messageBox.style.display = 'block';
            sendButton.style.display = 'block';
            getMessages(user.id);
            div.classList.add('user-selected');  
          } else {
            removeUsersSelection();
            chatArea.style.display = 'none';
            messageBox.style.display = 'none';
            sendButton.style.display = 'none';                
          }

        });
        document.getElementById('active-users').appendChild(div);
    }); 
  }
  
  if(m.message){        
    let chatMessagesElement = document.getElementById('chat-messages');
    let msg = document.createElement('div');
    let header = document.createElement('div');
    header.classList.add('message-header');
    let body = document.createElement('div');
    body.classList.add('message-body');
    msg.appendChild(header);
    msg.appendChild(document.createElement('hr'));
    msg.appendChild(body);
    let date = (new Date(m.message.date)).toUTCString().slice(0, -3);

    if(m.message.from_id === User.id){
      //My Message      
      msg.classList.add("my-message-bubble"); 
      header.innerHTML = `You <br> ${date}`;  
      body.innerText = m.message.content;
      chatMessagesElement.insertBefore(msg, chatMessagesElement.childNodes[0]);
    }else if(m.message.to_id === User.id){
      //Mate's message
      if(document.getElementById('user-messages-container').style.display === 'block'){
        msg.classList.add("mate-message-bubble");
        header.innerHTML = `${m.message.from_nick_name} <br> ${date}`;
        body.innerText = m.message.content;
        chatMessagesElement.insertBefore(msg, chatMessagesElement.childNodes[0]);
      }else{
        let users = document.querySelectorAll('.user-element-nick-name');  
        for(let i = 0; i<users.length; i++ ){
          if(users[i].innerText === m.message.from_nick_name){
            users[i].click();
            break;            
          }
        }
      }
    }
  }
}

function getMessages(chat_mate_id){

  //Guest
  if(User.id === -1) {
   // const m = messages.filter(ms => ms.from_id === User.id || ms.to_id === User.id)
    const m = messages.filter(ms => (ms.from_id === User.id && ms.to_id === chat_mate_id) || (ms.from_id === chat_mate_id && ms.to_id === User.id))
    const data = {
      chat_mate_id,
      error: null,
      messages: m,
      user_id: -1
    }
    renderMessages(data);
    return;
  }


  let session_id = getCookie(JSESSIONID);

  if (!session_id) {
    renderLogInForm();
    return;
  }

  //Get page 
  let page = document.getElementById('chat-messages').dataset.page

  const endpoint = host+"messages";  
  let headers = new Headers();
  headers.append('Accept', 'application/json');
  headers.append('Content-Type','application/x-www-form-urlencoded');
  fetch(endpoint, {
      method: 'POST',
      headers: headers,
      body: new URLSearchParams({
        'page' : page,
        'session_id' : session_id,
        'chat_mate_id' : chat_mate_id
      }), 
  })
  .then(response => response.json())
  .then(data =>{
    if(data.error){
      showSignUpError(data.error);
    }else{
       if(data.messages.length>0){
         renderMessages(data);     
       }else{
        // Handle last page of messages
        let chatMessagesElement = document.getElementById('chat-messages');
        let page = parseInt(chatMessagesElement.dataset.page);
        if(page){
          if(page>1){
            chatMessagesElement.dataset.page = page - 1;            
          }else{
            chatMessagesElement.dataset.page = 1;
          }
        }  
       }        
    }
  });
 
}

function renderMessages(data){
  let chatMessagesElement = document.getElementById('chat-messages');

  data.messages.forEach(m => {

    let msg = document.createElement('div');
    let header = document.createElement('div');
    header.classList.add('message-header');
    let body = document.createElement('div');
    body.classList.add('message-body');
    msg.appendChild(header);
    msg.appendChild(document.createElement('hr'));
    msg.appendChild(body);    

    let date = (new Date(m.date)).toUTCString().slice(0, -3);

    if(m.from_id === data.user_id){
      //My Message      
      msg.classList.add("my-message-bubble"); 
      header.innerHTML = `You <br> ${date}`;  

      body.innerText = m.content;

    }else if (m.from_id === data.chat_mate_id){
      //Mate's message
     msg.classList.add("mate-message-bubble");
     header.innerHTML = `${m.from_nick_name} <br> ${date}`;
     body.innerText = m.content;

    }else{
      //KGB message
      msg.classList.add("kgb-message-bubble");
      header.innerHTML = `kgb <br> ${date}`;
      body.innerText = m.content;
    }   
   
    chatMessagesElement.appendChild(msg);
  });
}

function removeUsersSelection(){
    let element = document.getElementById('chat-messages');
  
    delete element.dataset.to_id;

    let users = document.getElementById('active-users').childNodes;
    for (let i = 0; i< users.length; i++){
      let user = users[i];
      user.classList.remove('user-selected');
    }

    document.getElementById('chat-messages').innerHTML = '';

}

function loadMoreMessages(){
  let chatMessagesElement = document.getElementById('chat-messages');    
    let page = parseInt(chatMessagesElement.dataset.page);
    if(page){          
      chatMessagesElement.dataset.page = page+1;
      getMessages(chatMessagesElement.dataset.to_id);
    }
}

function throttle(fn, ms){
  let block = false;
  let blockedArgs;
  let blockedContext;
  function wrapper(){
      if(block){
          blockedArgs = arguments;
          blockedContext = this;
          return;
      } 
      fn.apply(this, arguments);
      block = true;
      
      setTimeout(()=>{
          block = false;
          if(blockedArgs){
              wrapper.apply(blockedContext, blockedArgs); 
              blockedContext = null;
              blockedArgs = null;               
          }
      }, ms);
  }
  return wrapper;
}

function onInput(){
  let list = document.getElementById("list_categories");
  let optionValue = list.value;
  let selectetCategories = document.getElementById("selected_categories");

  //1 Add element to Selected Categories and Update categoties
  const node = document.createElement("li");
  const textnode = document.createTextNode(optionValue + "   ");
  node.appendChild(textnode);
  selectetCategories.style.display = "inline";
  node.addEventListener("click",function(e){      
      removeElementFromList(optionValue); 
  });
   if (optionValue != "no categoty"){
    selectetCategories.appendChild(node);               
   }
  //2. Remove element from list
  var newOptions = '';
  for (let i = 0; i< list.options.length; i++){
     let ov = list[i].value;
     if (ov != optionValue){
      newOptions+='<option value="' + ov + '" >' + ov + '</option>';
     }      
  }
  list.innerHTML = newOptions;
}

function removeElementFromList(option){ 
//1. Remove from selected_categories <ul>
let selectedCategories = document.getElementById("selected_categories").getElementsByTagName("li");
  for (let i=0; i< selectedCategories.length; i++){
      let val = selectedCategories[i].innerHTML;
      if(val.includes(option)){
          selectedCategories[i].remove();
      }
  }
  if (selectedCategories.length == 0){
      document.getElementById("selected_categories").style.display = "none";
  }
  //2. Add element to list_categories
  var list = document.getElementById("list_categories");
  let newOptions = '';
  for (let i = 0; i< list.options.length; i++){
  let ov = list[i].value;  
  newOptions+='<option value="' + ov + '" >' + ov + '</option>';      
  }
  newOptions+='<option value="' + option + '" >' + option + '</option>';
  list.innerHTML = newOptions;
}

function renderCommentsPage(post_id){

  let session_id = getCookie(JSESSIONID);

  if (!session_id) {
    renderLogInForm();
    return;
  }

  const endpoint = host+"comments?";
  let headers = new Headers();
  headers.append('Accept', 'application/json');
  fetch(
    endpoint + new URLSearchParams({session_id, post_id}),
    {method: 'GET', headers: headers}
    )
  .then(response => response.json())
  .then(data => {

    if(data.error){     
      errorHandler(data.error);
      return;
    }
    if(data.payload == null){
      renderLogInForm();
      return;
    }
    if(data.payload.user == null){
      renderLogInForm();
      return;
    }

    //Rendering main page
    document.body.style.backgroundColor = '#fff';   
    
     //Create post element
      let postElement = '';
      if(data.payload.post!=null){   
        postElement = createPostElenemt(data.payload.post);
      }

      //Get comments
      let commentsHtml = 'No comments yet';
      if(data.payload.comments!=null && data.payload.comments.length>0){    
        commentsHtml = '';
        
        data.payload.comments.forEach(comment => {
          commentsHtml += createCommentElement(comment)
        })
      }


      //Create comment section
      let newCommentElement = createNewCommentSection();

      
      let middleSection = `
          <div class="middle-section">            
            ${postElement}
            <div class="comments-container">${commentsHtml}</div> 
            <span id="new-comment-error"></span>                     
            <div class="new-comment-section">${newCommentElement}</div>         
          </div>     
      `;

      document.getElementById('posts-container').innerHTML = middleSection;

      document.getElementById('new-comment-submit-button').addEventListener('click', event=>{
          //1.Get Info from Text Box
          let comment = document.getElementById('new-comment-textarea').value;

          //2. Send Comment via POST request

          session_id = getCookie(JSESSIONID);

          if (!session_id) {
            renderLogInForm();
            return;
          }

          let post_id = document.getElementsByClassName('post-container')[0].dataset.id;

          const endpoint = host+"comments?" + new URLSearchParams({session_id});
          let headers = new Headers();
          headers.append('Accept', 'application/json');
          headers.append('Content-Type','application/x-www-form-urlencoded');
          fetch(endpoint, {
              method: 'POST',
              headers: headers,
              body: new URLSearchParams({
                // 'session_id': session_id,
                'post_id': post_id, 
                'comment' : comment                
              })
            })
              .then(response => response.json())
              .then(data => {
                if(data.error){
                  if(data.error.type === INVALID_INPUT){
                    let newCommentErrorElement = document.getElementById('new-comment-error');
                    newCommentErrorElement.style.display = 'block';
                    newCommentErrorElement.innerText = data.error.message;
                  }else{  
                    errorHandler(data.error); 
                  }                
                                
                }else{
                //3.Back to main page
                  renderMainPage();
                }

              })         

        
      });

      document.getElementById('navigation-controls-sign-out').addEventListener('click', () => {
        signOutHandler(data.payload.user);
      });

      document.getElementById('navigation-controls-home').addEventListener('click', ()=>{
        renderMainPage();
      });
  });

}

//Factories

function createCommentElement(comment){

  let date = (new Date(comment.date)).toUTCString().slice(0, -3);

  let commentElement = `
    <div class="comment-container">
      <div class="comment-header">
      ${comment.user_nick_name}
      <br>
      ${date}
      </div> 
      <hr>
      <div class="comment-content">
      ${comment.content}
      </div>
    </div> 
  `
  return commentElement
}

function createNavBar(user){
  return `<div class="navigation-bar">
  <div class="navigation-controls">
      <div>
        <input id="navigation-controls-home" type="image" src="images/home.svg" alt="Home" width="24" height="24">
      </div>
      
      <div class="navigation-controls-user">
        <div class="welcome-message">${user.nick_name}</div> 
        <input id="navigation-controls-new-post" type="image" src="images/new_post_icon.png" alt="New Post" width="24" height="24">
        <input id="navigation-controls-sign-out" type="image" src="images/exit_icon.png" alt="Sign Out" width="21" height="21">  
      </div>    
  </div>    
</div>`;
}

function createPostElenemt(post, isActive){
  let date = (new Date(post.date)).toUTCString().slice(0, -3);
  let post_categories = "<ul>"
  post.categories.forEach(category =>{
    post_categories+=`<li>${category}</li>`
  });
  post_categories+="</ul>"

  let content = `<div class="post-container" data-id="${post.id}">`;
  if(isActive === true){
    content = `<div class="post-container clickable-box" data-id="${post.id}">`
  }

  content += `
  <div class="post-header">
  <div>${post.nick_name}</div>
  <div>${date}</div>        
  </div>
  <div class="post-content">${post.content}</div>   
  <div class="post-footer">
  ${post_categories}
  <div>Comments: ${post.number_of_comments}</div>
  </div>  
 
  </div>`;
  return content;  
}

function createMessagesSection(){
  return `
  <div class="user-messages-container" id="user-messages-container">
    <div id="current-chatmate-container"></div>
    <div class="chat-messages" id="chat-messages"></div>
    <span id="new-message-error"></span>
    <textarea id="new-message-text-area" placeholder="Type your message here"></textarea>
    <input type="button" value="Send" id="send-message-button">    
  </div>`;
}

function createNewCommentSection(){
  return  `
  <textarea id="new-comment-textarea" class="new-post-textarea" name="new-comment" rows="3" placeholder="Type your comment here..."></textarea> 
  <div class="new-post-submit-button-container">
    <input id="new-comment-submit-button" class="new-post-submit-button" type="button" value="Comment">
  </div>     
`
}

function renderGuestPage(){
    const user = {
      id: -1,
      nick_name: "Guest"
    }
    
    const posts = guestData.posts.sort((a,b) =>{
      if(a.id < b.id){
        return 1
      }
      return -1;
    })

    //Rendering main page
    document.body.style.backgroundColor = '#fff';
    //Nav Bar
    let navBarHtml = createNavBar(user);
    //List of active users
    let contentActiveUsers = `<div id="active-users"></div>`;
    //Posts
    let contentPosts = `<div class="posts-container" id="posts-container">`;    
    if(posts.length == 0){
      contentPosts+=`<div class="no-posts-message">No Posts Yet</div>`
    }
    posts.forEach(post => {contentPosts += createPostElenemt(post, true) });    
    contentPosts+=`</div>`;
    //Messages
    let contentMessages = createMessagesSection();
    //Work window container
    let  contentworkingWindow = `
    <div class="working-window">
        ${contentActiveUsers}
        ${contentPosts}
        ${contentMessages}   
    </div>`;
    let mainWindow = `
    <div class="main-container">
    ${navBarHtml}
    ${contentworkingWindow}
    </div>`
    document.body.innerHTML = mainWindow;
    document.getElementById('navigation-controls-sign-out').addEventListener('click', () => {
      renderLogInForm();
    });
    document.getElementById('navigation-controls-new-post').addEventListener('click', () => {

      //Rendering new post page
      document.body.style.backgroundColor = '#fff'; 
      //Nav Bar
      let content = createNavBar(user);
      //Categories select

      let categoriesElements = `
      <select  name="list_categories" id="list_categories">
      <option value="Add Category:">Add Category:</option>
      </select>
      <br>
      <ul id="selected_categories"></ul>
      `;

      //New Post Form
        content += `
          <div class="new-post-container">
            ${categoriesElements}
            <span id="new-post-error-message"></span>
            <textarea id="new-post-textarea" class="new-post-textarea" name="new-post" rows="10" placeholder="Type your post here..."></textarea> 
            <div class="new-post-submit-button-container">
              <input id="new-post-submit-button" class="new-post-submit-button" type="button" value="Post">
            </div>   
          </div>`;

          document.body.innerHTML = content;

          let j = guestData.categories;
          let listCategories = document.getElementById('list_categories');
          let options = `<option value="Add Category:">Add Category:</option>`;
          j.forEach(category => {
            options+=` <option value="${category}">${category}</option>`;
          });
          listCategories.innerHTML = options;

          document.getElementById('navigation-controls-sign-out').addEventListener('click', () => {
            renderLogInForm();
          });

          document.getElementById('navigation-controls-new-post').style.display = 'none';

          document.getElementById('new-post-submit-button').addEventListener('click', () => {
            let content = document.getElementById('new-post-textarea').value;
            let selectedCategories = document.getElementById('selected_categories').children;
            let categories = [];
            for(let i = 0; i< selectedCategories.length; i++){
              categories.push(selectedCategories[i].textContent.trim());
            }
            const d = new Date();
            const date = d.getTime();
            
            const id = posts.length === 0 ? 1 : posts[0].id + 1;

            const post = {
              id,
              user_id: user.id,
              nick_name: user.nick_name,
              number_of_comments: 0,
              date,
              content,
              categories
            }
            guestData.posts.push(post);
            renderGuestPage();
          }); 

          document.getElementById('list_categories').addEventListener('input', onInput);  
          document.getElementById('selected_categories').addEventListener('click', e => {
            if(e.target.tagName === 'li'){
              removeElementFromList(e.target.innerText);
            }
          });

          document.getElementById('navigation-controls-home').addEventListener('click', ()=>{
            renderGuestPage();
          });

   });

   document.getElementById('posts-container').addEventListener('click', (event)=>{
      
    let el = event.target;

    do{       
      if(el.className ==='post-container clickable-box'){
        let postId = el.dataset.id;
        if(postId){
          
          //Check if comment section is already open
          const commentsContainer = document.querySelector('.comments-container');
          if(commentsContainer){
            renderGuestPage();
            return;
          }            
          
          let postElement = el;
          //Rendering main page
          document.body.style.backgroundColor = '#fff';

          //Get comments
          let commentsHtml = '';
          let comments = [];        
          if(guestData.comments) {
            comments = (guestData.comments.filter(comment => comment.post_id == postId)).sort((a,b) => {
              if(a.date < b.date) {
                return 1;
              }
              return -1;
            });
            comments.forEach(comment => {
              commentsHtml += createCommentElement(comment)
            });
          }

          if(commentsHtml === ''){
              commentsHtml = 'No comments yet'
          }
          //Create comment section
          let newCommentElement = createNewCommentSection();

          let middleSection = `
              <div class="middle-section">            
                ${postElement.outerHTML}
                <div class="comments-container">${commentsHtml}</div> 
                <span id="new-comment-error"></span>                     
                <div class="new-comment-section">${newCommentElement}</div>         
              </div>     
          `;

          document.getElementById('posts-container').innerHTML = middleSection;

          document.getElementById('new-comment-submit-button').addEventListener('click', event=>{
            let content = document.getElementById('new-comment-textarea').value;
           
            const d = new Date();
            const date = d.getTime();            
            const id = comments.length === 0 ? 1 : comments[0].id + 1;
                      
            const comment = {
              id,
              post_id: parseInt(postId),
              user_id: user.id,
              user_nick_name: user.nick_name,
              date,
              content
            }
            guestData.comments.push(comment);
            guestData.posts.find(post => post.id == postId).number_of_comments += 1;
            renderGuestPage();

          });

          document.getElementById('navigation-controls-sign-out').addEventListener('click', () => {
            renderLogInForm();
          });

          document.getElementById('navigation-controls-home').addEventListener('click', ()=>{
            renderGuestPage();
          });

          break;
        }
      }
      const id = el.dataset.id;
      if(id) {
        renderGuestPage();
        break;
      }

      el = el.parentElement;
      if(el==null) break;
    }while(el.id !='posts-container')
  });

  document.getElementById('send-message-button').addEventListener('click', () =>{
    const textArea = document.getElementById('new-message-text-area');
    let content =textArea.value;
    let to_id = parseInt(document.getElementById('chat-messages').dataset.to_id);

    const date = (new Date()).getTime();    
    let id = 1;
    if(messages && messages.length > 0) {
      id = (messages.sort((a,b) => {
        if(a.id<b.id){
          return 1
        }
        return -1;
      }))[0].id + 1;
    }    

    const m = {      
        content,
        date,
        from_id: -1,
        from_nick_name : "Guest",
        id,
        to_id: to_id      
    }
    messages.push(m);

    const ms = messages.filter(ms => (ms.from_id === User.id && ms.to_id === to_id) || (ms.from_id === to_id && ms.to_id === User.id))
    console.log('ms ', ms)
    
    const data = {
      chat_mate_id: to_id,
      error: null,
      messages: ms,
      user_id: -1
    }
    const el = document.querySelector('#chat-messages');
    el.innerHTML = '';
    renderMessages(data);
    textArea.value = '';
  });

}