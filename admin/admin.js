import {
    host,
    ADMIN_JSESSIONID,
    AUTHORIZATION
} from '../constants.js';

import {
    getCookie,
    setCookie,
    deleteCookie
  } from '../cookies.js';

const renderAdminPage = () => {

    let session_id = getCookie(ADMIN_JSESSIONID);

    if (!session_id) {
        renderSignUpPage();
        return;
    }
    const html = `
    <h1> Welcome Admin</h1>
    <div class='admin-page-container'>
    <div id='users-panel'></div>
    <div id='posts-panel'></div>
    </div>
    `;
    document.body.innerHTML = html;
    //Add Click listeners
    const usersPanel = document.querySelector('#users-panel');
    usersPanel.addEventListener('click', e => {
        if(e.target.className === 'delete-user-button'){
            const id = e.target.parentElement.parentElement.dataset.id
            deleteUser(id);
        }      
    });

    //Get users    
    let endpoint = host+"admin/users?" + new URLSearchParams({session_id});
    let headers = new Headers();
    headers.append('Accept', 'application/json');
    fetch(
        endpoint,
        {method: 'GET', headers: headers}
    )
    .then(response => response.json())
    .then(data => {
        console.log('data ',data)
        if(data.error) {
            if(data.error.type === AUTHORIZATION){
                renderSignUpPage()
            }else {
                throw new Error(data.error)
            }
            return;            
        }
        if(data.payload) {
            data.payload.forEach(user => renderUserComponent(user));
        }
    })
    .catch(err => console.log(err))

    //Get Posts
    endpoint = host+"admin/posts?" + new URLSearchParams({session_id});
    headers = new Headers();
    headers.append('Accept', 'application/json');
    fetch(
        endpoint,
        {method: 'GET', headers: headers}
    )
    .then(response => response.json())
    .then(data => {
        console.log('data posts',data)
        if(data.error) {
            if(data.error.type === AUTHORIZATION){
                renderSignUpPage()
            }else {
                throw new Error(data.error)
            }
            return;            
        }
        if(data.payload) {
            data.payload.forEach(post => renderPostComponent(post));
        }
    })
    .catch(err => console.log(err))
    
}

function renderSignUpPage() {
    const html = `
        <div class='admin-sign-in-container'>
        <h5>Admin signin</h5>        
        <input type='text' placeholder='e-mail' id='admin-sign-up-email'/>     
        <input type='password' placeholder='password' id='admin-sign-up-password'/>    
        <input type='button' value='Sign In' id='admin-sign-up-submit'/>    
        </div> 
    `
    document.body.innerHTML = html;

    const submitButton = document.querySelector('#admin-sign-up-submit');
    const email = document.querySelector('#admin-sign-up-email');
    const password = document.querySelector('#admin-sign-up-password');
    
    submitButton.addEventListener('click', () => {

    const endpoint = host+"admin/signup";
    let headers = new Headers();
    headers.append('Accept', 'application/json');
    headers.append('Content-Type','application/x-www-form-urlencoded');
    
    fetch(
        endpoint, {
            method: 'POST',
            headers: headers,
            body: new URLSearchParams({
                'email' : email.value,
                'password' : password.value
              })       
        }
    )
    .then(response => response.json())
    .then(data =>{        
        if(data.error){
            showSignUpError(data.error);
          }else{        
            setCookie(ADMIN_JSESSIONID, data.payload.session_id, 1);      
            renderAdminPage();       
          }
    })
    .catch(err => console.log(err));
       
    });

}

function showSignUpError(error) {
    console.log(error)
}

function renderUserComponent(user) {

    const usersPanel = document.querySelector('#users-panel');
    const html = `
        <div class='user-container' data-id='${user.id}'>
            <div class='user-content'>
                ${user.nick_name} 
                <input type='button' value='Delete' class='delete-user-button'/>
            </div>        
        </div>
    `;

    usersPanel.innerHTML += html;  

}

function renderPostComponent(post) {
    const postsPanel = document.querySelector('#posts-panel');

    const html = `
        <div class='post-container' data-id='${post.id}'>
            <div class='post-header'>
                <div>
                    ${post.nick_name}
                    <br>
                    ${post.date}
                </div>                
                <input type='button' value='Delete' class='delete-post-button'/>            
            </div>
            <div class='post-content'>             
                ${post.content}               
            </div>        
        </div>
    `;

    postsPanel.innerHTML += html;
}

function deleteUser(id) { 
    
    let session_id = getCookie(ADMIN_JSESSIONID);
    if (!session_id) {
        renderSignUpPage();
        return;
    }
    const endpoint = host+`admin/users/${id}?` + new URLSearchParams({session_id});
    let headers = new Headers();
    headers.append('Accept', 'application/json');
    fetch(
        endpoint, {
            method: 'DELETE',
            headers: headers}
        )
    .then(resp => resp.json())
    .then(data => console.log(data))
    .catch(err => console.log(err));
}

function deletePost(id){
    let session_id = getCookie(ADMIN_JSESSIONID);
    if (!session_id) {
        renderSignUpPage();
        return;
    }
    const endpoint = host+`admin/posts/${id}?` + new URLSearchParams({session_id});
    let headers = new Headers();
    headers.append('Accept', 'application/json');
    fetch(
        endpoint, {
            method: 'DELETE',
            headers: headers}
        )
    .then(resp => resp.json())
    .then(data => console.log(data))
    .catch(err => console.log(err));
}


renderAdminPage();