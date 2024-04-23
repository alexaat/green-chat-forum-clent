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

let users;
let posts;
let comments;

let filterUserId = undefined;
let filterPostId = undefined;

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
        <div class='panel-container'>
            <h4>Users</h4>
            <div id='users-panel'></div>
        </div>
        <div class='panel-container'>
            <h4>Posts</h4>
            <div id='posts-panel'></div>
        </div>
        <div class='panel-container'>
            <h4>Comments</h4>
            <div id='comments-panel'></div>
        </div>
    </div>
    `;
    document.body.innerHTML = html;
    
    //Add Click listeners
    const usersPanel = document.querySelector('#users-panel');
    usersPanel.addEventListener('click', e => {
        if(e.target.className === 'delete-user-button'){
            const id = e.target.parentElement.parentElement.dataset.id
            deleteUser(id);
        } else if (e.target.className === 'user-content'){
            if(e.target.parentElement.classList.contains('active')) {
                e.target.parentElement.classList.remove('active');
                
                filterUserId = undefined;
                renderPosts(filterPosts());                
                renderComments(filterComments());      
         
            } else {
                //Remove all active before set one active
                const elements = document.querySelectorAll('.user-container');
                elements.forEach(element => element.classList.remove('active'));
                e.target.parentElement.classList.add('active');

                filterUserId = e.target.parentElement.dataset.id; 
                renderPosts(filterPosts());                
                renderComments(filterComments());                   
           
            }
         
        } else if (e.target.className === 'ban-user-button') {
            const banButton = e.target;   
            const id = banButton.parentElement.parentElement.dataset.id;

            const status = users.filter(user => user.id === parseInt(id))[0].status
            const isBanned = status === 'banned'


            banButton.addEventListener('click', () => {
                let endpoint = host+`admin/users/${id}?` + new URLSearchParams({session_id});
                let headers = new Headers();
                headers.append('Accept', 'application/json');
                headers.append('Content-Type','application/x-www-form-urlencoded');
                fetch(
                    endpoint, {
                        method: 'PATCH',
                        headers: headers,
                        body: new URLSearchParams({
                            'ban' : !isBanned                    
                          })
                    }
                )
                .then(response => response.json())
                .then(data => {
                    if(data.error) {
                        console.log(data.error)
                    } else {               
                        renderAdminPage(); 
                    }
                })
                .catch(err => console.log(err));   
            });
        }     
    });

    const postsPanel = document.querySelector('#posts-panel');
    postsPanel.addEventListener('click', e => {  
        if(e.target.className === 'delete-post-button'){
            const id = e.target.parentElement.parentElement.dataset.id;
            deletePost(id);
        } else {
            //Get Post id
            let postContainer = e.target
           
            while (!postContainer.classList.contains('post-container')){
                postContainer = postContainer.parentElement;                
            }
            const id = postContainer.dataset.id;
            if (postContainer.classList.contains('active')){
                postContainer.classList.remove('active');
                filterPostId = undefined
            }else {
                //De-select posts
                const elements = document.querySelectorAll('.post-container');
                elements.forEach(element => element.classList.remove('active'));
                postContainer.classList.add('active');
                filterPostId = id;
            }
            renderComments(filterComments());
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

   
    fetchData();    
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
    
    let ban = 'Ban';
    if (user.status && user.status === 'banned') {
        ban = 'Un-ban';
    }  
    
    const html = `
        <div class='user-container' data-id='${user.id}'>
            <div class='user-content'>
                ${user.nick_name} 

                <input type='button' value='${ban}' class='ban-user-button'/>
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
                    <div class='date'>
                        ${dateFormat(post.date)}
                    </div>
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

    console.log('comment ',comment)

    const html = `
        <div class='comment-container' data-id='${comment.id}'>
            <div class='comment-header'>
                <div>
                ${comment.user_nick_name}
                <br>
                <div class='date'>
                    ${dateFormat(comment.date)}
                </div>
                </div>                
                <input type='button' value='Delete' class='delete-comment-button'/>            
            </div>
            <div class='comment-content'>
                ${comment.content}               
            </div>
            <div class='post-info'>
                <div class='post-info-header'>Post Info</div>
                Post Id: ${comment.post_id}
                <br>
                Post Date: ${dateFormat(posts.filter(post => post.id === comment.post_id)[0].date)}
                <br>
                Post Content: ${posts.filter(post => post.id === comment.post_id)[0].content}
               
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

function fetchData(){
    let session_id = getCookie(ADMIN_JSESSIONID);

    if (!session_id) {
        renderSignUpPage();
        return;
    }

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
            users = data.payload;
            renderUsers(users);           
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
            posts = data.payload;
            renderPosts(posts);            
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
            comments = data.payload;
            renderComments(comments);           
        }
    })
    .catch(err => console.log(err))
}

function renderUsers(users) {
    users.forEach(user => renderUserComponent(user));
}

function renderPosts(posts) {
    const postsPanel = document.querySelector('#posts-panel');
    postsPanel.innerHTML = '';
    posts.forEach(post => renderPostComponent(post));
}

function renderComments(comments) {
    
    const commentsPanel = document.querySelector('#comments-panel');
    commentsPanel.innerHTML = '';
    comments.forEach(comment => renderCommentComponent(comment));
}

function dateFormat(date) {
    return (new Date(date)).toUTCString().slice(0, -3);
}

function filterPosts(){
    let filtered = posts;
    if(filterUserId) {
        filtered = filtered.filter(post => post.user_id === parseInt(filterUserId)); 
    }
    return filtered;
}

function filterComments() {
    let filtered = comments;

    const filteredPosts = filterPosts();

    if(filterUserId) {
        filtered = filtered.filter(comment => {                   
            for(let i = 0 ; i< filteredPosts.length; i++) {
                const post = filteredPosts[i];
                if (comment.post_id === post.id) {
                    return true;
                }
            }
            return false;
        })
    }

    if(filterPostId) {
        filtered = filtered.filter(comment => comment.post_id == filterPostId)
    }

    return filtered;
}

renderAdminPage();