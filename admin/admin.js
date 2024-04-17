import {
    host,
    ADMIN_JSESSIONID
} from '../constants.js';


const renderAdminPage = () => {

    let session_id = getCookie(ADMIN_JSESSIONID);

    if (!session_id) {
        renderSignUpPage();
        return;
    }
    //Get users
    const endpoint = host+"admin/users?" + new URLSearchParams({session_id});
    let headers = new Headers();
    headers.append('Accept', 'application/json');
    fetch(
        endpoint,
        {method: 'GET', headers: headers}
    )
    .then(response => response.json())
    .then(data => console.log(data))
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
            setCookie(ADMIN_JSESSIONID, data.payload.user.session_id, 1);      
            renderAdminPage();       
          }
    })
    .catch(err => console.log(err));
        console.log(err)
    });

}

function showSignUpError(error) {
    console.log(error)
}


renderAdminPage();