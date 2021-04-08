document.getElementById("CreateBtn").addEventListener("click" , ()=> {

    document.getElementById("CreateActScreen").style.display = "block";
    document.getElementById("loginScreen").style.display = "none";
    document.getElementById("dashboard").style.display="none";
    // change to create account page
});





const validEmail=(emailDiv)=>{
    emailDiv.addEventListener("change",()=>{
        const EmailReg= /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        //https://stackoverflow.com/questions/46155/how-to-validate-an-email-address-in-javascript
        if(!EmailReg.test(emailDiv.value)){
            alert("Please input Email address with correct format(e.g. xxxxx@xxx.com)");
        }
    })
}




const ValidPassword=(PasswordDiv)=>{
    PasswordDiv.addEventListener("change",()=>{
        const PassReg= /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{6,}$/
        // password should only contain 6 characters from letter and digit;
        // and at least one digit and one lower case and one upper case;
        //https://stackoverflow.com/questions/14850553/javascript-regex-for-password-containing-at-least-8-characters-1-number-1-uppe
        if(!PasswordDiv.value.match(PassReg)){
            alert("password should includes 6 characters from letter and digit;\n" +
                "and needs to contain at least one digit and one lower case and one upper case.");
        }
    })

}




document.getElementById("SignUpBtn").addEventListener("click",()=> {
    const pass1Sign = document.getElementById("passSign");
    const pass2Sign = document.getElementById("ConPassSign");
    const email=document.getElementById("EmailAdd");
    ValidPassword(pass1Sign);
    validEmail(email);

    const SignBody = {
        "username": document.getElementById("userNameSign").value,
        "password": pass1Sign.value,
        "email": email.value,
        "name":document.getElementById("FName").value,
    };


    const resultSignup = fetch("http://localhost:5000/auth/signup", {
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify(SignBody),
        // body is my post to bd, data2 is its result
    }).then((data2) => {
        if (data2.status === 409) {
            alert("The username has been Taken :( please choose another one.")
        } else if (data2.status === 400) {
            alert("Please fill up your username and password.")
        } else if (pass1Sign.value !== pass2Sign.value) {
            alert("Two password doesn't match, Please set your password again :(")
        } else if (data2.status === 200) {
            alert("You have created an account in QuickPic successfully, Please login to QuickPic :)");
            document.getElementById("CreateActScreen").style.display = "none";
            document.getElementById("loginScreen").style.display = "block";
        }
    }).catch((error) => {
        console.log('Error: ', error);
    });
});



