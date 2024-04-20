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
    <div class='admin-header'>
    <h1>Welcome Admin</h1>
    <input type='button' value='Sign Out' id='admin-signout-button'/>
    </div>
  
    <div class='admin-page-container'>
    <div id='users-panel'></div>
    <div id='posts-panel'></div>
    <div id='comments-panel'></div>
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

    const postsPanel = document.querySelector('#posts-panel');
    postsPanel.addEventListener('click', e => {       
        if(e.target.className === 'delete-post-button'){
            const id = e.target.parentElement.parentElement.dataset.id;
            deletePost(id);
        }
    });

    const commentsPanel = document.querySelector('#comments-panel');
    commentsPanel.addEventListener('click', e => {      
        if(e.target.className === 'delete-comment-button'){
            const id = e.target.parentElement.parentElement.dataset.id;
            deleteComment(id);
        }
    });

    const adminSignoutButton = document.querySelector('#admin-signout-button');
    adminSignoutButton.addEventListener('click', () => {
        //Remove session id
        let endpoint = host+"admin/signup?" + new URLSearchParams({session_id});
        let headers = new Headers();
        headers.append('Accept', 'application/json');
        fetch(
            endpoint, {
                method: 'DELETE',
                headers: headers
            }
        )
        .then(response => response.json())
        .then(data => {
            if(data.error) {
                console.log(data.error)
            } else {
                deleteCookie(session_id); 
                renderSignUpPage();  
            }
        })
        .catch(err => console.log(err));   
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
    
    //Get comments
    endpoint = host+"admin/comments?" + new URLSearchParams({session_id});
    headers = new Headers();
    headers.append('Accept', 'application/json');
    fetch(
        endpoint,
        {method: 'GET', headers: headers}
    )
    .then(response => response.json())
    .then(data => {
        console.log('data comments',data)
        if(data.error) {
            if(data.error.type === AUTHORIZATION){
                renderSignUpPage()
            }else {
                throw new Error(data.error)
            }
            return;            
        }
        if(data.payload) {
            data.payload.forEach(comment => renderCommentComponent(comment));
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
                Categories: ${post.categories}
                <br><br>    
                ${post.content}               
            </div>        
        </div>
    `;

    postsPanel.innerHTML += html;
}

function renderCommentComponent(comment) {
    const commentsPanel = document.querySelector('#comments-panel');

    const html = `
        <div class='comment-container' data-id='${comment.id}'>
            <div class='comment-header'>
                <div>
                ${comment.user_nick_name}
                <br>
                ${comment.date}
                </div>                
                <input type='button' value='Delete' class='delete-comment-button'/>            
            </div>
            <div class='comment-content'>
                ${comment.content}               
            </div>        
        </div>
    `;

    commentsPanel.innerHTML += html;
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

function deleteComment(id) {
    let session_id = getCookie(ADMIN_JSESSIONID);
    if (!session_id) {
        renderSignUpPage();
        return;
    }
    const endpoint = host+`admin/comments/${id}?` + new URLSearchParams({session_id});
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