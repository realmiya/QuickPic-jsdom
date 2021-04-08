// A helper you may want to use when uploading new images to the server.
import {
    fetchUserFeed,
    fileToDataUrl,
    showProfile,
    LikePartFunction,
    ReturnAuthor,
    ReturnImg,
    ReturnPostTime, FetchUserInfo, FetchInfoViaID, CommentPartFunction
} from './helpers.js';



// This url may need to change depending on what port your backend is running
// on.

let userToken = undefined;
let CurrentUserName= undefined;
let p=0;
let n=10;


const hideFeed=()=>{
    document.getElementById("loginScreen").style.display="block";
    document.getElementById("dashboard").style.display="none";

}

document.getElementById("LogoutButton").addEventListener("click",()=>{
    hideFeed();
    document.cookie="token=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
    document.getElementById("LoginName").value = "";
    document.getElementById("password").value = "";
    document.getElementById("CreateActScreen").style.display="none";



    ////?????
    const needToRemove=document.getElementsByClassName("newDivPostClass");
    while(needToRemove[0]) {
        needToRemove[0].parentNode.removeChild(needToRemove[0]);
    }
});


document.getElementById("loginButton").addEventListener("click" , ()=> {
    const loginBody = {
        "username": document.getElementById("LoginName").value,
        "password": document.getElementById("password").value,
    };
    CurrentUserName= document.getElementById("LoginName").value;
    const result = fetch("http://localhost:5000/auth/login", {
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
        },
        body: JSON.stringify(loginBody),
    }).then((data) => {
        if (data.status === 403) {// login failed， Forbidden
            alert("Incorrect password or username :(")
        }else if(data.status === 400){
            alert("Please fill up your username and password :)")
        } else if (data.status === 200) {
            // alert("Logged in successfully :)");
            data.json().then(result => {
                CurrentUserName= document.getElementById("username").value;
                document.cookie = "Token="+result.token+"+"+ CurrentUserName;
                document.getElementById("token").innerText = "Your token :" + result.token;
                document.getElementById("CurrentUsernameISWho").innerText = "Your username :" + CurrentUserName;
                userToken=result.token;
                console.log(userToken);
                showFeed(p,n);
            })
        }console.log(data);
        }).catch((error) => {
        console.log('Error: ', error);
    });
});//addEvent end

document.getElementById("CreateStory").addEventListener("click", ()=>{
    document.getElementById("StoryScreen").style.display="block";

})

document.getElementById('ImageUpload').addEventListener("change",()=>{
    const file = document.querySelector('input[type=file]').files[0];
    const url= fileToDataUrl(file);// console.log(url); it is pending, so we need .then() get urlData to use.
    url.then(urlData=>{
        const
            Data=urlData.split(",")[1];
        const StoryBody={
            "description_text":document.getElementById("description_text").value,
            "src":Data,}
        console.log(document.getElementById("description_text").value);
        document.getElementById("PostMyStory").addEventListener("click",()=>{
            const Createstory=fetch("http://127.0.0.1:5000/post/", {
                method: "POST",
                headers: {
                    "Accept": "application/json",
                    "Content-Type": "application/json",
                    "Authorization": "Token " + userToken,
                },
                body: JSON.stringify(StoryBody),
            }).then(data=>{
                if(data.status===200){
                    alert("You made a posted successfully!");
                }else if(data.status===403){
                    alert("Invalid Auth Token")

                }else if(data.status===400){
                    alert("Malformed Request / Image could not be processed")
                }
            }).then(window.location.reload())
        })
    })
})





document.getElementById("closePostAction").onclick=function(){
    document.getElementById("StoryScreen").style.display = "none";
}

const loadFeed=(p,n)=>{
    const resultFirst=fetchUserFeed(userToken,p,n);
    resultFirst.then((dataPost) => {
        dataPost.json().then((resultFeed) => {
            console.log(userToken);
            console.log(resultFeed);
            const CurrentLenOfFeed=resultFeed.posts.length;
            if (CurrentLenOfFeed !== 0) {
                for (let i=0;i<resultFeed.posts.length;i++){//for each post:

                    const newDivPost = document.createElement("section");
                    // newDivPost.idName="newDivPost"+i;
                    newDivPost.className="newDivPostClass";
                    // newDivPost.className="card";
                    const DashBoardDiv=document.getElementById("dashboard");
                    DashBoardDiv.appendChild(newDivPost);

                    const newDivImg =ReturnImg(resultFeed,i);
                    newDivPost.appendChild(newDivImg);
                    //show the img in the post

                    //make a authorDIV (by who(author) + at time)
                    const newDivWho= ReturnAuthor(resultFeed,i);
                    const PostTime=ReturnPostTime(resultFeed,i);
                    const authorDiv=document.createElement("div");
                    authorDiv.appendChild(newDivWho);
                    authorDiv.appendChild(PostTime);
                    authorDiv.className="authorDivFlex";
                    // authorDiv.setAttribute("id", "authorDivFlex"+i);
                    const AuthorTitle=document.createElement("div");
                    AuthorTitle.innerText="Posted by ";
                    PostTime.className="Time";
                    newDivWho.className="Who";
                    newDivPost.appendChild(AuthorTitle);

                    newDivPost.appendChild(authorDiv);//authorDiv包着两，加入newDivPost

                    // post Owner's profile
                    newDivWho.addEventListener("click",function(){
                        showProfile(newDivWho,userToken,CurrentUserName);
                    });


                    const newDivDisc = document.createElement("div");
                    newDivDisc.className="Describe";
                    newDivDisc.innerText=resultFeed['posts'][i]['meta']['description_text'];
                    newDivPost.appendChild(newDivDisc);


                    // LeaveCommentPart(newDivPost,userToken,CurrentUserName, newDivComment,LenOfComment, newDivCommentBlock,resultFeed['posts'],i)
                    CommentPartFunction(newDivPost,resultFeed['posts'],i,userToken,CurrentUserName);
                    LikePartFunction(resultFeed['posts'],i, newDivPost,userToken,CurrentUserName )


                }//这个胡括号是给每个post的statement
                //////
                // notification(CurrentUserName, userToken);
            }//这个是给如果有多个post的statement
        })//这是拿到datapost.jason之后的then（的下一个括号
    })//这是json之前，拿到dataPost的response之后的
}



const showFeed=(p,n)=>{
    document.getElementById("loginScreen").style.display="none";
    document.getElementById("dashboard").style.display="block";
    loadFeed(p,n);

}


const SettingBtn=document.getElementById("Setting")
SettingBtn.addEventListener("click",()=>{
    document.getElementById("EditProfileScreen").style.display="block";

    document.getElementById("closeSetting").onclick=function(){
        document.getElementById("EditProfileScreen").style.display = "none";
    }

    const title=document.createElement("h2");
    title.innerText=CurrentUserName;
    title.className="text-center"
    console.log(document.getElementById("change").childNodes);
    document.getElementById("change").childNodes[1].replaceWith(title);



    const emailDiv= document.getElementById("ChangeEmail");
    validEmail(emailDiv);

    const passwordDiv=document.getElementById("ChangePass");
    ValidPassword(passwordDiv);


    const pass2=document.getElementById("ChangePass2");
    if(passwordDiv.value!==pass2.value){
        alert("Please check your two passwords, they are not the same.")
    }




    document.getElementById("UpdateBTN").addEventListener("click",()=>{

        const SettingBody = {
            "email":emailDiv.value,
            "name":passwordDiv.value,
            "password": document.getElementById("ChangePass").value,
        };


        const UP = fetch("http://localhost:5000/user", {
            method: "PUT",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json",
                "Authorization": "Token " + userToken,
            },
            body: JSON.stringify(SettingBody),
        }).then(data=>{
            if(data.status===200){
                alert("You Updated your profile successfully!")
            }else if(data.status===200){
                alert("please fill up your information")
            }
            else{throw new Error("Some error happened")
            }
        }).catch((error) => {
            console.log(error);
        }).then(window.location.reload())
    })
})
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



function notification(CurrentUserName, userToken) {
    // new Promise(resolve => {
        setInterval(function () {
            const promise=[];

            const currentUser = FetchUserInfo(CurrentUserName, userToken);
            currentUser.then(data => {
                data.json().then(res => {
                    const followingList = res["following"];
                    const len = followingList.length

                    for (let i = 0; i < len; i++) {
                        const result = FetchInfoViaID(followingList[i], userToken)
                        promise.push(result);
                        Promise.all(promise).then(res => {
                            Promise.all(res.map(eachRes => eachRes.json())).then(
                                data => console.log(data)
                            )
                        })
                    }
                })
            })},5000);
}





const InfiniteScroll=()=>{
    console.log(window.innerHeight);
    console.log(window.pageYOffset,document.body.scrollHeight);
    // if(!document.getElementsByClassName("newDivPostClass")[0]) {
    //     return;
    // }

    if(window.pageYOffset+window.innerHeight+150<=document.body.scrollHeight){
        return;//not enough scroll,will not make infinite scroll.
    }
    window.addEventListener("scroll",()=>{
        if(window.pageYOffset+window.innerHeight+150>document.body.scrollHeight){//source from:https://www.youtube.com/watch?v=xHm6AbNwAw8
            p=p+8;
            console.log(p,n);
            console.log(userToken);
            showFeed(p,n);
        }
    })
}



if(document.cookie){

    // document.cookie = "Token="+result.token+"+"+ CurrentUserName;
    userToken=document.cookie.split("=")[1].split("+")[0];
    CurrentUserName=document.cookie.split("+")[1];
    console.log(userToken);
    p=0;
    n=10;
    showFeed(p,n);
    InfiniteScroll();
}






























